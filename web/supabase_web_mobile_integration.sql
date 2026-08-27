-- MindForce Grip / QualyTech
-- Integracion web + movil sobre Supabase (Auth + datos clinicos)
-- Ejecutar en Supabase SQL Editor.

create extension if not exists pgcrypto;

-- =========================================================
-- 0) Estado web (reemplazo de localStorage)
-- =========================================================
create table if not exists public.web_app_state (
  state_key text primary key,
  state_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.web_app_state
  add column if not exists state_value jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();


-- =========================================================
-- 1) Roles y perfiles base
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'terapeuta', 'paciente')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.terapeutas (
  id_terapeuta uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  username text,
  first_names text,
  last_name_paternal text,
  last_name_maternal text,
  professional_license text,
  curp text,
  birth_date date,
  email text not null unique,
  telefono text,
  address text,
  especializacion text,
  certifications text,
  experience_years integer,
  institution text,
  health_license text,
  emergency_contact text,
  emergency_phone text,
  estatus text not null default 'Activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.terapeutas
  add column if not exists nombre_completo text,
  add column if not exists username text,
  add column if not exists first_names text,
  add column if not exists last_name_paternal text,
  add column if not exists last_name_maternal text,
  add column if not exists professional_license text,
  add column if not exists curp text,
  add column if not exists birth_date date,
  add column if not exists email text,
  add column if not exists telefono text,
  add column if not exists address text,
  add column if not exists especializacion text,
  add column if not exists certifications text,
  add column if not exists experience_years integer,
  add column if not exists institution text,
  add column if not exists health_license text,
  add column if not exists emergency_contact text,
  add column if not exists emergency_phone text,
  add column if not exists estatus text not null default 'Activo',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_terapeutas_username on public.terapeutas(username);

-- Normalizacion y backfill de usernames legacy para login de terapeutas.
with username_base as (
  select
    t.id_terapeuta,
    lower(
      regexp_replace(
        coalesce(
          nullif(btrim(t.username), ''),
          nullif(split_part(coalesce(t.email, ''), '@', 1), ''),
          'terapeuta_' || right(replace(t.id_terapeuta::text, '-', ''), 6)
        ),
        '[^a-z0-9_.-]',
        '',
        'g'
      )
    ) as base_username
  from public.terapeutas t
),
username_ranked as (
  select
    ub.id_terapeuta,
    case
      when nullif(ub.base_username, '') is null then
        'terapeuta_' || right(replace(ub.id_terapeuta::text, '-', ''), 6)
      else ub.base_username
    end as safe_username,
    row_number() over (
      partition by case
        when nullif(ub.base_username, '') is null then
          'terapeuta_' || right(replace(ub.id_terapeuta::text, '-', ''), 6)
        else ub.base_username
      end
      order by ub.id_terapeuta
    ) as seq
  from username_base ub
)
update public.terapeutas t
set username =
  case
    when ur.seq = 1 then left(ur.safe_username, 40)
    else
      left(
        ur.safe_username,
        greatest(4, 40 - length(ur.seq::text) - 1)
      ) || '.' || ur.seq::text
  end
from username_ranked ur
where t.id_terapeuta = ur.id_terapeuta;

create unique index if not exists uq_terapeutas_username_lower
  on public.terapeutas ((lower(username)))
  where username is not null;

-- Compatibilidad: en esquemas legacy pueden existir columnas NOT NULL adicionales
-- que no forman parte del formulario web. Esto evita error 23502 al crear/actualizar.
do $$
declare
  v_col record;
begin
  for v_col in
    select c.column_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'terapeutas'
      and c.is_nullable = 'NO'
      and c.column_name not in ('id_terapeuta', 'nombre_completo', 'email', 'estatus', 'created_at', 'updated_at')
  loop
    execute format('alter table public.terapeutas alter column %I drop not null;', v_col.column_name);
  end loop;
end
$$;

-- =========================================================
-- 2) Tabla central de pacientes (compat web + movil)
-- =========================================================
create table if not exists public.pacientes (
  id_paciente uuid primary key references auth.users(id) on delete cascade,
  id_terapeuta uuid references public.terapeutas(id_terapeuta) on delete set null,
  nombre_completo text not null,
  first_names text,
  last_name_paternal text,
  last_name_maternal text,
  email text not null unique,
  telefono text,
  address text,
  diagnostico text,
  fecha_nacimiento date,
  dominant_hand text,
  pain_level integer,
  emergency_contact text,
  emergency_phone text,
  medical_history text,
  comorbidities text,
  medications text,
  allergies text,
  functional_limitations text,
  therapy_goals text,
  preferences text,
  contraindications text,
  max_force integer,
  adherence integer,
  progress integer,
  nivel_rehabilitacion text not null default 'Inicial',
  fuerza_actual_pct integer not null default 0,
  racha_dias integer not null default 0,
  sesiones_completadas integer not null default 0,
  sesiones_totales integer not null default 0,
  progreso_semanal numeric(5,2) not null default 0,
  ultima_sesion timestamptz,
  estado text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pacientes_fuerza_range check (fuerza_actual_pct between 0 and 100)
);

alter table public.pacientes
  add column if not exists id_terapeuta uuid,
  add column if not exists nombre_completo text,
  add column if not exists first_names text,
  add column if not exists last_name_paternal text,
  add column if not exists last_name_maternal text,
  add column if not exists email text,
  add column if not exists telefono text,
  add column if not exists address text,
  add column if not exists diagnostico text,
  add column if not exists fecha_nacimiento date,
  add column if not exists dominant_hand text,
  add column if not exists pain_level integer,
  add column if not exists emergency_contact text,
  add column if not exists emergency_phone text,
  add column if not exists medical_history text,
  add column if not exists comorbidities text,
  add column if not exists medications text,
  add column if not exists allergies text,
  add column if not exists functional_limitations text,
  add column if not exists therapy_goals text,
  add column if not exists preferences text,
  add column if not exists contraindications text,
  add column if not exists max_force integer,
  add column if not exists adherence integer,
  add column if not exists progress integer,
  add column if not exists nivel_rehabilitacion text not null default 'Inicial',
  add column if not exists fuerza_actual_pct integer not null default 0,
  add column if not exists racha_dias integer not null default 0,
  add column if not exists sesiones_completadas integer not null default 0,
  add column if not exists sesiones_totales integer not null default 0,
  add column if not exists progreso_semanal numeric(5,2) not null default 0,
  add column if not exists ultima_sesion timestamptz,
  add column if not exists estado text not null default 'activo',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_pacientes_terapeuta on public.pacientes(id_terapeuta);
create index if not exists idx_pacientes_email on public.pacientes(email);

-- =========================================================
-- 3) Citas y sesiones
-- =========================================================
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  id_paciente uuid not null references public.pacientes(id_paciente) on delete cascade,
  id_terapeuta uuid references public.terapeutas(id_terapeuta) on delete set null,
  inicio timestamptz not null,
  fin timestamptz,
  tipo text default 'General',
  modalidad text default 'Presencial',
  estado text not null default 'Programada',
  ubicacion text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.citas
  add column if not exists id_paciente uuid,
  add column if not exists id_terapeuta uuid,
  add column if not exists inicio timestamptz,
  add column if not exists fin timestamptz,
  add column if not exists tipo text default 'General',
  add column if not exists modalidad text default 'Presencial',
  add column if not exists estado text not null default 'Programada',
  add column if not exists ubicacion text,
  add column if not exists notas text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_citas_paciente_inicio on public.citas(id_paciente, inicio);

create table if not exists public.sesiones_rehabilitacion (
  id uuid primary key default gen_random_uuid(),
  id_paciente uuid not null references public.pacientes(id_paciente) on delete cascade,
  id_terapeuta uuid references public.terapeutas(id_terapeuta) on delete set null,
  fecha_programada timestamptz not null,
  estado text not null default 'Pendiente',
  fuerza_promedio numeric(7,2) default 0,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sesiones_rehabilitacion
  add column if not exists id_paciente uuid,
  add column if not exists id_terapeuta uuid,
  add column if not exists fecha_programada timestamptz,
  add column if not exists estado text not null default 'Pendiente',
  add column if not exists fuerza_promedio numeric(7,2) default 0,
  add column if not exists notas text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_sesiones_paciente_fecha on public.sesiones_rehabilitacion(id_paciente, fecha_programada);

-- =========================================================
-- 4) Timestamp trigger comun
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_terapeutas_updated_at on public.terapeutas;
create trigger trg_terapeutas_updated_at
before update on public.terapeutas
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_pacientes_updated_at on public.pacientes;
create trigger trg_pacientes_updated_at
before update on public.pacientes
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_citas_updated_at on public.citas;
create trigger trg_citas_updated_at
before update on public.citas
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_sesiones_updated_at on public.sesiones_rehabilitacion;
create trigger trg_sesiones_updated_at
before update on public.sesiones_rehabilitacion
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_web_app_state_updated_at on public.web_app_state;
create trigger trg_web_app_state_updated_at
before update on public.web_app_state
for each row execute procedure public.set_updated_at();

-- =========================================================
-- 5) Auto-provisionamiento al crear usuario en Auth
--    Esto permite: terapeuta crea paciente en web -> login movil inmediato.
-- =========================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_full_name text;
  v_phone text;
  v_diagnosis text;
  v_birth_date date;
  v_experience_years integer;
  v_rows_affected integer;
begin
  v_role := lower(trim(coalesce(new.raw_user_meta_data ->> 'role', 'paciente')));
  if v_role not in ('admin', 'terapeuta', 'paciente') then
    v_role := 'paciente';
  end if;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  v_phone := nullif(new.raw_user_meta_data ->> 'phone', '');
  v_diagnosis := nullif(new.raw_user_meta_data ->> 'diagnosis', '');

  v_birth_date := null;
  if coalesce(new.raw_user_meta_data ->> 'birth_date', '') ~ '^\d{4}-\d{2}-\d{2}$' then
    v_birth_date := (new.raw_user_meta_data ->> 'birth_date')::date;
  end if;

  v_experience_years := null;
  if coalesce(new.raw_user_meta_data ->> 'experience_years', '') ~ '^\d+$' then
    v_experience_years := (new.raw_user_meta_data ->> 'experience_years')::integer;
  end if;

  insert into public.profiles (id, full_name, email, phone)
  values (new.id, v_full_name, new.email, v_phone)
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  if v_role = 'terapeuta' then
    update public.terapeutas
    set nombre_completo = v_full_name,
        username = coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), username),
        first_names = coalesce(nullif(new.raw_user_meta_data ->> 'first_names', ''), first_names),
        last_name_paternal = coalesce(nullif(new.raw_user_meta_data ->> 'last_name_paternal', ''), last_name_paternal),
        last_name_maternal = coalesce(nullif(new.raw_user_meta_data ->> 'last_name_maternal', ''), last_name_maternal),
        professional_license = coalesce(nullif(new.raw_user_meta_data ->> 'professional_license', ''), professional_license),
        curp = coalesce(nullif(new.raw_user_meta_data ->> 'curp', ''), curp),
        birth_date = coalesce(v_birth_date, birth_date),
        email = new.email,
        telefono = coalesce(v_phone, telefono),
        address = coalesce(nullif(new.raw_user_meta_data ->> 'address', ''), address),
        especializacion = coalesce(nullif(new.raw_user_meta_data ->> 'specialization', ''), especializacion),
        certifications = coalesce(nullif(new.raw_user_meta_data ->> 'certifications', ''), certifications),
        experience_years = coalesce(v_experience_years, experience_years),
        institution = coalesce(nullif(new.raw_user_meta_data ->> 'institution', ''), institution),
        health_license = coalesce(nullif(new.raw_user_meta_data ->> 'health_license', ''), health_license),
        emergency_contact = coalesce(nullif(new.raw_user_meta_data ->> 'emergency_contact', ''), emergency_contact),
        emergency_phone = coalesce(nullif(new.raw_user_meta_data ->> 'emergency_phone', ''), emergency_phone),
        estatus = coalesce(estatus, 'Activo'),
        updated_at = now()
    where id_terapeuta = new.id;

    get diagnostics v_rows_affected = row_count;

    if v_rows_affected = 0 then
      insert into public.terapeutas (
      id_terapeuta,
      nombre_completo,
      username,
      first_names,
      last_name_paternal,
      last_name_maternal,
      professional_license,
      curp,
      birth_date,
      email,
      telefono,
      address,
      especializacion,
      certifications,
      experience_years,
      institution,
      health_license,
      emergency_contact,
      emergency_phone,
      estatus
    ) values (
      new.id,
      v_full_name,
      nullif(new.raw_user_meta_data ->> 'username', ''),
      nullif(new.raw_user_meta_data ->> 'first_names', ''),
      nullif(new.raw_user_meta_data ->> 'last_name_paternal', ''),
      nullif(new.raw_user_meta_data ->> 'last_name_maternal', ''),
      nullif(new.raw_user_meta_data ->> 'professional_license', ''),
      nullif(new.raw_user_meta_data ->> 'curp', ''),
      v_birth_date,
      new.email,
      v_phone,
      nullif(new.raw_user_meta_data ->> 'address', ''),
      nullif(new.raw_user_meta_data ->> 'specialization', ''),
      nullif(new.raw_user_meta_data ->> 'certifications', ''),
      v_experience_years,
      nullif(new.raw_user_meta_data ->> 'institution', ''),
      nullif(new.raw_user_meta_data ->> 'health_license', ''),
      nullif(new.raw_user_meta_data ->> 'emergency_contact', ''),
      nullif(new.raw_user_meta_data ->> 'emergency_phone', ''),
      'Activo'
      )
      on conflict (email) do update
    set nombre_completo = excluded.nombre_completo,
        username = coalesce(excluded.username, public.terapeutas.username),
        first_names = coalesce(excluded.first_names, public.terapeutas.first_names),
        last_name_paternal = coalesce(excluded.last_name_paternal, public.terapeutas.last_name_paternal),
        last_name_maternal = coalesce(excluded.last_name_maternal, public.terapeutas.last_name_maternal),
        professional_license = coalesce(excluded.professional_license, public.terapeutas.professional_license),
        curp = coalesce(excluded.curp, public.terapeutas.curp),
        birth_date = coalesce(excluded.birth_date, public.terapeutas.birth_date),
        email = excluded.email,
        telefono = coalesce(excluded.telefono, public.terapeutas.telefono),
        address = coalesce(excluded.address, public.terapeutas.address),
        especializacion = coalesce(excluded.especializacion, public.terapeutas.especializacion),
        certifications = coalesce(excluded.certifications, public.terapeutas.certifications),
        experience_years = coalesce(excluded.experience_years, public.terapeutas.experience_years),
        institution = coalesce(excluded.institution, public.terapeutas.institution),
        health_license = coalesce(excluded.health_license, public.terapeutas.health_license),
        emergency_contact = coalesce(excluded.emergency_contact, public.terapeutas.emergency_contact),
        emergency_phone = coalesce(excluded.emergency_phone, public.terapeutas.emergency_phone),
        updated_at = now();
    end if;
  end if;

  if v_role = 'paciente' then
    update public.pacientes
    set nombre_completo = v_full_name,
        email = new.email,
        telefono = coalesce(v_phone, telefono),
        diagnostico = coalesce(v_diagnosis, diagnostico),
        updated_at = now()
    where id_paciente = new.id;

    get diagnostics v_rows_affected = row_count;

    if v_rows_affected = 0 then
      insert into public.pacientes (
      id_paciente,
      nombre_completo,
      email,
      telefono,
      diagnostico,
      nivel_rehabilitacion,
      fuerza_actual_pct,
      racha_dias,
      sesiones_completadas,
      sesiones_totales,
      progreso_semanal,
      ultima_sesion,
      estado
    ) values (
      new.id,
      v_full_name,
      new.email,
      v_phone,
      v_diagnosis,
      'Inicial',
      0,
      0,
      0,
      0,
      0,
      null,
      'activo'
      )
      on conflict (email) do update
    set nombre_completo = excluded.nombre_completo,
        email = excluded.email,
        telefono = coalesce(excluded.telefono, public.pacientes.telefono),
        diagnostico = coalesce(excluded.diagnostico, public.pacientes.diagnostico),
        updated_at = now();
    end if;
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_auth_user failed for user % (%): %', new.id, new.email, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- =========================================================
-- 6) RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.terapeutas enable row level security;
alter table public.pacientes enable row level security;
alter table public.citas enable row level security;
alter table public.sesiones_rehabilitacion enable row level security;
alter table public.web_app_state enable row level security;

drop policy if exists web_app_state_select on public.web_app_state;
create policy web_app_state_select
on public.web_app_state
for select
to anon, authenticated
using (true);

drop policy if exists web_app_state_insert on public.web_app_state;
create policy web_app_state_insert
on public.web_app_state
for insert
to anon, authenticated
with check (true);

drop policy if exists web_app_state_update on public.web_app_state;
create policy web_app_state_update
on public.web_app_state
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists web_app_state_delete on public.web_app_state;
create policy web_app_state_delete
on public.web_app_state
for delete
to anon, authenticated
using (true);

create or replace function public.has_role(check_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = check_role
  );
$$;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- user_roles
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

-- terapeutas
drop policy if exists terapeutas_select_auth on public.terapeutas;
create policy terapeutas_select_auth
on public.terapeutas
for select
to authenticated
using (true);

drop policy if exists terapeutas_write_admin on public.terapeutas;
create policy terapeutas_write_admin
on public.terapeutas
for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists terapeutas_anon_crud on public.terapeutas;
create policy terapeutas_anon_crud
on public.terapeutas
for all
to anon
using (true)
with check (true);

drop policy if exists terapeutas_authenticated_crud on public.terapeutas;
create policy terapeutas_authenticated_crud
on public.terapeutas
for all
to authenticated
using (true)
with check (true);

-- pacientes
drop policy if exists pacientes_select_own on public.pacientes;
create policy pacientes_select_own
on public.pacientes
for select
to authenticated
using (id_paciente = auth.uid());

drop policy if exists pacientes_update_own on public.pacientes;
create policy pacientes_update_own
on public.pacientes
for update
to authenticated
using (id_paciente = auth.uid())
with check (id_paciente = auth.uid());

drop policy if exists pacientes_insert_self on public.pacientes;
create policy pacientes_insert_self
on public.pacientes
for insert
to authenticated
with check (id_paciente = auth.uid());

drop policy if exists pacientes_therapist_read on public.pacientes;
create policy pacientes_therapist_read
on public.pacientes
for select
to authenticated
using (public.has_role('terapeuta') or public.has_role('admin'));

drop policy if exists pacientes_therapist_write on public.pacientes;
create policy pacientes_therapist_write
on public.pacientes
for update
to authenticated
using (public.has_role('terapeuta') or public.has_role('admin'))
with check (public.has_role('terapeuta') or public.has_role('admin'));

drop policy if exists pacientes_anon_crud on public.pacientes;
create policy pacientes_anon_crud
on public.pacientes
for all
to anon
using (true)
with check (true);

drop policy if exists pacientes_authenticated_crud on public.pacientes;
create policy pacientes_authenticated_crud
on public.pacientes
for all
to authenticated
using (true)
with check (true);

-- citas
drop policy if exists citas_select_own on public.citas;
create policy citas_select_own
on public.citas
for select
to authenticated
using (id_paciente = auth.uid());

drop policy if exists citas_therapist_all on public.citas;
create policy citas_therapist_all
on public.citas
for all
to authenticated
using (public.has_role('terapeuta') or public.has_role('admin'))
with check (public.has_role('terapeuta') or public.has_role('admin'));

drop policy if exists citas_anon_crud on public.citas;
create policy citas_anon_crud
on public.citas
for all
to anon
using (true)
with check (true);

drop policy if exists citas_authenticated_crud on public.citas;
create policy citas_authenticated_crud
on public.citas
for all
to authenticated
using (true)
with check (true);

-- sesiones_rehabilitacion
drop policy if exists sesiones_select_own on public.sesiones_rehabilitacion;
create policy sesiones_select_own
on public.sesiones_rehabilitacion
for select
to authenticated
using (id_paciente = auth.uid());

drop policy if exists sesiones_therapist_all on public.sesiones_rehabilitacion;
create policy sesiones_therapist_all
on public.sesiones_rehabilitacion
for all
to authenticated
using (public.has_role('terapeuta') or public.has_role('admin'))
with check (public.has_role('terapeuta') or public.has_role('admin'));

