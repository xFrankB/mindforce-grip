const sidebar = document.getElementById('sidebar');
const viewContainer = document.getElementById('viewContainer');
const viewTitle = document.getElementById('viewTitle');
const viewSubtitle = document.getElementById('viewSubtitle');
const profileName = document.getElementById('profileName');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDot = document.getElementById('notificationDot');
const profileBtn = document.getElementById('profileBtn');
const themeToggle = document.getElementById('themeToggle');
const themeToggleGlyph = document.getElementById('themeToggleGlyph');

const modalBackdrop = document.getElementById('modalBackdrop');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

const profileSettingsTemplate = document.getElementById('profileSettingsTemplate');
const therapistFormTemplate = document.getElementById('therapistFormTemplate');
const patientFormTemplate = document.getElementById('patientFormTemplate');
const WEB_STATE_KEYS = {
  therapists: 'therapists',
  patients: 'patients',
  appointments: 'appointments',
  pendingRequests: 'pending_therapist_requests',
  profileChangeRequests: 'profile_change_requests',
  therapistSecurity: 'therapist_security',
};
const SUPABASE_TABLES = {
  therapists: 'terapeutas',
  patients: 'pacientes',
  appointments: 'citas',
};
const SUPABASE_URL = window.MIND_FORCE_SUPABASE?.url || '';
const SUPABASE_ANON_KEY = window.MIND_FORCE_SUPABASE?.anonKey || '';
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabaseDbClient =
  typeof supabase !== 'undefined' && HAS_SUPABASE_CONFIG
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
const supabaseAuthClient =
  typeof supabase !== 'undefined' && HAS_SUPABASE_CONFIG
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
let modalDecisionResolver = null;
let rowActionTooltip = null;
let rowActionTooltipAnchor = null;
let appointmentsRealtimeChannel = null;
let lastSupabaseDbErrorMessage = '';

const DASHBOARD_SESSION_STORAGE_KEY = 'mindforce_dashboard_session';
const DASHBOARD_ALLOWED_ROLES = ['Administrador', 'Terapeuta'];

let currentRole = 'Administrador';
let currentView = 'dashboard';
let currentSession = null;
let selectedPatientId = null;
let effortChart = null;
let calendarRef = null;
let calendarActiveTab = 'agenda';

const therapistTableFilters = {
  search: '',
  specialization: 'all',
  status: 'all',
};

const patientTableFilters = {
  search: '',
  status: 'all',
};

const account = {
  id: 'admin-1',
  role: 'Administrador',
  name: 'Cuenta de demostracion',
  email: '',
  phone: '',
  position: 'Administracion de demostracion',
  employeeCode: 'ADM-001',
  branch: 'Entorno de demostracion',
  lastPasswordUpdate: '2026-03-20T08:10:00',
};

const terapeutas = [
  {
    id: 1,
    role: 'Terapeuta',
    firstNames: 'Terapeuta',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Uno',
    name: 'Terapeuta demo 01',
    professionalLicense: 'DEMO-TR-01',
    curp: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    specialization: 'Demostracion',
    certifications: 'Registro de prueba',
    experienceYears: 0,
    institution: 'Entorno de demostracion',
    healthLicense: 'DEMO-TR-01',
    emergencyContact: '',
    emergencyPhone: '',
    status: 'Verificado',
  },
  {
    id: 2,
    role: 'Terapeuta',
    firstNames: 'Terapeuta',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Dos',
    name: 'Terapeuta demo 02',
    professionalLicense: 'DEMO-TR-02',
    curp: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    specialization: 'Demostracion',
    certifications: 'Registro de prueba',
    experienceYears: 0,
    institution: 'Entorno de demostracion',
    healthLicense: 'DEMO-TR-02',
    emergencyContact: '',
    emergencyPhone: '',
    status: 'Verificado',
  },
  {
    id: 3,
    role: 'Terapeuta',
    firstNames: 'Terapeuta',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Tres',
    name: 'Terapeuta demo 03',
    professionalLicense: 'DEMO-TR-03',
    curp: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    specialization: 'Demostracion',
    certifications: 'Registro de prueba',
    experienceYears: 0,
    institution: 'Entorno de demostracion',
    healthLicense: 'DEMO-TR-03',
    emergencyContact: '',
    emergencyPhone: '',
    status: 'Pendiente de renovacion',
  },
];

let pendingTherapistRequests = [];
let profileChangeRequests = [];
let therapistSecurity = {};

const pacientes = [
  {
    id: 1,
    firstNames: 'Paciente',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Uno',
    name: 'Paciente demo 01',
    birthDate: '',
    age: 0,
    phone: '',
    email: '',
    address: '',
    diagnosis: 'Registro de demostracion',
    dominantHand: 'No especificado',
    painLevel: 0,
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: 'No disponible',
    comorbidities: 'No disponible',
    medications: 'No disponible',
    allergies: 'No disponible',
    functionalLimitations: 'No disponible',
    therapyGoals: 'No disponible',
    preferences: 'No disponible',
    contraindications: 'No disponible',
    status: 'Registro de demostracion',
    statusColor: 'status-ok',
    maxForce: 82,
    adherence: 21,
    progress: 34,
  },
  {
    id: 2,
    firstNames: 'Paciente',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Dos',
    name: 'Paciente demo 02',
    birthDate: '',
    age: 0,
    phone: '',
    email: '',
    address: '',
    diagnosis: 'Registro de demostracion',
    dominantHand: 'No especificado',
    painLevel: 0,
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: 'No disponible',
    comorbidities: 'No disponible',
    medications: 'No disponible',
    allergies: 'No disponible',
    functionalLimitations: 'No disponible',
    therapyGoals: 'No disponible',
    preferences: 'No disponible',
    contraindications: 'No disponible',
    status: 'Registro de demostracion',
    statusColor: 'status-warning',
    maxForce: 69,
    adherence: 8,
    progress: 19,
  },
  {
    id: 3,
    firstNames: 'Paciente',
    lastNamePaternal: 'Demo',
    lastNameMaternal: 'Tres',
    name: 'Paciente demo 03',
    birthDate: '',
    age: 0,
    phone: '',
    email: '',
    address: '',
    diagnosis: 'Registro de demostracion',
    dominantHand: 'No especificado',
    painLevel: 0,
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: 'No disponible',
    comorbidities: 'No disponible',
    medications: 'No disponible',
    allergies: 'No disponible',
    functionalLimitations: 'No disponible',
    therapyGoals: 'No disponible',
    preferences: 'No disponible',
    contraindications: 'No disponible',
    status: 'Registro de demostracion',
    statusColor: 'status-danger',
    maxForce: 53,
    adherence: 2,
    progress: 7,
  },
];

const defaultAppointments = [
  {
    id: 'c1',
    title: 'Sesion de demostracion 01',
    appointmentType: 'Sesion de demostracion',
    start: '2026-04-14T10:00:00',
    end: '2026-04-14T11:00:00',
    durationMinutes: 60,
    patientId: 1,
    patientName: 'Paciente demo 01',
    patientEmail: '',
    status: 'Confirmada',
    modality: 'Presencial',
    location: 'Entorno de demostracion',
    notes: 'Registro de demostracion.',
    createdBy: 'Cuenta de demostracion',
    createdAt: '2026-04-10T09:00:00',
  },
  {
    id: 'c2',
    title: 'Sesion de demostracion 02',
    appointmentType: 'Sesion de demostracion',
    start: '2026-04-16T12:00:00',
    end: '2026-04-16T12:45:00',
    durationMinutes: 45,
    patientId: 2,
    patientName: 'Paciente demo 02',
    patientEmail: '',
    status: 'Programada',
    modality: 'Presencial',
    location: 'Entorno de demostracion',
    notes: 'Registro de demostracion.',
    createdBy: 'Cuenta de demostracion',
    createdAt: '2026-04-10T09:10:00',
  },
  {
    id: 'c3',
    title: 'Sesion de demostracion 03',
    appointmentType: 'Sesion de demostracion',
    start: '2026-04-18T09:30:00',
    end: '2026-04-18T10:15:00',
    durationMinutes: 45,
    patientId: 3,
    patientName: 'Paciente demo 03',
    patientEmail: '',
    status: 'Por confirmar',
    modality: 'Videollamada',
    location: 'Entorno de demostracion',
    notes: 'Registro de demostracion.',
    createdBy: 'Cuenta de demostracion',
    createdAt: '2026-04-10T09:25:00',
  },
];

const defaultTherapistsSeed = terapeutas.map((item) => ({ ...item }));
const defaultPatientsSeed = pacientes.map((item) => ({ ...item }));
const defaultAppointmentsSeed = defaultAppointments.map((item) => ({ ...item }));

let citas = defaultAppointments.map((appointment) => ({ ...appointment }));

const adminMenu = [
  {
    id: 'dashboard',
    label: 'Dashboard IoT',
    subtitle: 'Estado de esferas clinicas desplegadas',
    icon: iconHome(),
  },
  {
    id: 'terapeutas',
    label: 'CRUD de Terapeutas',
    subtitle: 'Gestion de personal clinico',
    icon: iconUsers(),
  },
  {
    id: 'cuenta',
    label: 'Mi Cuenta',
    subtitle: 'Detalle y control de acceso',
    icon: iconAccount(),
  },
];

const therapistMenu = [
  {
    id: 'pacientes',
    label: 'CRUD de Pacientes',
    subtitle: 'Expedientes y seguimiento',
    icon: iconFolder(),
  },
  {
    id: 'prescripcion',
    label: 'Comando Clinico',
    subtitle: 'Prescripcion IoT personalizada',
    icon: iconSliders(),
  },
  {
    id: 'calendario',
    label: 'Calendario de Citas',
    subtitle: 'Agenda presencial de clinica',
    icon: iconCalendar(),
  },
  {
    id: 'cuenta',
    label: 'Mi Cuenta',
    subtitle: 'Perfil y seguridad',
    icon: iconAccount(),
  },
];

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeUsernameCandidate(value) {
  return normalizeUsername(value)
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9_.-]/g, '')
    .replace(/[_.-]{2,}/g, '.')
    .replace(/^[_.-]+|[_.-]+$/g, '');
}

function validateTherapistUsername(username) {
  return /^[a-z0-9_.-]{4,40}$/.test(String(username || ''));
}

function getDefaultViewByRole(role) {
  return role === 'Administrador' ? 'dashboard' : 'pacientes';
}

function getStoredDashboardSession() {
  try {
    const rawValue = window.sessionStorage.getItem(DASHBOARD_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const role = String(parsed.role || '').trim();
    if (!DASHBOARD_ALLOWED_ROLES.includes(role)) {
      return null;
    }

    return {
      role,
      userId: String(parsed.userId || '').trim(),
      authUserId: String(parsed.authUserId || '').trim(),
      name: String(parsed.name || '').trim(),
      email: normalizeEmail(parsed.email),
      username: normalizeUsername(parsed.username),
    };
  } catch (error) {
    console.warn('No se pudo leer la sesion actual del dashboard:', error);
    return null;
  }
}

function clearDashboardSession() {
  try {
    window.sessionStorage.removeItem(DASHBOARD_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar la sesion local del dashboard:', error);
  }
}

function storeDashboardSession(session) {
  if (!session) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      DASHBOARD_SESSION_STORAGE_KEY,
      JSON.stringify({
        role: String(session.role || '').trim(),
        userId: String(session.userId || '').trim(),
        authUserId: String(session.authUserId || '').trim(),
        name: String(session.name || '').trim(),
        email: normalizeEmail(session.email),
        username: normalizeUsername(session.username),
        loginAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn('No se pudo actualizar la sesion local del dashboard:', error);
  }
}

function applyDashboardSession(session) {
  currentSession = session;
  currentRole = session.role;
  currentView = getDefaultViewByRole(currentRole);

  if (currentRole === 'Administrador') {
    account.id = session.userId || account.id;
    account.name = session.name || account.name;
    account.email = session.email || account.email;
  }
}

function findTherapistForSession(session) {
  if (!session || !Array.isArray(terapeutas) || terapeutas.length === 0) {
    return null;
  }

  const sessionAuthUserId = String(session.authUserId || '').trim();
  const sessionEmail = normalizeEmail(session.email);
  const sessionUsername = normalizeUsername(session.username);

  return (
    terapeutas.find((therapist) => {
      const therapistAuthUserId = resolveTherapistAuthId(therapist);
      const therapistEmail = normalizeEmail(therapist.email);
      const therapistUsername = normalizeUsername(therapist.username);

      if (sessionAuthUserId && therapistAuthUserId && therapistAuthUserId === sessionAuthUserId) {
        return true;
      }

      if (sessionEmail && therapistEmail && therapistEmail === sessionEmail) {
        return true;
      }

      if (sessionUsername && therapistUsername && therapistUsername === sessionUsername) {
        return true;
      }

      return false;
    }) || null
  );
}

function buildTherapistSessionFromRecord(therapist, fallbackSession = null) {
  if (!therapist) {
    return null;
  }

  const therapistAuthId = resolveTherapistAuthId(therapist);

  return {
    role: 'Terapeuta',
    userId: String(therapist.id || therapistAuthId || fallbackSession?.userId || '').trim(),
    authUserId: String(therapistAuthId || fallbackSession?.authUserId || '').trim(),
    name: String(therapist.name || fallbackSession?.name || 'Terapeuta').trim(),
    email: normalizeEmail(therapist.email || fallbackSession?.email),
    username: normalizeUsername(therapist.username || fallbackSession?.username),
  };
}

function buildAdminSessionFromRecord(adminRecord, fallbackSession = null) {
  if (!adminRecord) {
    return null;
  }

  const getAdminValue = (...keys) => {
    for (const key of keys) {
      const value = adminRecord?.[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return value;
      }
    }
    return '';
  };

  const adminId = getAdminValue('id_admin', 'id', 'admin_id', 'user_id');
  const adminName = getAdminValue('nombre_completo', 'full_name', 'nombre', 'name');
  const adminEmail = getAdminValue('correo', 'email', 'mail');
  const adminUsername = getAdminValue('no_admin', 'username', 'usuario', 'user_name');

  return {
    role: 'Administrador',
    userId: String(adminId || fallbackSession?.userId || '').trim(),
    authUserId: '',
    name: String(adminName || fallbackSession?.name || 'Administrador').trim(),
    email: normalizeEmail(adminEmail || fallbackSession?.email),
    username: String(adminUsername || fallbackSession?.username || '').trim(),
  };
}

async function fetchAdminProfileBySession(session) {
  if (!supabaseDbClient || !session) {
    return null;
  }

  const sessionUserId = String(session.userId || '').trim();
  const sessionUsername = String(session.username || '').trim();
  const sessionEmail = normalizeEmail(session.email);

  const runLookup = async (queryBuilder) => {
    const { data, error } = await queryBuilder.limit(1).maybeSingle();
    if (error) {
      console.warn('No se pudo validar la sesion de administrador:', error.message || error);
      const schemaOrPolicyIssue = /(does not exist|relation|column|permission denied|42p01|42703|42501)/i.test(
        String(error.message || error.code || ''),
      );
      if (schemaOrPolicyIssue) {
        return {
          __sessionFallbackAllowed: true,
        };
      }
      return null;
    }
    return data || null;
  };

  if (sessionUsername) {
    const byUsername = await runLookup(
      supabaseDbClient
        .from('administradores')
        .select('*')
        .eq('no_admin', sessionUsername),
    );
    if (byUsername) {
      return byUsername;
    }
  }

  if (sessionUserId && /^\d+$/.test(sessionUserId)) {
    const byId = await runLookup(
      supabaseDbClient
        .from('administradores')
        .select('*')
        .eq('id_admin', Number(sessionUserId)),
    );
    if (byId) {
      return byId;
    }
  }

  if (sessionEmail) {
    const { data, error } = await supabaseDbClient
      .from('administradores')
      .select('*')
      .limit(200);

    if (error) {
      console.warn('No se pudo validar la sesion de administrador por correo:', error.message || error);
      const schemaOrPolicyIssue = /(does not exist|relation|column|permission denied|42p01|42703|42501)/i.test(
        String(error.message || error.code || ''),
      );
      if (schemaOrPolicyIssue) {
        return {
          __sessionFallbackAllowed: true,
        };
      }
      return null;
    }

    if (Array.isArray(data)) {
      const byEmail =
        data.find((adminRecord) => {
          const candidateEmail = normalizeEmail(
            adminRecord?.correo || adminRecord?.email || adminRecord?.mail,
          );
          return candidateEmail && candidateEmail === sessionEmail;
        }) || null;

      if (byEmail) {
        return byEmail;
      }
    }
  }

  return null;
}

function canTrustAdminSessionFallback(session) {
  if (!session) {
    return false;
  }

  const authUserId = String(session.authUserId || '').trim();
  if (authUserId) {
    return false;
  }

  const username = String(session.username || '').trim();
  const email = normalizeEmail(session.email);
  const name = String(session.name || '').trim();

  return Boolean(name && (username || email));
}

async function resolveVerifiedDashboardSession(session) {
  if (!session) {
    return null;
  }

  const therapistProfile = findTherapistForSession(session);
  const adminProfile = await fetchAdminProfileBySession(session);
  const adminVerificationUnavailable = Boolean(adminProfile?.__sessionFallbackAllowed);

  if (session.role === 'Administrador') {
    if (therapistProfile) {
      return buildTherapistSessionFromRecord(therapistProfile, session);
    }

    if (adminProfile && !adminVerificationUnavailable) {
      return buildAdminSessionFromRecord(adminProfile, session);
    }

    if (canTrustAdminSessionFallback(session)) {
      if (adminVerificationUnavailable) {
        console.warn('Sesion admin validada por fallback: verificacion DB no disponible.');
      } else {
        console.warn('Sesion admin validada por fallback: no se encontro registro admin para revalidacion.');
      }

      return {
        role: 'Administrador',
        userId: String(session.userId || '').trim(),
        authUserId: '',
        name: String(session.name || 'Administrador').trim(),
        email: normalizeEmail(session.email),
        username: String(session.username || '').trim(),
      };
    }

    return null;
  }

  if (session.role === 'Terapeuta') {
    if (therapistProfile) {
      return buildTherapistSessionFromRecord(therapistProfile, session);
    }

    if (adminProfile && !adminVerificationUnavailable) {
      return buildAdminSessionFromRecord(adminProfile, session);
    }

    return null;
  }

  if (adminProfile && !adminVerificationUnavailable) {
    return buildAdminSessionFromRecord(adminProfile, session);
  }

  if (therapistProfile) {
    return buildTherapistSessionFromRecord(therapistProfile, session);
  }

  return null;
}

async function enforceDashboardSessionRole() {
  const verifiedSession = await resolveVerifiedDashboardSession(currentSession);
  if (!verifiedSession) {
    clearDashboardSession();
    window.location.href = 'index.html';
    return false;
  }

  applyDashboardSession(verifiedSession);
  storeDashboardSession(verifiedSession);
  return true;
}

function requireDashboardSession() {
  const session = getStoredDashboardSession();
  if (!session) {
    window.location.href = 'index.html';
    return false;
  }

  currentSession = session;
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireDashboardSession()) {
    return;
  }

  await initializeDashboardState();
  if (!(await enforceDashboardSessionRole())) {
    return;
  }
  await startAppointmentsRealtimeSync();
  setupThemeToggle();
  bindGlobalActions();
  renderApp();
});

function setupThemeToggle() {
  if (!themeToggle || !themeToggleGlyph) {
    return;
  }

  applyTheme('dark');

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.dataset.theme = isLight ? 'light' : 'dark';
  themeToggleGlyph.textContent = isLight ? 'L' : 'D';
  themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
}

function getCurrentTherapistProfile() {
  if (!terapeutas.length) {
    return null;
  }

  if (currentRole !== 'Terapeuta') {
    return terapeutas[0];
  }

  return findTherapistForSession(currentSession);
}

function getCurrentAccountProfile() {
  if (currentRole === 'Administrador') {
    return {
      id: account.id,
      role: account.role,
      name: account.name,
      email: account.email,
      phone: account.phone,
      position: account.position,
      branch: account.branch,
      employeeCode: account.employeeCode,
      lastPasswordUpdate: account.lastPasswordUpdate,
    };
  }

  const therapist = getCurrentTherapistProfile();
  if (!therapist) {
    return {
      id: 'therapist-missing',
      role: 'Terapeuta',
      name: 'Perfil sin terapeuta asignado',
      email: 'No disponible',
      username: '-',
      phone: '-',
      specialization: '-',
      professionalLicense: '-',
      branch: '-',
      lastPasswordUpdate: null,
    };
  }

  const securityRecord = getTherapistSecurityRecord(therapist.id);
  return {
    id: `therapist-${therapist.id}`,
    role: 'Terapeuta',
    therapistId: therapist.id,
    name: therapist.name,
    email: therapist.email || 'No disponible',
    username: therapist.username || '-',
    phone: therapist.phone || '-',
    specialization: therapist.specialization || '-',
    professionalLicense: therapist.professionalLicense || '-',
    branch: therapist.address || '-',
    emergencyContact: therapist.emergencyContact || '-',
    emergencyPhone: therapist.emergencyPhone || '-',
    lastPasswordUpdate: securityRecord.updatedAt || null,
  };
}

function getCurrentAccountName() {
  const profile = getCurrentAccountProfile();
  return profile.name || 'Usuario';
}

function bindGlobalActions() {
  profileBtn.addEventListener('click', openAccountSettings);

  notificationBtn.addEventListener('click', () => {
    notificationDot.style.display = 'none';
    showNotification('Notificaciones: 1 alerta de adherencia y 2 citas por confirmar.', 'info');
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      updateRowActionTooltipPosition();
    },
    true,
  );

  window.addEventListener('resize', () => {
    updateRowActionTooltipPosition();
  });
}

function renderApp() {
  const profile = getCurrentAccountProfile();
  profileName.textContent = profile.name || 'Usuario QualyTech';

  const menu = currentRole === 'Administrador' ? adminMenu : therapistMenu;
  if (!menu.some((item) => item.id === currentView)) {
    currentView = menu[0].id;
  }

  renderSidebar(menu);
  renderView();
}

function renderSidebar(menu) {
  sidebar.innerHTML = `
    <div class="brand">
      <img src="MindForce Grip-logo.jpg" alt="QualyTech" />
      <span>QualyTech</span>
    </div>

    <p class="status-badge">Rol activo: ${currentRole}</p>

    <nav class="nav-list" id="navList">
      ${menu
        .map(
          (item) => `
        <button type="button" class="nav-item ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `,
        )
        .join('')}
    </nav>

    <div class="sidebar-footer">
      <button type="button" class="btn-secondary" id="logoutBtn">Cerrar sesion</button>
    </div>
  `;

  sidebar.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      renderApp();
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function renderView() {
  hideRowActionTooltip();
  destroyChart();
  destroyCalendar();

  if (currentRole === 'Administrador') {
    if (currentView === 'dashboard') {
      renderAdminDashboard();
      return;
    }

    if (currentView === 'terapeutas') {
      renderAdminTherapists();
      return;
    }

    if (currentView === 'cuenta') {
      renderAccountView();
      return;
    }

    return;
  }

  if (currentView === 'pacientes') {
    renderTherapistPatients();
    return;
  }

  if (currentView === 'prescripcion') {
    renderPrescriptionModule();
    return;
  }

  if (currentView === 'calendario') {
    renderCalendarView();
    return;
  }

  if (currentView === 'cuenta') {
    renderAccountView();
  }
}

function renderAdminDashboard() {
  viewTitle.textContent = 'Dashboard Principal - Administrador';
  viewSubtitle.textContent = 'Estado de esferas QualyTech en UTEQ y centros asociados';

  viewContainer.innerHTML = `
    <section class="panel-grid">
      <div class="kpi-grid">
        <article class="card">
          <p class="status-badge"><span class="status-dot status-ok"></span>Operativo</p>
          <h3 class="card-title">Esferas IoT activas</h3>
          <p class="kpi-value teal">42</p>
        </article>

        <article class="card">
          <p class="status-badge"><span class="status-dot status-warning"></span>Monitoreo</p>
          <h3 class="card-title">Sesiones en curso</h3>
          <p class="kpi-value">18</p>
        </article>

        <article class="card">
          <p class="status-badge"><span class="status-dot status-danger"></span>Atencion</p>
          <h3 class="card-title">Alertas fisicas</h3>
          <p class="kpi-value orange">5</p>
        </article>
      </div>

      <article class="card">
        <h3 class="card-title">Cobertura de centros</h3>
        <div class="table-wrap table-wrap-requests">
          <table class="table table-requests">
            <thead>
              <tr>
                <th>Centro</th>
                <th>Esferas activas</th>
                <th>Terapeutas conectados</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>UTEQ - Laboratorio Clinico</td>
                <td>18</td>
                <td>7</td>
                <td><span class="status-badge"><span class="status-dot status-ok"></span>Estable</span></td>
              </tr>
              <tr>
                <td>Centro Norte</td>
                <td>14</td>
                <td>4</td>
                <td><span class="status-badge"><span class="status-dot status-warning"></span>Alta demanda</span></td>
              </tr>
              <tr>
                <td>Centro Sur</td>
                <td>10</td>
                <td>3</td>
                <td><span class="status-badge"><span class="status-dot status-ok"></span>Normal</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;
}

function renderAdminTherapists() {
  viewTitle.textContent = 'CRUD de Terapeutas';
  viewSubtitle.textContent = 'Gestion total de cuentas del personal terapeutico';

  const pendingRows = pendingTherapistRequests
    .map((request) => pendingRequestRowTemplate(request))
    .join('');
  const filteredTherapists = getFilteredTherapists();
  const therapistRows = filteredTherapists.map((therapist) => therapistRowTemplate(therapist)).join('');
  const specializationOptions = ['all', ...new Set(terapeutas.map((therapist) => therapist.specialization).filter(Boolean))];

  viewContainer.innerHTML = `
    <section class="panel-grid">
      <article class="card">
        <div class="toolbar">
          <h3 class="card-title">Solicitudes de creacion de cuenta</h3>
          <span class="status-badge"><span class="status-dot ${pendingTherapistRequests.length ? 'status-warning' : 'status-ok'}"></span>${pendingTherapistRequests.length} pendientes</span>
        </div>

        <div class="table-wrap table-wrap-requests">
          <table class="table table-requests">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Perfil</th>
                <th>Correo</th>
                <th>Especializacion</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                pendingRows ||
                '<tr><td colspan="6">No hay solicitudes pendientes por revisar.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <div class="toolbar">
          <h3 class="card-title">Tabla de terapeutas</h3>
          <button class="btn-primary" type="button" id="createTherapistBtn">Crear nuevo terapeuta</button>
        </div>

        <section class="crud-controls" aria-label="Busqueda y filtros de terapeutas">
          <label class="search-field" for="therapistSearchInput">
            <span class="control-label">Busqueda rapida</span>
            <input
              type="search"
              id="therapistSearchInput"
              class="search-input"
              placeholder="Nombre, cedula, CURP, correo o telefono"
            />
          </label>

          <div class="control-row">
            <div class="filter-chip-group" role="group" aria-label="Filtro por estado de terapeuta">
              <button type="button" class="filter-chip ${therapistTableFilters.status === 'all' ? 'active' : ''}" data-therapist-status="all">Todos</button>
              <button type="button" class="filter-chip ${therapistTableFilters.status === 'verificado' ? 'active' : ''}" data-therapist-status="verificado">Verificados</button>
              <button type="button" class="filter-chip ${therapistTableFilters.status === 'pendiente' ? 'active' : ''}" data-therapist-status="pendiente">Pendientes</button>
              <button type="button" class="filter-chip ${therapistTableFilters.status === 'actualizado' ? 'active' : ''}" data-therapist-status="actualizado">Actualizados</button>
            </div>

            <label class="select-field" for="therapistSpecializationFilter">
              <span class="control-label">Especializacion</span>
              <select id="therapistSpecializationFilter" class="filter-select">
                ${specializationOptions
                  .map(
                    (specialization) =>
                      `<option value="${specialization}" ${therapistTableFilters.specialization === specialization ? 'selected' : ''}>${specialization === 'all' ? 'Todas' : specialization}</option>`,
                  )
                  .join('')}
              </select>
            </label>

            <button type="button" class="btn-secondary btn-clear-filters" id="clearTherapistFilters">Limpiar filtros</button>
          </div>
        </section>

        <div class="table-wrap table-wrap-therapists">
          <table class="table table-therapists table-stackable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Perfil profesional</th>
                <th>Contacto</th>
                <th>Credenciales</th>
                <th>Ubicacion y respaldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="therapistsTableBody">
              ${
                therapistRows ||
                '<tr><td colspan="6">No se encontraron terapeutas con los filtros seleccionados.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;

  document.getElementById('createTherapistBtn').addEventListener('click', () => {
    openTherapistModal('create');
  });

  const therapistSearchInput = document.getElementById('therapistSearchInput');
  therapistSearchInput.value = therapistTableFilters.search;
  therapistSearchInput.addEventListener('input', (event) => {
    therapistTableFilters.search = event.target.value;
    renderAdminTherapists();
  });

  document.querySelectorAll('[data-therapist-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      therapistTableFilters.status = btn.dataset.therapistStatus;
      renderAdminTherapists();
    });
  });

  document.getElementById('therapistSpecializationFilter').addEventListener('change', (event) => {
    therapistTableFilters.specialization = event.target.value;
    renderAdminTherapists();
  });

  document.getElementById('clearTherapistFilters').addEventListener('click', () => {
    therapistTableFilters.search = '';
    therapistTableFilters.status = 'all';
    therapistTableFilters.specialization = 'all';
    renderAdminTherapists();
  });

  bindTherapistActions();
}

function renderTherapistPatients() {
  viewTitle.textContent = 'CRUD de Pacientes';
  viewSubtitle.textContent = 'Control de expedientes clinicos y seguimiento de rehabilitacion';

  const filteredPatients = getFilteredPatients();
  const patientRows = filteredPatients.map((patient) => patientRowTemplate(patient)).join('');

  viewContainer.innerHTML = `
    <section class="panel-grid">
      <article class="card">
        <div class="toolbar">
          <h3 class="card-title">Pacientes registrados</h3>
          <button class="btn-primary" type="button" id="createPatientBtn">Crear paciente</button>
        </div>

        <section class="crud-controls" aria-label="Busqueda y filtros de pacientes">
          <label class="search-field" for="patientSearchInput">
            <span class="control-label">Busqueda rapida</span>
            <input
              type="search"
              id="patientSearchInput"
              class="search-input"
              placeholder="Nombre, diagnostico, correo o telefono"
            />
          </label>

          <div class="control-row">
            <div class="filter-chip-group" role="group" aria-label="Filtro por estado clinico">
              <button type="button" class="filter-chip ${patientTableFilters.status === 'all' ? 'active' : ''}" data-patient-status="all">Todos</button>
              <button type="button" class="filter-chip ${patientTableFilters.status === 'status-ok' ? 'active' : ''}" data-patient-status="status-ok">Completados</button>
              <button type="button" class="filter-chip ${patientTableFilters.status === 'status-warning' ? 'active' : ''}" data-patient-status="status-warning">Pendientes</button>
              <button type="button" class="filter-chip ${patientTableFilters.status === 'status-danger' ? 'active' : ''}" data-patient-status="status-danger">Alertas</button>
            </div>

            <button type="button" class="btn-secondary btn-clear-filters" id="clearPatientFilters">Limpiar filtros</button>
          </div>
        </section>

        <div class="table-wrap table-wrap-patients">
          <table class="table table-patients table-stackable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Perfil del paciente</th>
                <th>Estado clinico</th>
                <th>Contacto</th>
                <th>Seguimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="patientsTableBody">
              ${
                patientRows ||
                '<tr><td colspan="6">No se encontraron pacientes con los filtros seleccionados.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;

  document.getElementById('createPatientBtn').addEventListener('click', () => {
    openPatientModal('create');
  });

  const patientSearchInput = document.getElementById('patientSearchInput');
  patientSearchInput.value = patientTableFilters.search;
  patientSearchInput.addEventListener('input', (event) => {
    patientTableFilters.search = event.target.value;
    renderTherapistPatients();
  });

  document.querySelectorAll('[data-patient-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      patientTableFilters.status = btn.dataset.patientStatus;
      renderTherapistPatients();
    });
  });

  document.getElementById('clearPatientFilters').addEventListener('click', () => {
    patientTableFilters.search = '';
    patientTableFilters.status = 'all';
    renderTherapistPatients();
  });

  bindPatientActions();
}

function renderPrescriptionModule() {
  viewTitle.textContent = 'Comando Clinico (Prescripcion)';
  viewSubtitle.textContent = 'Configura fuerza objetivo, contraccion y descanso para la esfera IoT';

  if (!selectedPatientId && pacientes.length) {
    selectedPatientId = pacientes[0].id;
  }

  viewContainer.innerHTML = `
    <section class="therapist-layout">
      <article class="card">
        <h3 class="card-title">Seleccion de paciente</h3>
        <div class="patient-list" id="patientPicker">
          ${pacientes
            .map(
              (patient) => `
            <button type="button" class="patient-card ${selectedPatientId === patient.id ? 'active' : ''}" data-patient-id="${patient.id}">
              <img class="patient-avatar" src="${getPatientAvatar(patient.id)}" alt="${patient.name}" />
              <div class="patient-meta">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-subtext">${patient.status}</div>
              </div>
            </button>
          `,
            )
            .join('')}
        </div>
      </article>

      <div class="panel-grid">
        <div class="kpi-grid">
          <article class="card">
            <h3 class="card-title">Fuerza Maxima (N)</h3>
            <p class="kpi-value teal" id="rxMaxForce">-</p>
          </article>
          <article class="card">
            <h3 class="card-title">Racha de Adherencia (Dias)</h3>
            <p class="kpi-value teal" id="rxAdherence">-</p>
          </article>
          <article class="card">
            <h3 class="card-title">Progreso vs Diagnostico Inicial (%)</h3>
            <p class="kpi-value orange" id="rxProgress">-</p>
          </article>
        </div>

        <article class="card">
          <h3 class="card-title">Curva de esfuerzo simulada</h3>
          <div class="chart-wrap">
            <canvas id="effortChart"></canvas>
          </div>
        </article>

        <article class="card">
          <h3 class="card-title">Parametros de prescripcion</h3>

          <div class="slider-group">
            <div class="slider-label">
              <span>Fuerza Objetivo</span>
              <span class="slider-value" id="forceValue">65 N</span>
            </div>
            <input type="range" id="forceSlider" class="slider orange" min="10" max="120" value="65" />
          </div>

          <div class="slider-group">
            <div class="slider-label">
              <span>Contraccion</span>
              <span class="slider-value" id="contractionValue">6 s</span>
            </div>
            <input type="range" id="contractionSlider" class="slider" min="1" max="12" value="6" />
          </div>

          <div class="slider-group">
            <div class="slider-label">
              <span>Descanso</span>
              <span class="slider-value" id="restValue">4 s</span>
            </div>
            <input type="range" id="restSlider" class="slider" min="1" max="12" value="4" />
          </div>

          <button type="button" class="btn-primary" id="sendPrescriptionBtn">Actualizar Plan de Tratamiento</button>
        </article>
      </div>
    </section>
  `;

  bindPrescriptionPatients();
  bindPrescriptionControls();
  updatePrescriptionKpis();
  renderEffortChart();
}

function renderCalendarView() {
  viewTitle.textContent = 'Calendario de Citas';
  viewSubtitle.textContent = 'Agenda clinica integral con registro por paciente y trazabilidad de citas';

  if (!selectedPatientId && pacientes.length) {
    selectedPatientId = pacientes[0].id;
  }

  viewContainer.innerHTML = `
    <section class="panel-grid">
      <article class="card">
        <div class="tabs" id="calendarTabs">
          <button type="button" class="tab-btn ${calendarActiveTab === 'agenda' ? 'active' : ''}" data-tab="agenda">Agenda</button>
          <button type="button" class="tab-btn ${calendarActiveTab === 'registro' ? 'active' : ''}" data-tab="registro">Registro de citas</button>
        </div>

        <div class="tab-pane ${calendarActiveTab === 'agenda' ? '' : 'hidden'}" id="tabAgenda">
          <div id="calendar"></div>
        </div>

        <div class="tab-pane ${calendarActiveTab === 'registro' ? '' : 'hidden'}" id="tabRegistro">
          <div class="appointment-layout">
            <section class="appointment-kpi-grid" id="appointmentSummaryCards">
              <article class="appointment-kpi-card">
                <span class="appointment-kpi-label">Total registradas</span>
                <strong class="appointment-kpi-value" id="appointmentsTotal">0</strong>
              </article>
              <article class="appointment-kpi-card">
                <span class="appointment-kpi-label">Confirmadas</span>
                <strong class="appointment-kpi-value" id="appointmentsConfirmed">0</strong>
              </article>
              <article class="appointment-kpi-card">
                <span class="appointment-kpi-label">Por confirmar</span>
                <strong class="appointment-kpi-value" id="appointmentsPending">0</strong>
              </article>
              <article class="appointment-kpi-card">
                <span class="appointment-kpi-label">Videollamadas</span>
                <strong class="appointment-kpi-value" id="appointmentsVirtual">0</strong>
              </article>
            </section>

            <form id="quickAppointmentForm" class="form-grid split appointment-form">
              <label>
                Usuario / paciente
                <select name="patientId" id="appointmentPatient" required>
                  ${getAppointmentPatientOptions()}
                </select>
              </label>
              <label>
                Tipo de cita
                <select name="appointmentType" required>
                  <option value="Evaluacion inicial">Evaluacion inicial</option>
                  <option value="Seguimiento clinico">Seguimiento clinico</option>
                  <option value="Control de progreso">Control de progreso</option>
                  <option value="Sesion de terapia">Sesion de terapia</option>
                </select>
              </label>
              <label>
                Fecha y hora
                <input type="datetime-local" name="startAt" id="appointmentDateTime" required />
              </label>
              <label>
                Duracion estimada
                <select name="durationMinutes" required>
                  <option value="30">30 minutos</option>
                  <option value="45" selected>45 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
              </label>
              <label>
                Modalidad
                <select name="modality" required>
                  <option value="Presencial" selected>Presencial</option>
                  <option value="Videollamada">Videollamada</option>
                  <option value="Domicilio">Domicilio</option>
                </select>
              </label>
              <label>
                Estado inicial
                <select name="status" required>
                  <option value="Programada" selected>Programada</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Por confirmar">Por confirmar</option>
                </select>
              </label>
              <label class="full-width">
                Lugar / canal
                <input type="text" name="location" required minlength="4" placeholder="Ejemplo: Consultorio A-2 o enlace de videollamada" />
              </label>
              <label class="full-width">
                Notas para la cita
                <textarea name="notes" placeholder="Objetivos de sesion, observaciones o indicaciones para el paciente"></textarea>
              </label>
              <label class="full-width appointment-checkbox">
                <input type="checkbox" name="notifyUser" checked />
                Registrar y notificar al usuario en su expediente digital.
              </label>
              <button type="submit" class="btn-primary">Registrar cita</button>
            </form>

            <section class="appointment-registry card-subtle">
              <div class="toolbar">
                <h3 class="card-title">Citas registradas por usuario</h3>
              </div>
              <div class="table-wrap appointment-table-wrap">
                <table class="table table-appointments table-stackable">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="appointmentRegistryBody"></tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </article>
    </section>
  `;

  bindCalendarTabs();
  bindAppointmentForm();
  renderCalendar();
  renderAppointmentRegistry();
  syncCalendarSummary();

  const appointmentDateTime = document.getElementById('appointmentDateTime');
  if (appointmentDateTime && !appointmentDateTime.value) {
    appointmentDateTime.value = getSuggestedAppointmentDate();
  }
}

function getAppointmentPatientOptions() {
  return pacientes
    .map(
      (patient) =>
        `<option value="${patient.id}" ${Number(selectedPatientId) === patient.id ? 'selected' : ''}>${patient.name} (${patient.phone || 'Sin telefono'})</option>`,
    )
    .join('');
}

function bindAppointmentForm() {
  const form = document.getElementById('quickAppointmentForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const patientId = Number(formData.get('patientId'));
    const patient = pacientes.find((item) => item.id === patientId);
    if (!patient) {
      showNotification('Selecciona un usuario valido para registrar la cita.', 'warning');
      return;
    }

    const appointmentType = String(formData.get('appointmentType') || '').trim();
    const status = String(formData.get('status') || 'Programada').trim();
    const modality = String(formData.get('modality') || 'Presencial').trim();
    const location = String(formData.get('location') || '').trim();
    const notes = String(formData.get('notes') || '').trim();
    const notifyUser = Boolean(formData.get('notifyUser'));
    const durationMinutes = Number(formData.get('durationMinutes'));
    const startInput = String(formData.get('startAt') || '').trim();

    const startDate = new Date(startInput);
    if (Number.isNaN(startDate.getTime())) {
      showNotification('Ingresa una fecha y hora valida para la cita.', 'warning');
      return;
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
      showNotification('La duracion seleccionada no es valida.', 'warning');
      return;
    }

    const start = toDateTimeStorageValue(startDate);
    const end = addMinutesToDateTime(start, durationMinutes);

    if (hasPatientAppointmentConflict(patientId, start, end)) {
      showNotification('El usuario ya tiene una cita en ese horario. Selecciona otra hora.', 'warning');
      return;
    }

    const appointment = {
      id: createUuid(),
      title: buildAppointmentTitle(patient.name, appointmentType),
      appointmentType,
      start,
      end,
      durationMinutes,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email || '',
      status,
      modality,
      location,
      notes,
      createdBy: getCurrentAccountName(),
      createdAt: new Date().toISOString(),
    };

    const appointmentSaved = await upsertAppointmentRecord(appointment);
    if (!appointmentSaved) {
      showNotification(getLastSupabaseDbError() || 'No se pudo guardar la cita en Supabase. Intenta nuevamente.', 'warning');
      return;
    }

    citas.push(appointment);
    saveAppointments();

    if (calendarRef) {
      calendarRef.addEvent(buildCalendarEvent(appointment));
    }

    renderAppointmentRegistry();
    syncCalendarSummary();

    selectedPatientId = patient.id;
    form.reset();
    form.querySelector('[name="patientId"]').value = String(patient.id);
    const appointmentDateTime = document.getElementById('appointmentDateTime');
    if (appointmentDateTime) {
      appointmentDateTime.value = getSuggestedAppointmentDate();
    }

    calendarActiveTab = 'agenda';
    activateCalendarTab('agenda');

    showNotification(
      notifyUser
        ? `Cita registrada y asociada al usuario ${patient.name}. Se marco notificacion para ${patient.email || 'su expediente'}.`
        : `Cita registrada para ${patient.name}.`,
      'success',
    );
  });
}

function bindCalendarTabs() {
  const tabButtons = viewContainer.querySelectorAll('#calendarTabs [data-tab]');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activateCalendarTab(String(button.dataset.tab || 'agenda'));
    });
  });

  activateCalendarTab(calendarActiveTab);
}

function activateCalendarTab(tabName) {
  const normalizedTab = tabName === 'registro' ? 'registro' : 'agenda';
  calendarActiveTab = normalizedTab;

  const agendaBtn = viewContainer.querySelector('#calendarTabs [data-tab="agenda"]');
  const registroBtn = viewContainer.querySelector('#calendarTabs [data-tab="registro"]');
  const tabAgenda = document.getElementById('tabAgenda');
  const tabRegistro = document.getElementById('tabRegistro');

  if (!agendaBtn || !registroBtn || !tabAgenda || !tabRegistro) {
    return;
  }

  const agendaActive = normalizedTab === 'agenda';
  agendaBtn.classList.toggle('active', agendaActive);
  registroBtn.classList.toggle('active', !agendaActive);
  tabAgenda.classList.toggle('hidden', !agendaActive);
  tabRegistro.classList.toggle('hidden', agendaActive);

  if (agendaActive && calendarRef) {
    calendarRef.updateSize();
  }
}

function renderAppointmentRegistry() {
  const registryBody = document.getElementById('appointmentRegistryBody');
  if (!registryBody) {
    return;
  }

  const rows = [...citas]
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map(
      (appointment) => `
        <tr>
          <td data-label="Usuario">
            <div class="cell-primary">${appointment.patientName || 'Sin usuario asignado'}</div>
            <div class="cell-secondary">${appointment.patientEmail || 'Sin correo registrado'}</div>
          </td>
          <td data-label="Tipo">${appointment.appointmentType || 'Cita general'}</td>
          <td data-label="Fecha">${formatDateTimeLabel(appointment.start)}</td>
          <td data-label="Modalidad">${appointment.modality || '-'}</td>
          <td data-label="Estado">
            <span class="inline-status ${getAppointmentStatusClass(appointment.status)}">${appointment.status || 'Programada'}</span>
          </td>
          <td data-label="Acciones">
            <div class="row-actions">
              ${renderRowActionButton({
                variantClass: 'row-btn-view',
                datasetName: 'view-appointment',
                datasetValue: appointment.id,
                label: 'Ver',
                tooltipLabel: 'Ver detalle de cita',
                iconKey: 'view',
              })}
              ${renderAppointmentStatusActions(appointment)}
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  registryBody.innerHTML = rows || '<tr><td colspan="6">No hay citas registradas por usuario.</td></tr>';
  bindAppointmentRegistryActions();
}

function bindAppointmentRegistryActions() {
  viewContainer.querySelectorAll('[data-view-appointment]').forEach((button) => {
    button.addEventListener('click', () => {
      openAppointmentDetails(String(button.dataset.viewAppointment));
    });
  });

  viewContainer.querySelectorAll('[data-confirm-appointment]').forEach((button) => {
    button.addEventListener('click', async () => {
      await updateAppointmentStatus(String(button.dataset.confirmAppointment), 'Confirmada');
    });
  });

  viewContainer.querySelectorAll('[data-complete-appointment]').forEach((button) => {
    button.addEventListener('click', async () => {
      await updateAppointmentStatus(String(button.dataset.completeAppointment), 'Completada');
    });
  });

  viewContainer.querySelectorAll('[data-cancel-appointment]').forEach((button) => {
    button.addEventListener('click', async () => {
      await removeAppointment(String(button.dataset.cancelAppointment));
    });
  });

  bindRowActionTooltips();
}

function openAppointmentDetails(appointmentId) {
  const appointment = citas.find((item) => item.id === appointmentId);
  if (!appointment) {
    return;
  }

  openInfoModal('Detalle de cita', `
    <p><strong>Usuario:</strong> ${appointment.patientName || 'Sin usuario'}</p>
    <p><strong>Correo:</strong> ${appointment.patientEmail || 'Sin correo registrado'}</p>
    <p><strong>Tipo:</strong> ${appointment.appointmentType || 'Cita general'}</p>
    <p><strong>Inicio:</strong> ${formatDateTimeLabel(appointment.start)}</p>
    <p><strong>Fin:</strong> ${formatDateTimeLabel(appointment.end)}</p>
    <p><strong>Duracion:</strong> ${appointment.durationMinutes || 45} minutos</p>
    <p><strong>Modalidad:</strong> ${appointment.modality || '-'}</p>
    <p><strong>Lugar / canal:</strong> ${appointment.location || '-'}</p>
    <p><strong>Estado:</strong> ${appointment.status || 'Programada'}</p>
    <p><strong>Notas:</strong> ${appointment.notes || 'Sin notas registradas.'}</p>
    <p><strong>Registrada por:</strong> ${appointment.createdBy || 'Sistema'} (${formatDateTimeLabel(appointment.createdAt)})</p>
  `);
}

function renderAppointmentStatusActions(appointment) {
  const normalizedStatus = normalizeText(appointment.status);
  const actions = [];

  if (!normalizedStatus.includes('confirmad') && !normalizedStatus.includes('completad')) {
    actions.push(
      renderRowActionButton({
        variantClass: 'row-btn-accept',
        datasetName: 'confirm-appointment',
        datasetValue: appointment.id,
        label: 'Confirmar',
        tooltipLabel: 'Marcar cita como confirmada',
        iconKey: 'accept',
      }),
    );
  }

  if (!normalizedStatus.includes('completad')) {
    actions.push(
      renderRowActionButton({
        variantClass: 'row-btn-edit',
        datasetName: 'complete-appointment',
        datasetValue: appointment.id,
        label: 'Completar',
        tooltipLabel: 'Marcar cita como completada',
        iconKey: 'edit',
      }),
    );
  }

  actions.push(
    renderRowActionButton({
      variantClass: 'row-btn-delete',
      datasetName: 'cancel-appointment',
      datasetValue: appointment.id,
      label: 'Cancelar',
      tooltipLabel: 'Cancelar cita',
      iconKey: 'cancel',
    }),
  );

  return actions.join('');
}

async function updateAppointmentStatus(appointmentId, nextStatus) {
  const appointment = citas.find((item) => item.id === appointmentId);
  if (!appointment) {
    return;
  }

  const previousStatus = appointment.status;
  appointment.status = nextStatus;

  const appointmentSaved = await upsertAppointmentRecord(appointment);
  if (!appointmentSaved) {
    appointment.status = previousStatus;
    showNotification(getLastSupabaseDbError() || 'No se pudo actualizar el estado de la cita.', 'warning');
    return;
  }

  saveAppointments();
  if (currentView === 'calendario') {
    renderCalendarView();
  }

  showNotification(`Estado de cita actualizado a ${nextStatus}.`, 'success', 2400);
}

async function removeAppointment(appointmentId) {
  const appointment = citas.find((item) => item.id === appointmentId);
  if (!appointment) {
    return;
  }

  const shouldCancel = await confirmAction({
    title: 'Cancelar cita',
    message: `Deseas cancelar la cita de ${appointment.patientName || 'este usuario'} programada para ${formatDateTimeLabel(appointment.start)}?`,
    confirmLabel: 'Cancelar cita',
    cancelLabel: 'Mantener',
    variant: 'danger',
  });

  if (!shouldCancel) {
    return;
  }

  const appointmentDeleted = await deleteAppointmentRecord(appointmentId);
  if (!appointmentDeleted) {
    showNotification(getLastSupabaseDbError() || 'No se pudo cancelar la cita en Supabase. Intenta nuevamente.', 'warning');
    return;
  }

  citas = citas.filter((item) => item.id !== appointmentId);
  saveAppointments();

  if (calendarRef) {
    const event = calendarRef.getEventById(appointmentId);
    if (event) {
      event.remove();
    }
  }

  renderAppointmentRegistry();
  syncCalendarSummary();
  showNotification('La cita fue cancelada correctamente y removida del expediente del usuario.', 'success');
}

function syncCalendarSummary() {
  const totalNode = document.getElementById('appointmentsTotal');
  const confirmedNode = document.getElementById('appointmentsConfirmed');
  const pendingNode = document.getElementById('appointmentsPending');
  const virtualNode = document.getElementById('appointmentsVirtual');

  if (!totalNode || !confirmedNode || !pendingNode || !virtualNode) {
    return;
  }

  const confirmed = citas.filter((appointment) => normalizeText(appointment.status).includes('confirmad')).length;
  const pending = citas.filter((appointment) => {
    const normalizedStatus = normalizeText(appointment.status);
    return normalizedStatus.includes('programad') || normalizedStatus.includes('confirmar') || normalizedStatus.includes('pendiente');
  }).length;
  const virtual = citas.filter((appointment) => normalizeText(appointment.modality).includes('video')).length;

  totalNode.textContent = String(citas.length);
  confirmedNode.textContent = String(confirmed);
  pendingNode.textContent = String(pending);
  virtualNode.textContent = String(virtual);
}

function getAppointmentStatusClass(status) {
  const normalizedStatus = normalizeText(status);
  if (normalizedStatus.includes('cancel')) {
    return 'status-danger';
  }
  if (normalizedStatus.includes('confirmad')) {
    return 'status-ok';
  }
  if (normalizedStatus.includes('programad') || normalizedStatus.includes('confirmar') || normalizedStatus.includes('pendiente')) {
    return 'status-warning';
  }
  return 'status-ok';
}

function getCalendarEventPalette(status) {
  const statusClass = getAppointmentStatusClass(status);
  if (statusClass === 'status-danger') {
    return {
      background: 'rgba(255, 77, 79, 0.22)',
      border: 'rgba(255, 77, 79, 0.75)',
      text: '#f8f9fa',
    };
  }

  if (statusClass === 'status-warning') {
    return {
      background: 'rgba(255, 176, 32, 0.22)',
      border: 'rgba(255, 176, 32, 0.75)',
      text: '#f8f9fa',
    };
  }

  return {
    background: 'rgba(15, 215, 122, 0.2)',
    border: 'rgba(15, 215, 122, 0.75)',
    text: '#f8f9fa',
  };
}

function buildCalendarEvent(appointment) {
  const palette = getCalendarEventPalette(appointment.status);

  return {
    id: appointment.id,
    title: appointment.title,
    start: appointment.start,
    end: appointment.end,
    backgroundColor: palette.background,
    borderColor: palette.border,
    textColor: palette.text,
    extendedProps: {
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      modality: appointment.modality,
      location: appointment.location,
      notes: appointment.notes,
    },
  };
}

function renderCalendar() {
  if (typeof FullCalendar === 'undefined') {
    return;
  }

  const calendarEl = document.getElementById('calendar');
  calendarRef = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Dia',
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: citas.map((appointment) => buildCalendarEvent(appointment)),
    eventDurationEditable: true,
    select(info) {
      const appointmentDateTime = document.getElementById('appointmentDateTime');
      if (appointmentDateTime) {
        appointmentDateTime.value = toDateTimeInputValue(info.start);
      }

      activateCalendarTab('registro');
    },
    eventDrop(info) {
      const appointment = citas.find((item) => item.id === info.event.id);
      if (!appointment || !info.event.start) {
        return;
      }

      const start = toDateTimeStorageValue(info.event.start);
      const end = info.event.end
        ? toDateTimeStorageValue(info.event.end)
        : addMinutesToDateTime(start, appointment.durationMinutes || 45);

      appointment.start = start;
      appointment.end = end;
      appointment.durationMinutes = getDurationMinutes(start, end);
      saveAppointments();
      renderAppointmentRegistry();
      syncCalendarSummary();
      showNotification(`Cita reprogramada para ${formatDateTimeLabel(start)}.`, 'success', 2800);

      void upsertAppointmentRecord(appointment);
    },
    eventResize(info) {
      const appointment = citas.find((item) => item.id === info.event.id);
      if (!appointment || !info.event.start || !info.event.end) {
        return;
      }

      const start = toDateTimeStorageValue(info.event.start);
      const end = toDateTimeStorageValue(info.event.end);
      appointment.start = start;
      appointment.end = end;
      appointment.durationMinutes = getDurationMinutes(start, end);
      saveAppointments();
      renderAppointmentRegistry();
      syncCalendarSummary();
      showNotification(`Duracion ajustada a ${appointment.durationMinutes} minutos.`, 'info', 2600);

      void upsertAppointmentRecord(appointment);
    },
    eventClick(info) {
      openAppointmentDetails(info.event.id);
    },
  });

  calendarRef.render();
}

function renderAccountView() {
  if (currentRole === 'Administrador') {
    renderAdminAccountView();
    return;
  }

  renderTherapistAccountView();
}

function renderAdminAccountView() {
  const profile = getCurrentAccountProfile();
  const requests = getProfileChangeRequestsForAdmin();
  const pendingCount = requests.filter((request) => request.status === 'Pendiente').length;
  const requestRows = requests.map((request) => profileChangeRequestRowTemplateForAdmin(request)).join('');

  viewTitle.textContent = 'Mi Cuenta (Administrador)';
  viewSubtitle.textContent = 'Consulta de datos de cuenta y validacion de solicitudes de cambio de terapeutas';

  viewContainer.innerHTML = `
    <section class="panel-grid account-page">
      <article class="card">
        <div class="toolbar">
          <h3 class="card-title">Detalle de cuenta</h3>
          <span class="status-badge"><span class="status-dot status-ok"></span>Solo lectura</span>
        </div>
        <div class="account-readonly-grid">
          <div class="readonly-item">
            <span class="control-label">Nombre</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.name || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Correo</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.email || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Nombre de usuario</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.username || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Telefono</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.phone || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Puesto</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.position || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Codigo interno</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.employeeCode || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Ultimo cambio de contrasena</span>
            <p class="readonly-value">${profile.lastPasswordUpdate ? formatDateTimeLabel(profile.lastPasswordUpdate) : 'No registrado'}</p>
          </div>
        </div>
        <p class="form-help account-note">Por politica de seguridad, las credenciales del administrador no se editan desde este panel.</p>
      </article>

      <article class="card account-card-wide">
        <div class="toolbar">
          <h3 class="card-title">Solicitudes de cambio de perfil</h3>
          <span class="status-badge"><span class="status-dot ${pendingCount ? 'status-warning' : 'status-ok'}"></span>${pendingCount} pendientes</span>
        </div>
        <div class="table-wrap table-wrap-requests">
          <table class="table table-requests table-stackable">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Terapeuta</th>
                <th>Cambio solicitado</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                requestRows ||
                '<tr><td colspan="6">No hay solicitudes de cambios registradas.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;

  bindAdminProfileChangeActions();
}

function renderTherapistAccountView() {
  const profile = getCurrentAccountProfile();
  const therapist = getCurrentTherapistProfile();
  const requests = therapist ? getProfileChangeRequestsForTherapist(therapist.id) : [];
  const requestRows = requests.map((request) => profileChangeRequestRowTemplateForTherapist(request)).join('');
  const pendingCount = requests.filter((request) => request.status === 'Pendiente').length;

  viewTitle.textContent = 'Mi Cuenta (Terapeuta)';
  viewSubtitle.textContent = 'Consulta de perfil, cambio de contrasena y solicitud de correcciones con aprobacion administrativa';

  if (!therapist) {
    viewContainer.innerHTML = `
      <section class="panel-grid account-page">
        <article class="card">
          <h3 class="card-title">Cuenta no disponible</h3>
          <p class="form-help">No hay un terapeuta asignado a esta sesion para mostrar el detalle de cuenta.</p>
        </article>
      </section>
    `;
    return;
  }

  const fieldCatalog = getProfileChangeFieldCatalog();

  viewContainer.innerHTML = `
    <section class="panel-grid account-page">
      <article class="card">
        <div class="toolbar">
          <h3 class="card-title">Detalle de cuenta</h3>
          <span class="status-badge"><span class="status-dot status-ok"></span>Solo lectura</span>
        </div>
        <div class="account-readonly-grid">
          <div class="readonly-item">
            <span class="control-label">Nombre</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.name || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Correo</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.email || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Telefono</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.phone || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Especializacion</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.specialization || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Cedula profesional</span>
            <p class="readonly-value">${escapeHtmlAttribute(profile.professionalLicense || '-')}</p>
          </div>
          <div class="readonly-item">
            <span class="control-label">Ultimo cambio de contrasena</span>
            <p class="readonly-value">${profile.lastPasswordUpdate ? formatDateTimeLabel(profile.lastPasswordUpdate) : 'No registrado'}</p>
          </div>
        </div>
        <p class="form-help account-note">No puedes editar credenciales directamente. Para cualquier correccion de datos debes enviar una solicitud al administrador.</p>
      </article>

      <article class="card">
        <h3 class="card-title">Cambiar contrasena</h3>
        <form id="therapistPasswordForm" class="form-grid split account-form">
          <label>
            Contrasena actual
            <input type="password" name="currentPassword" required minlength="8" autocomplete="current-password" />
          </label>
          <label>
            Nueva contrasena
            <input type="password" name="newPassword" required minlength="10" autocomplete="new-password" />
          </label>
          <label>
            Confirmar nueva contrasena
            <input type="password" name="confirmPassword" required minlength="10" autocomplete="new-password" />
          </label>
          <p class="form-help full-width">La contrasena debe incluir mayuscula, minuscula, numero y simbolo.</p>
          <button type="submit" class="btn-primary">Actualizar contrasena</button>
        </form>
      </article>

      <article class="card account-card-wide">
        <div class="toolbar">
          <h3 class="card-title">Solicitar correccion de perfil</h3>
          <span class="status-badge"><span class="status-dot ${pendingCount ? 'status-warning' : 'status-ok'}"></span>${pendingCount} pendientes</span>
        </div>

        <form id="therapistChangeRequestForm" class="form-grid split account-form">
          <label>
            Campo a corregir
            <select name="fieldKey" id="changeFieldSelect" required>
              ${fieldCatalog
                .map(
                  (field) =>
                    `<option value="${field.key}" data-placeholder="${escapeHtmlAttribute(field.placeholder)}">${escapeHtmlAttribute(field.label)}</option>`,
                )
                .join('')}
            </select>
          </label>
          <label>
            Nuevo valor solicitado
            <input type="text" name="requestedValue" id="changeRequestedValue" required minlength="4" placeholder="Ingresa el nuevo valor" />
          </label>
          <label class="full-width">
            Motivo del cambio
            <textarea name="reason" required minlength="10" placeholder="Explica el motivo del cambio para revision administrativa"></textarea>
          </label>
          <button type="submit" class="btn-primary">Enviar solicitud</button>
        </form>

        <div class="table-wrap table-wrap-requests">
          <table class="table table-requests table-stackable">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Cambio solicitado</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Revision</th>
              </tr>
            </thead>
            <tbody>
              ${
                requestRows ||
                '<tr><td colspan="6">No has enviado solicitudes de cambio.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;

  bindTherapistAccountActions();
}

function getProfileChangeFieldCatalog() {
  return [
    { key: 'email', label: 'Correo de contacto', placeholder: 'correo@dominio.com' },
    { key: 'phone', label: 'Telefono de contacto', placeholder: '10 digitos' },
    { key: 'address', label: 'Direccion', placeholder: 'Domicilio completo' },
    { key: 'specialization', label: 'Especializacion', placeholder: 'Especialidad clinica' },
    { key: 'emergencyContact', label: 'Contacto de emergencia', placeholder: 'Nombre de contacto' },
    { key: 'emergencyPhone', label: 'Telefono de emergencia', placeholder: '10 digitos' },
  ];
}

function getProfileChangeFieldLabel(fieldKey) {
  const field = getProfileChangeFieldCatalog().find((item) => item.key === fieldKey);
  return field ? field.label : 'Campo no identificado';
}

function getProfileChangeStatusClass(status) {
  const normalizedStatus = normalizeText(status);
  if (normalizedStatus.includes('aprob')) {
    return 'status-ok';
  }
  if (normalizedStatus.includes('rechaz')) {
    return 'status-danger';
  }
  return 'status-warning';
}

function profileChangeRequestRowTemplateForAdmin(request) {
  const statusClass = getProfileChangeStatusClass(request.status);
  const requestDate = request.requestedAt ? formatDateTimeLabel(request.requestedAt) : '-';
  const requestId = escapeHtmlAttribute(request.requestId || '-');
  const therapistName = escapeHtmlAttribute(request.therapistName || '-');
  const therapistEmail = escapeHtmlAttribute(request.therapistEmail || '-');
  const fieldLabel = escapeHtmlAttribute(request.fieldLabel || getProfileChangeFieldLabel(request.fieldKey));
  const requestedValue = escapeHtmlAttribute(request.requestedValue || '-');
  const reason = escapeHtmlAttribute(request.reason || '-');
  const statusLabel = escapeHtmlAttribute(request.status || 'Pendiente');
  const reviewedAtLabel = request.reviewedAt ? formatDateTimeLabel(request.reviewedAt) : 'Sin revision';
  const valueSummary = `${fieldLabel}: ${requestedValue}`;

  const actionsMarkup =
    request.status === 'Pendiente'
      ? `
          <div class="row-actions">
            ${renderRowActionButton({
              variantClass: 'row-btn-accept',
              datasetName: 'approve-profile-change',
              datasetValue: request.requestId,
              label: 'Aprobar',
              tooltipLabel: 'Aprobar cambio de perfil',
              iconKey: 'accept',
            })}
            ${renderRowActionButton({
              variantClass: 'row-btn-reject',
              datasetName: 'reject-profile-change',
              datasetValue: request.requestId,
              label: 'Rechazar',
              tooltipLabel: 'Rechazar solicitud de cambio',
              iconKey: 'reject',
            })}
          </div>
        `
      : `<span class="cell-secondary">${escapeHtmlAttribute(reviewedAtLabel)}</span>`;

  return `
    <tr>
      <td data-label="Solicitud">
        <div class="cell-primary">${requestId}</div>
        <div class="cell-secondary">${escapeHtmlAttribute(requestDate)}</div>
      </td>
      <td data-label="Terapeuta">
        <div class="cell-primary">${therapistName}</div>
        <div class="cell-secondary">${therapistEmail}</div>
      </td>
      <td data-label="Cambio solicitado">${valueSummary}</td>
      <td data-label="Motivo">${reason}</td>
      <td data-label="Estado"><span class="inline-status ${statusClass}">${statusLabel}</span></td>
      <td data-label="Acciones">${actionsMarkup}</td>
    </tr>
  `;
}

function profileChangeRequestRowTemplateForTherapist(request) {
  const statusClass = getProfileChangeStatusClass(request.status);
  const requestDate = request.requestedAt ? formatDateTimeLabel(request.requestedAt) : '-';
  const requestId = escapeHtmlAttribute(request.requestId || '-');
  const fieldLabel = escapeHtmlAttribute(request.fieldLabel || getProfileChangeFieldLabel(request.fieldKey));
  const requestedValue = escapeHtmlAttribute(request.requestedValue || '-');
  const reason = escapeHtmlAttribute(request.reason || '-');
  const statusLabel = escapeHtmlAttribute(request.status || 'Pendiente');
  const reviewedBy = escapeHtmlAttribute(request.reviewedBy || 'Pendiente de revision');
  const reviewedDate = request.reviewedAt ? formatDateTimeLabel(request.reviewedAt) : '';

  return `
    <tr>
      <td data-label="Solicitud">${requestId}</td>
      <td data-label="Cambio solicitado">${fieldLabel}: ${requestedValue}</td>
      <td data-label="Motivo">${reason}</td>
      <td data-label="Fecha">${escapeHtmlAttribute(requestDate)}</td>
      <td data-label="Estado"><span class="inline-status ${statusClass}">${statusLabel}</span></td>
      <td data-label="Revision">${reviewedBy}${reviewedDate ? `<br /><span class="cell-secondary">${escapeHtmlAttribute(reviewedDate)}</span>` : ''}</td>
    </tr>
  `;
}

function bindAdminProfileChangeActions() {
  viewContainer.querySelectorAll('[data-approve-profile-change]').forEach((button) => {
    button.addEventListener('click', async () => {
      await approveProfileChangeRequest(String(button.dataset.approveProfileChange));
    });
  });

  viewContainer.querySelectorAll('[data-reject-profile-change]').forEach((button) => {
    button.addEventListener('click', async () => {
      await rejectProfileChangeRequest(String(button.dataset.rejectProfileChange));
    });
  });

  bindRowActionTooltips();
}

function bindTherapistAccountActions() {
  const passwordForm = document.getElementById('therapistPasswordForm');
  const requestForm = document.getElementById('therapistChangeRequestForm');
  const changeFieldSelect = document.getElementById('changeFieldSelect');
  const requestedValueInput = document.getElementById('changeRequestedValue');

  if (passwordForm) {
    passwordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleTherapistPasswordChange(passwordForm);
    });
  }

  if (requestForm) {
    requestForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleTherapistChangeRequest(requestForm);
    });
  }

  if (changeFieldSelect && requestedValueInput) {
    const syncPlaceholder = () => {
      const option = changeFieldSelect.options[changeFieldSelect.selectedIndex];
      const placeholder = option ? option.dataset.placeholder : '';
      requestedValueInput.placeholder = placeholder || 'Ingresa el nuevo valor';
    };

    changeFieldSelect.addEventListener('change', syncPlaceholder);
    syncPlaceholder();
  }
}

function handleTherapistPasswordChange(form) {
  const therapist = getCurrentTherapistProfile();
  if (!therapist) {
    showNotification('No se encontro un perfil de terapeuta para actualizar la contrasena.', 'warning');
    return;
  }

  const formData = new FormData(form);
  const currentPassword = String(formData.get('currentPassword') || '').trim();
  const newPassword = String(formData.get('newPassword') || '').trim();
  const confirmPassword = String(formData.get('confirmPassword') || '').trim();

  const securityRecord = getTherapistSecurityRecord(therapist.id);
  if (currentPassword !== securityRecord.password) {
    showNotification('La contrasena actual es incorrecta.', 'warning');
    return;
  }

  if (!validateStrongPassword(newPassword)) {
    showNotification('La nueva contrasena debe tener minimo 10 caracteres, mayuscula, minuscula, numero y simbolo.', 'warning');
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('La confirmacion de contrasena no coincide.', 'warning');
    return;
  }

  if (newPassword === currentPassword) {
    showNotification('La nueva contrasena debe ser diferente de la actual.', 'warning');
    return;
  }

  securityRecord.password = newPassword;
  securityRecord.updatedAt = new Date().toISOString();
  therapistSecurity[String(therapist.id)] = securityRecord;
  saveTherapistSecurity();

  form.reset();
  renderAccountView();
  showNotification('Contrasena actualizada correctamente.', 'success');
}

function handleTherapistChangeRequest(form) {
  const therapist = getCurrentTherapistProfile();
  if (!therapist) {
    showNotification('No se encontro el perfil del terapeuta para crear la solicitud.', 'warning');
    return;
  }

  const formData = new FormData(form);
  const fieldKey = String(formData.get('fieldKey') || '').trim();
  const requestedValue = String(formData.get('requestedValue') || '').trim();
  const reason = String(formData.get('reason') || '').trim();

  const fieldLabel = getProfileChangeFieldLabel(fieldKey);
  if (!fieldKey || fieldLabel === 'Campo no identificado') {
    showNotification('Selecciona un campo valido para solicitar la correccion.', 'warning');
    return;
  }

  const validationResult = validateProfileChangeValue(fieldKey, requestedValue, therapist.id);
  if (!validationResult.valid) {
    showNotification(validationResult.message, 'warning');
    return;
  }

  if (reason.length < 10) {
    showNotification('Describe el motivo con al menos 10 caracteres para enviar la solicitud.', 'warning');
    return;
  }

  const hasPendingSameField = profileChangeRequests.some(
    (request) =>
      request.therapistId === therapist.id && request.fieldKey === fieldKey && request.status === 'Pendiente',
  );

  if (hasPendingSameField) {
    showNotification('Ya existe una solicitud pendiente para este campo.', 'info');
    return;
  }

  profileChangeRequests.unshift({
    requestId: `chg-${Date.now()}`,
    therapistId: therapist.id,
    therapistName: therapist.name,
    therapistEmail: therapist.email,
    fieldKey,
    fieldLabel,
    requestedValue,
    reason,
    status: 'Pendiente',
    requestedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  });

  saveProfileChangeRequests();
  renderAccountView();
  showNotification('Solicitud enviada. Queda pendiente de aprobacion del administrador.', 'success');
}

async function approveProfileChangeRequest(requestId) {
  if (currentRole !== 'Administrador') {
    return;
  }

  const request = profileChangeRequests.find((item) => item.requestId === requestId);
  if (!request || request.status !== 'Pendiente') {
    showNotification('La solicitud ya fue procesada o no existe.', 'info');
    return;
  }

  const shouldApprove = await confirmAction({
    title: 'Aprobar solicitud',
    message: `Deseas aprobar el cambio de ${request.fieldLabel} para ${request.therapistName}?`,
    confirmLabel: 'Aprobar',
    cancelLabel: 'Cancelar',
    variant: 'warning',
  });

  if (!shouldApprove) {
    return;
  }

  const applyResult = await applyProfileChangeRequest(request);
  if (!applyResult.success) {
    showNotification(applyResult.message, 'warning');
    return;
  }

  request.status = 'Aprobada';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = getCurrentAccountName();

  saveProfileChangeRequests();
  renderAccountView();
  showNotification('Solicitud aprobada y cambios aplicados al perfil del terapeuta.', 'success');
}

async function rejectProfileChangeRequest(requestId) {
  if (currentRole !== 'Administrador') {
    return;
  }

  const request = profileChangeRequests.find((item) => item.requestId === requestId);
  if (!request || request.status !== 'Pendiente') {
    showNotification('La solicitud ya fue procesada o no existe.', 'info');
    return;
  }

  const shouldReject = await confirmAction({
    title: 'Rechazar solicitud',
    message: `Deseas rechazar la solicitud de cambio de ${request.fieldLabel} para ${request.therapistName}?`,
    confirmLabel: 'Rechazar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
  });

  if (!shouldReject) {
    return;
  }

  request.status = 'Rechazada';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = getCurrentAccountName();
  saveProfileChangeRequests();
  renderAccountView();
  showNotification('Solicitud rechazada.', 'info');
}

function validateProfileChangeValue(fieldKey, value, therapistId) {
  const normalizedValue = String(value || '').trim();
  if (normalizedValue.length < 4) {
    return {
      valid: false,
      message: 'El nuevo valor debe contener al menos 4 caracteres.',
    };
  }

  if (fieldKey === 'email') {
    const email = normalizedValue.toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        valid: false,
        message: 'Ingresa un correo valido para continuar.',
      };
    }

    const duplicateEmail = terapeutas.find(
      (therapist) => therapist.id !== therapistId && String(therapist.email || '').toLowerCase() === email,
    );

    if (duplicateEmail) {
      return {
        valid: false,
        message: 'Ese correo ya esta registrado en otro terapeuta.',
      };
    }
  }

  if (fieldKey === 'phone' || fieldKey === 'emergencyPhone') {
    if (!validatePhone10(normalizedValue)) {
      return {
        valid: false,
        message: 'El telefono debe contener 10 digitos numericos.',
      };
    }
  }

  return {
    valid: true,
    message: '',
  };
}

async function applyProfileChangeRequest(request) {
  const therapist = terapeutas.find((item) => item.id === request.therapistId);
  if (!therapist) {
    return {
      success: false,
      message: 'No se encontro el terapeuta asociado a la solicitud.',
    };
  }

  const validation = validateProfileChangeValue(request.fieldKey, request.requestedValue, therapist.id);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
    };
  }

  therapist[request.fieldKey] = String(request.requestedValue || '').trim();
  therapist.status = 'Actualizado';

  if (request.fieldKey === 'email') {
    request.therapistEmail = therapist.email;
  }

  request.therapistName = therapist.name;
  const therapistSaved = await upsertTherapistRecord(therapist);
  if (!therapistSaved) {
    return {
      success: false,
      message: getLastSupabaseDbError() || 'No se pudo aplicar el cambio en Supabase. Verifica permisos y reintenta.',
    };
  }

  await saveTherapists();

  return {
    success: true,
    message: '',
  };
}

function getProfileChangeRequestsForAdmin() {
  return [...profileChangeRequests].sort(
    (a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime(),
  );
}

function getProfileChangeRequestsForTherapist(therapistId) {
  return [...profileChangeRequests]
    .filter((request) => request.therapistId === therapistId)
    .sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
}

function saveProfileChangeRequests() {
  void webStateSet(WEB_STATE_KEYS.profileChangeRequests, profileChangeRequests);
}

function getTherapistSecurityRecord(therapistId) {
  const key = String(therapistId);
  if (!therapistSecurity[key]) {
    therapistSecurity[key] = {
      password: '',
      updatedAt: null,
    };
  }

  return therapistSecurity[key];
}

function saveTherapistSecurity() {
  void webStateSet(WEB_STATE_KEYS.therapistSecurity, therapistSecurity);
}

function bindTherapistActions() {
  viewContainer.querySelectorAll('[data-approve-request]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const requestId = String(btn.dataset.approveRequest);
      approveTherapistRequest(requestId);
    });
  });

  viewContainer.querySelectorAll('[data-reject-request]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const requestId = String(btn.dataset.rejectRequest);
      rejectTherapistRequest(requestId);
    });
  });

  viewContainer.querySelectorAll('[data-read-therapist]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const therapist = terapeutas.find((t) => t.id === Number(btn.dataset.readTherapist));
      if (therapist) {
        openInfoModal('Detalle de terapeuta', `
          <p><strong>Rol:</strong> ${therapist.role}</p>
          <p><strong>Nombre:</strong> ${therapist.name}</p>
          <p><strong>Cedula profesional:</strong> ${therapist.professionalLicense}</p>
          <p><strong>CURP:</strong> ${therapist.curp}</p>
          <p><strong>Fecha de nacimiento:</strong> ${therapist.birthDate}</p>
          <p><strong>Telefono:</strong> ${therapist.phone}</p>
          <p><strong>Correo:</strong> ${therapist.email}</p>
          <p><strong>Nombre de usuario:</strong> ${therapist.username || '-'}</p>
          <p><strong>Direccion:</strong> ${therapist.address}</p>
          <p><strong>Especializacion:</strong> ${therapist.specialization}</p>
          <p><strong>Certificaciones:</strong> ${therapist.certifications}</p>
          <p><strong>Experiencia:</strong> ${therapist.experienceYears} anios</p>
          <p><strong>Institucion:</strong> ${therapist.institution}</p>
          <p><strong>Licencia sanitaria:</strong> ${therapist.healthLicense || 'No registrada'}</p>
          <p><strong>Contacto de emergencia:</strong> ${therapist.emergencyContact} (${therapist.emergencyPhone})</p>
          <p><strong>Estado:</strong> ${therapist.status}</p>
        `);
      }
    });
  });

  viewContainer.querySelectorAll('[data-edit-therapist]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openTherapistModal('edit', Number(btn.dataset.editTherapist));
    });
  });

  viewContainer.querySelectorAll('[data-delete-therapist]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.deleteTherapist);
      const shouldDelete = await confirmAction({
        title: 'Eliminar terapeuta',
        message: 'Deseas eliminar al terapeuta seleccionado?',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        variant: 'danger',
      });

      if (!shouldDelete) {
        return;
      }

      const idx = terapeutas.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const therapist = terapeutas[idx];
        const therapistDeleted = await deleteTherapistRecord(therapist);
        if (!therapistDeleted) {
          showNotification(getLastSupabaseDbError() || 'No se pudo eliminar el terapeuta en Supabase. Intenta nuevamente.', 'warning');
          return;
        }

        terapeutas.splice(idx, 1);
        await saveTherapists();
        renderAdminTherapists();
        showNotification('Terapeuta eliminado correctamente.', 'success');
      }
    });
  });

  bindRowActionTooltips();
}

async function approveTherapistRequest(requestId) {
  const request = pendingTherapistRequests.find((item) => item.requestId === requestId);
  if (!request) {
    return;
  }

  const fullName = buildFullName(
    request.nombres,
    request.apellido_paterno,
    request.apellido_materno,
  );
  const requestEmail = normalizeEmail(request.correo);
  const requestedUsername = normalizeUsername(request.username);
  const therapistUsername = buildUniqueTherapistUsername(
    requestedUsername,
    null,
    requestEmail,
    fullName,
    request.curp,
  );

  const duplicate = terapeutas.find(
    (item) =>
      normalizeEmail(item.email) === requestEmail ||
      item.curp === request.curp ||
      item.professionalLicense === request.cedula_profesional ||
      (requestedUsername && normalizeUsername(item.username) === requestedUsername),
  );

  if (duplicate) {
    showNotification(
      'No se puede aprobar: ya existe un terapeuta con el mismo correo, CURP, cedula o nombre de usuario.',
      'warning',
    );
    return;
  }

  const authResult = await createTherapistAuthAccount({
    email: requestEmail,
    username: therapistUsername,
    password: String(request.contrasena || '').trim(),
    fullName,
    phone: String(request.telefono || '').trim(),
    specialization: String(request.especializacion || '').trim(),
  });

  if (!authResult.ok) {
    showNotification(authResult.message, 'warning');
    return;
  }

  terapeutas.push({
    id: getNextId(terapeutas),
    authUserId: authResult.userId,
    role: 'Terapeuta',
    firstNames: request.nombres,
    lastNamePaternal: request.apellido_paterno,
    lastNameMaternal: request.apellido_materno,
    name: buildFullName(request.nombres, request.apellido_paterno, request.apellido_materno),
    professionalLicense: request.cedula_profesional,
    curp: request.curp,
    birthDate: request.fecha_nacimiento,
    phone: request.telefono,
    email: requestEmail,
    username: therapistUsername,
    address: request.address || 'Pendiente por actualizar',
    specialization: request.especializacion,
    certifications: request.certifications || 'Pendiente por validar',
    experienceYears: Number(request.experienceYears || 0),
    institution: request.institution || 'Pendiente por validar',
    healthLicense: request.healthLicense || '',
    emergencyContact: request.emergencyContact || 'Pendiente por registrar',
    emergencyPhone: request.emergencyPhone || request.telefono,
    status: 'Verificado',
  });

  const createdTherapist = terapeutas[terapeutas.length - 1];
  const therapistPersisted = await upsertTherapistRecord(createdTherapist);
  if (!therapistPersisted) {
    terapeutas.pop();
    showNotification(getLastSupabaseDbError() || 'No se pudo registrar el terapeuta en Supabase. Verifica permisos y reintenta.', 'warning');
    return;
  }

  pendingTherapistRequests = pendingTherapistRequests.filter((item) => item.requestId !== requestId);
  await saveTherapists();
  savePendingTherapistRequests();
  renderAdminTherapists();
  showNotification('Solicitud aprobada y cuenta de terapeuta creada.', 'success');
}

async function rejectTherapistRequest(requestId) {
  const shouldReject = await confirmAction({
    title: 'Rechazar solicitud',
    message: 'Deseas rechazar esta solicitud de alta?',
    confirmLabel: 'Rechazar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
  });

  if (!shouldReject) {
    return;
  }

  pendingTherapistRequests = pendingTherapistRequests.filter((item) => item.requestId !== requestId);
  savePendingTherapistRequests();
  renderAdminTherapists();
  showNotification('La solicitud fue rechazada.', 'info');
}

function bindPatientActions() {
  viewContainer.querySelectorAll('[data-read-patient]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const patient = pacientes.find((p) => p.id === Number(btn.dataset.readPatient));
      if (patient) {
        const patientAppointments = getPatientAppointments(patient.id);
        const nextAppointment = patientAppointments.find((appointment) => new Date(appointment.start).getTime() >= Date.now());
        const latestAppointment = patientAppointments.length ? patientAppointments[patientAppointments.length - 1] : null;
        const appointmentPreview = patientAppointments.length
          ? `
              <div class="patient-appointment-preview">
                ${patientAppointments
                  .slice(0, 3)
                  .map(
                    (appointment) =>
                      `<p><strong>${appointment.appointmentType || 'Cita general'}:</strong> ${formatDateTimeLabel(appointment.start)} (${appointment.status || 'Programada'})</p>`,
                  )
                  .join('')}
              </div>
            `
          : '<p>No hay citas registradas para este usuario.</p>';

        openInfoModal('Detalle de paciente', `
          <p><strong>Nombre:</strong> ${patient.name}</p>
          <p><strong>Fecha de nacimiento:</strong> ${patient.birthDate}</p>
          <p><strong>Edad:</strong> ${patient.age}</p>
          <p><strong>Telefono:</strong> ${patient.phone}</p>
          <p><strong>Correo:</strong> ${patient.email || 'No registrado'}</p>
          <p><strong>Direccion:</strong> ${patient.address}</p>
          <p><strong>Diagnostico:</strong> ${patient.diagnosis}</p>
          <p><strong>Mano dominante:</strong> ${patient.dominantHand}</p>
          <p><strong>Nivel de dolor:</strong> ${patient.painLevel}/10</p>
          <p><strong>Antecedentes medicos:</strong> ${patient.medicalHistory}</p>
          <p><strong>Comorbilidades:</strong> ${patient.comorbidities || 'Ninguna'}</p>
          <p><strong>Medicamentos:</strong> ${patient.medications || 'Ninguno'}</p>
          <p><strong>Alergias:</strong> ${patient.allergies || 'Ninguna'}</p>
          <p><strong>Limitaciones funcionales:</strong> ${patient.functionalLimitations}</p>
          <p><strong>Objetivos terapeuticos:</strong> ${patient.therapyGoals}</p>
          <p><strong>Preferencias:</strong> ${patient.preferences || 'Sin especificar'}</p>
          <p><strong>Contraindicaciones:</strong> ${patient.contraindications || 'Ninguna'}</p>
          <p><strong>Contacto emergencia:</strong> ${patient.emergencyContact} (${patient.emergencyPhone})</p>
          <p><strong>Estado:</strong> ${patient.status}</p>
          <p><strong>Citas registradas:</strong> ${patientAppointments.length}</p>
          <p><strong>Proxima cita:</strong> ${nextAppointment ? formatDateTimeLabel(nextAppointment.start) : 'Sin citas programadas'}</p>
          <p><strong>Ultima cita:</strong> ${latestAppointment ? formatDateTimeLabel(latestAppointment.start) : 'Sin historial'}</p>
          ${appointmentPreview}
        `);
      }
    });
  });

  viewContainer.querySelectorAll('[data-schedule-patient]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedPatientId = Number(btn.dataset.schedulePatient);
      calendarActiveTab = 'registro';
      currentView = 'calendario';
      renderApp();
      showNotification('Paciente enviado al modulo de agenda para registrar su cita.', 'info', 2600);
    });
  });

  viewContainer.querySelectorAll('[data-edit-patient]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPatientModal('edit', Number(btn.dataset.editPatient));
    });
  });

  viewContainer.querySelectorAll('[data-delete-patient]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.deletePatient);
      const shouldDelete = await confirmAction({
        title: 'Eliminar paciente',
        message: 'Deseas eliminar al paciente seleccionado?',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        variant: 'danger',
      });

      if (!shouldDelete) {
        return;
      }

      const idx = pacientes.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const patient = pacientes[idx];
        const patientDeleted = await deletePatientRecord(patient);
        if (!patientDeleted) {
          showNotification(getLastSupabaseDbError() || 'No se pudo eliminar el paciente en Supabase. Intenta nuevamente.', 'warning');
          return;
        }

        const removedAppointments = citas.filter((appointment) => sameId(appointment.patientId, id)).length;
        citas = citas.filter((appointment) => !sameId(appointment.patientId, id));
        if (removedAppointments) {
          saveAppointments();
        }

        pacientes.splice(idx, 1);
        await savePatients();
        if (selectedPatientId === id) {
          selectedPatientId = pacientes.length ? pacientes[0].id : null;
        }
        renderTherapistPatients();
        showNotification(
          removedAppointments
            ? `Paciente eliminado junto con ${removedAppointments} cita(s) asociada(s).`
            : 'Paciente eliminado correctamente.',
          'success',
        );
      }
    });
  });

  bindRowActionTooltips();
}

function bindPrescriptionPatients() {
  viewContainer.querySelectorAll('[data-patient-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedPatientId = Number(btn.dataset.patientId);
      renderPrescriptionModule();
    });
  });
}

function bindPrescriptionControls() {
  const forceSlider = document.getElementById('forceSlider');
  const contractionSlider = document.getElementById('contractionSlider');
  const restSlider = document.getElementById('restSlider');

  const forceValue = document.getElementById('forceValue');
  const contractionValue = document.getElementById('contractionValue');
  const restValue = document.getElementById('restValue');

  const sync = () => {
    forceValue.textContent = `${forceSlider.value} N`;
    contractionValue.textContent = `${contractionSlider.value} s`;
    restValue.textContent = `${restSlider.value} s`;
    renderEffortChart();
  };

  forceSlider.addEventListener('input', sync);
  contractionSlider.addEventListener('input', sync);
  restSlider.addEventListener('input', sync);

  document.getElementById('sendPrescriptionBtn').addEventListener('click', () => {
    showNotification('Prescripcion sincronizada con la esfera IoT del paciente seleccionado.', 'success');
  });
}

function updatePrescriptionKpis() {
  const patient = pacientes.find((p) => p.id === selectedPatientId);
  if (!patient) {
    return;
  }

  document.getElementById('rxMaxForce').textContent = `${patient.maxForce} N`;
  document.getElementById('rxAdherence').textContent = `${patient.adherence} dias`;
  document.getElementById('rxProgress').textContent = `${patient.progress}%`;
}

function renderEffortChart() {
  const canvas = document.getElementById('effortChart');
  if (!canvas || typeof Chart === 'undefined') {
    return;
  }

  const force = Number(document.getElementById('forceSlider').value);
  const contraction = Number(document.getElementById('contractionSlider').value);
  const rest = Number(document.getElementById('restSlider').value);

  const points = buildEffortWave(force, contraction, rest);
  destroyChart();

  effortChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: points.map((_, idx) => idx),
      datasets: [
        {
          label: 'Curva de esfuerzo resultante',
          data: points,
          borderColor: '#ff6b00',
          backgroundColor: 'rgba(255, 107, 0, 0.2)',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: 'rgba(56,56,56,0.5)' },
          ticks: { color: '#a9b1ba' },
          title: { display: true, text: 'Tiempo', color: '#a9b1ba' },
        },
        y: {
          grid: { color: 'rgba(56,56,56,0.5)' },
          ticks: { color: '#a9b1ba' },
          title: { display: true, text: 'Fuerza (N)', color: '#a9b1ba' },
        },
      },
    },
  });
}

function buildEffortWave(force, contraction, rest) {
  const cycle = Math.max(2, contraction + rest);
  const totalPoints = 60;
  const data = [];

  for (let i = 0; i < totalPoints; i += 1) {
    const phase = i % cycle;
    if (phase <= contraction) {
      const ratio = phase / Math.max(1, contraction);
      data.push(Math.round(force * Math.sin((Math.PI / 2) * ratio)));
    } else {
      const decay = (phase - contraction) / Math.max(1, rest);
      data.push(Math.round(force * (1 - decay) * 0.35));
    }
  }

  return data;
}

function openAccountSettings() {
  currentView = 'cuenta';
  renderApp();
}

function openTherapistModal(mode, id) {
  openModal(mode === 'create' ? 'Crear terapeuta' : 'Editar terapeuta', therapistFormTemplate.innerHTML);

  const form = document.getElementById('therapistForm');
  const therapist = terapeutas.find((item) => item.id === id);

  if (mode === 'edit' && therapist) {
    const therapistName = getSplitNameFields(therapist);
    form.firstNames.value = therapistName.firstNames;
    form.lastNamePaternal.value = therapistName.lastNamePaternal;
    form.lastNameMaternal.value = therapistName.lastNameMaternal;
    form.professionalLicense.value = therapist.professionalLicense;
    form.curp.value = therapist.curp;
    form.birthDate.value = therapist.birthDate;
    form.phone.value = therapist.phone;
    form.email.value = therapist.email;
    form.username.value = buildUniqueTherapistUsername(
      therapist.username,
      therapist.id,
      therapist.email,
      therapist.name,
    );
    form.address.value = therapist.address;
    form.specialization.value = therapist.specialization;
    form.certifications.value = therapist.certifications;
    form.experienceYears.value = therapist.experienceYears;
    form.institution.value = therapist.institution;
    form.healthLicense.value = therapist.healthLicense || '';
    form.emergencyContact.value = therapist.emergencyContact;
    form.emergencyPhone.value = therapist.emergencyPhone;
    form.password.required = false;
    form.confirmPassword.required = false;
    form.password.placeholder = 'Dejar vacio para conservar';
    form.confirmPassword.placeholder = 'Dejar vacio para conservar';
    form.privacyConsent.checked = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const firstNames = String(data.get('firstNames')).trim();
    const lastNamePaternal = String(data.get('lastNamePaternal')).trim();
    const lastNameMaternal = String(data.get('lastNameMaternal')).trim();
    const fullName = buildFullName(firstNames, lastNamePaternal, lastNameMaternal);
    const curp = normalizeCurp(String(data.get('curp')).trim());
    if (firstNames.length < 2 || lastNamePaternal.length < 2 || lastNameMaternal.length < 2) {
      showNotification('Debes registrar nombres y ambos apellidos con minimo 2 caracteres.', 'warning');
      return;
    }

    const birthDate = String(data.get('birthDate')).trim();
    const email = String(data.get('email')).trim().toLowerCase();
    const username = normalizeUsername(String(data.get('username') || '').trim());
    const phone = String(data.get('phone')).trim();
    const emergencyPhone = String(data.get('emergencyPhone')).trim();
    const password = String(data.get('password') || '').trim();
    const confirmPassword = String(data.get('confirmPassword') || '').trim();
    let therapistAuthUserId = therapist?.authUserId || null;

    if (!validateCurp(curp)) {
      showNotification('La CURP debe contener exactamente 18 caracteres.', 'warning');
      return;
    }

    if (!/^\d{7,8}$/.test(String(data.get('professionalLicense')).trim())) {
      showNotification('La cedula profesional debe contener 7 u 8 digitos.', 'warning');
      return;
    }

    if (!validateTherapistUsername(username)) {
      showNotification('El nombre de usuario debe tener entre 4 y 40 caracteres y solo usar letras, numeros, punto, guion o guion bajo.', 'warning');
      return;
    }

    if (!validatePhone10(phone) || !validatePhone10(emergencyPhone)) {
      showNotification('Los telefonos deben contener 10 digitos numericos.', 'warning');
      return;
    }

    if (calculateAge(birthDate) < 22) {
      showNotification('La fecha de nacimiento no es valida para un perfil profesional.', 'warning');
      return;
    }

    if (mode === 'create' || password || confirmPassword) {
      if (!validateStrongPassword(password)) {
        showNotification('La contrasena debe tener minimo 10 caracteres, mayuscula, minuscula, numero y simbolo.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        showNotification('La confirmacion de contrasena no coincide.', 'warning');
        return;
      }
    }

    if (mode === 'create') {
      const authResult = await createTherapistAuthAccount({
        email,
        username,
        password,
        fullName,
        phone,
        specialization: String(data.get('specialization')).trim(),
      });

      if (!authResult.ok) {
        showNotification(authResult.message, 'warning');
        return;
      }

      therapistAuthUserId = authResult.userId || null;
    }

    if (!data.get('privacyConsent')) {
      showNotification('Debes aceptar el aviso de privacidad para continuar.', 'warning');
      return;
    }

    const duplicate = terapeutas.find(
      (item) =>
        item.id !== id &&
        (
          normalizeEmail(item.email) === email ||
          item.curp === curp ||
          item.professionalLicense === String(data.get('professionalLicense')).trim() ||
          normalizeUsername(item.username) === username
        ),
    );

    if (duplicate) {
      showNotification('Ya existe un terapeuta con el mismo correo, CURP, cedula o nombre de usuario.', 'warning');
      return;
    }

    if (mode === 'create') {
      const newTherapist = {
        id: getNextId(terapeutas),
        authUserId: therapistAuthUserId,
        role: 'Terapeuta',
        firstNames,
        lastNamePaternal,
        lastNameMaternal,
        name: fullName,
        professionalLicense: String(data.get('professionalLicense')).trim(),
        curp,
        birthDate,
        phone,
        email,
        username,
        address: String(data.get('address')).trim(),
        specialization: String(data.get('specialization')).trim(),
        certifications: String(data.get('certifications')).trim(),
        experienceYears: Number(data.get('experienceYears')),
        institution: String(data.get('institution')).trim(),
        healthLicense: String(data.get('healthLicense')).trim(),
        emergencyContact: String(data.get('emergencyContact')).trim(),
        emergencyPhone,
        status: 'Verificado',
      };

      const therapistSaved = await upsertTherapistRecord(newTherapist);
      if (!therapistSaved) {
        showNotification(getLastSupabaseDbError() || 'No se pudo guardar el terapeuta en Supabase. Verifica permisos y reintenta.', 'warning');
        return;
      }

      terapeutas.push(newTherapist);
    } else if (therapist) {
      therapist.firstNames = firstNames;
      therapist.lastNamePaternal = lastNamePaternal;
      therapist.lastNameMaternal = lastNameMaternal;
      therapist.authUserId = therapistAuthUserId;
      therapist.name = fullName;
      therapist.professionalLicense = String(data.get('professionalLicense')).trim();
      therapist.curp = curp;
      therapist.birthDate = birthDate;
      therapist.phone = phone;
      therapist.email = email;
      therapist.username = username;
      therapist.address = String(data.get('address')).trim();
      therapist.specialization = String(data.get('specialization')).trim();
      therapist.certifications = String(data.get('certifications')).trim();
      therapist.experienceYears = Number(data.get('experienceYears'));
      therapist.institution = String(data.get('institution')).trim();
      therapist.healthLicense = String(data.get('healthLicense')).trim();
      therapist.emergencyContact = String(data.get('emergencyContact')).trim();
      therapist.emergencyPhone = emergencyPhone;
      therapist.status = 'Actualizado';

      const therapistSaved = await upsertTherapistRecord(therapist);
      if (!therapistSaved) {
        showNotification(getLastSupabaseDbError() || 'No se pudo actualizar el terapeuta en Supabase. Intenta nuevamente.', 'warning');
        return;
      }
    }

    closeModal();
    await saveTherapists();
    renderAdminTherapists();
    showNotification(mode === 'create' ? 'Terapeuta creado correctamente.' : 'Terapeuta actualizado correctamente.', 'success');
  });
}

function openPatientModal(mode, id) {
  openModal(mode === 'create' ? 'Crear paciente' : 'Editar paciente', patientFormTemplate.innerHTML);

  const form = document.getElementById('patientForm');
  const patient = pacientes.find((item) => item.id === id);

  if (mode === 'edit' && patient) {
    const patientName = getSplitNameFields(patient);
    form.firstNames.value = patientName.firstNames;
    form.lastNamePaternal.value = patientName.lastNamePaternal;
    form.lastNameMaternal.value = patientName.lastNameMaternal;
    form.birthDate.value = patient.birthDate;
    form.phone.value = patient.phone;
    form.email.value = patient.email || '';
    form.address.value = patient.address;
    form.diagnosis.value = patient.diagnosis;
    form.dominantHand.value = patient.dominantHand;
    form.painLevel.value = patient.painLevel;
    form.emergencyContact.value = patient.emergencyContact;
    form.emergencyPhone.value = patient.emergencyPhone;
    form.medicalHistory.value = patient.medicalHistory;
    form.comorbidities.value = patient.comorbidities || '';
    form.medications.value = patient.medications || '';
    form.allergies.value = patient.allergies || '';
    form.functionalLimitations.value = patient.functionalLimitations;
    form.therapyGoals.value = patient.therapyGoals;
    form.preferences.value = patient.preferences || '';
    form.contraindications.value = patient.contraindications || '';
    form.dataConsent.checked = true;
    form.accessPassword.required = false;
    form.confirmAccessPassword.required = false;
    form.accessPassword.placeholder = 'Solo para nuevas cuentas';
    form.confirmAccessPassword.placeholder = 'Solo para nuevas cuentas';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const firstNames = String(data.get('firstNames')).trim();
    const lastNamePaternal = String(data.get('lastNamePaternal')).trim();
    const lastNameMaternal = String(data.get('lastNameMaternal')).trim();
    const fullName = buildFullName(firstNames, lastNamePaternal, lastNameMaternal);
    const birthDate = String(data.get('birthDate')).trim();
    const email = String(data.get('email') || '')
      .trim()
      .toLowerCase();
    const accessPassword = String(data.get('accessPassword') || '').trim();
    const confirmAccessPassword = String(data.get('confirmAccessPassword') || '').trim();
        if (firstNames.length < 2 || lastNamePaternal.length < 2 || lastNameMaternal.length < 2) {
          showNotification('Debes registrar nombres y ambos apellidos con minimo 2 caracteres.', 'warning');
          return;
        }

    const phone = String(data.get('phone')).trim();
    const emergencyPhone = String(data.get('emergencyPhone')).trim();
    const age = calculateAge(birthDate);
    const painLevel = Number(data.get('painLevel'));

    if (age < 1 || age > 120) {
      showNotification('Fecha de nacimiento invalida para expediente de paciente.', 'warning');
      return;
    }

    if (!validatePhone10(phone) || !validatePhone10(emergencyPhone)) {
      showNotification('Telefonos de paciente y emergencia deben contener 10 digitos.', 'warning');
      return;
    }

    if (!data.get('dataConsent')) {
      showNotification('Debes registrar el consentimiento informado para guardar el expediente.', 'warning');
      return;
    }

    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!hasEmail) {
      showNotification('Debes registrar un correo valido para habilitar acceso movil.', 'warning');
      return;
    }

    let patientAccountUserId = null;

    if (mode === 'create') {
      if (!validateStrongPassword(accessPassword)) {
        showNotification('La contrasena de acceso movil debe tener minimo 10 caracteres, mayuscula, minuscula, numero y simbolo.', 'warning');
        return;
      }

      if (accessPassword !== confirmAccessPassword) {
        showNotification('La confirmacion de contrasena para acceso movil no coincide.', 'warning');
        return;
      }

      const patientAccountResult = await createPatientAuthAccount({
        email,
        password: accessPassword,
        fullName,
        phone,
        diagnosis: String(data.get('diagnosis')).trim(),
      });

      if (!patientAccountResult.ok) {
        showNotification(patientAccountResult.message, 'warning');
        return;
      }

      patientAccountUserId = patientAccountResult.userId || null;
    }

    const status = painLevel >= 8 ? 'Alerta de adherencia' : painLevel >= 5 ? 'Sesion pendiente' : 'Sesion completada hoy';
    const statusColor = painLevel >= 8 ? 'status-danger' : painLevel >= 5 ? 'status-warning' : 'status-ok';

    if (mode === 'create') {
      const newPatient = {
        id: getNextId(pacientes),
        authUserId: patientAccountUserId,
        firstNames,
        lastNamePaternal,
        lastNameMaternal,
        name: fullName,
        birthDate,
        age,
        phone,
        email,
        address: String(data.get('address')).trim(),
        diagnosis: String(data.get('diagnosis')).trim(),
        dominantHand: String(data.get('dominantHand')),
        painLevel,
        emergencyContact: String(data.get('emergencyContact')).trim(),
        emergencyPhone,
        medicalHistory: String(data.get('medicalHistory')).trim(),
        comorbidities: String(data.get('comorbidities')).trim(),
        medications: String(data.get('medications')).trim(),
        allergies: String(data.get('allergies')).trim(),
        functionalLimitations: String(data.get('functionalLimitations')).trim(),
        therapyGoals: String(data.get('therapyGoals')).trim(),
        preferences: String(data.get('preferences')).trim(),
        contraindications: String(data.get('contraindications')).trim(),
        status,
        statusColor,
        maxForce: 60,
        adherence: 1,
        progress: 5,
      };

      const patientSaved = await upsertPatientRecord(newPatient);
      if (!patientSaved) {
        showNotification(getLastSupabaseDbError() || 'No se pudo guardar el paciente en Supabase. Verifica permisos y reintenta.', 'warning');
        return;
      }

      pacientes.push(newPatient);
    } else if (patient) {
      patient.firstNames = firstNames;
      patient.lastNamePaternal = lastNamePaternal;
      patient.lastNameMaternal = lastNameMaternal;
      patient.name = fullName;
      patient.birthDate = birthDate;
      patient.age = age;
      patient.phone = phone;
      patient.email = email;
      patient.address = String(data.get('address')).trim();
      patient.diagnosis = String(data.get('diagnosis')).trim();
      patient.dominantHand = String(data.get('dominantHand'));
      patient.painLevel = painLevel;
      patient.emergencyContact = String(data.get('emergencyContact')).trim();
      patient.emergencyPhone = emergencyPhone;
      patient.medicalHistory = String(data.get('medicalHistory')).trim();
      patient.comorbidities = String(data.get('comorbidities')).trim();
      patient.medications = String(data.get('medications')).trim();
      patient.allergies = String(data.get('allergies')).trim();
      patient.functionalLimitations = String(data.get('functionalLimitations')).trim();
      patient.therapyGoals = String(data.get('therapyGoals')).trim();
      patient.preferences = String(data.get('preferences')).trim();
      patient.contraindications = String(data.get('contraindications')).trim();
      patient.status = status;
      patient.statusColor = statusColor;

      const patientSaved = await upsertPatientRecord(patient);
      if (!patientSaved) {
        showNotification(getLastSupabaseDbError() || 'No se pudo actualizar el paciente en Supabase. Intenta nuevamente.', 'warning');
        return;
      }

      syncAppointmentsForPatient(patient);
    }

    closeModal();
    await savePatients();
    renderTherapistPatients();
    showNotification(mode === 'create' ? 'Paciente creado correctamente.' : 'Paciente actualizado correctamente.', 'success');
  });
}

function openInfoModal(title, html) {
  openModal(title, `<div class="form-grid">${html}<button type="button" class="btn-secondary" id="closeInfoBtn">Cerrar</button></div>`);
  document.getElementById('closeInfoBtn').addEventListener('click', closeModal);
}

function getNotificationHost() {
  let host = document.getElementById('appNoticeHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'appNoticeHost';
    host.className = 'app-notice-host';
    document.body.appendChild(host);
  }

  return host;
}

function showNotification(message, type = 'info', duration = 3600) {
  const host = getNotificationHost();
  const notice = document.createElement('article');
  notice.className = `app-notice app-notice-${type}`;

  const text = document.createElement('p');
  text.className = 'app-notice-text';
  text.textContent = String(message || '').trim();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'app-notice-close';
  closeBtn.setAttribute('aria-label', 'Cerrar notificacion');
  closeBtn.textContent = '×';

  notice.append(text, closeBtn);
  host.appendChild(notice);

  const removeNotice = () => {
    notice.classList.remove('is-visible');
    window.setTimeout(() => {
      notice.remove();
    }, 180);
  };

  const timer = window.setTimeout(removeNotice, duration);

  closeBtn.addEventListener('click', () => {
    window.clearTimeout(timer);
    removeNotice();
  });

  window.requestAnimationFrame(() => {
    notice.classList.add('is-visible');
  });
}

function settleModalDecision(value) {
  if (typeof modalDecisionResolver === 'function') {
    const resolver = modalDecisionResolver;
    modalDecisionResolver = null;
    resolver(Boolean(value));
  }
}

function confirmAction({
  title = 'Confirmar accion',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
}) {
  return new Promise((resolve) => {
    modalDecisionResolver = resolve;
    const confirmButtonClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';

    openModal(
      title,
      `
        <div class="confirm-dialog">
          <p class="confirm-dialog-message" id="confirmDialogMessage"></p>
          <div class="confirm-dialog-actions">
            <button type="button" class="btn-secondary" id="confirmDialogCancel">${cancelLabel}</button>
            <button type="button" class="${confirmButtonClass}" id="confirmDialogAccept">${confirmLabel}</button>
          </div>
        </div>
      `,
    );

    const messageNode = document.getElementById('confirmDialogMessage');
    if (messageNode) {
      messageNode.textContent = String(message || '').trim();
    }

    document.getElementById('confirmDialogCancel').addEventListener('click', closeModal);
    document.getElementById('confirmDialogAccept').addEventListener('click', () => {
      settleModalDecision(true);
      closeModal();
    });
  });
}

function openModal(title, contentHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = contentHTML;
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
  settleModalDecision(false);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function sameId(left, right) {
  return String(left ?? '').trim() === String(right ?? '').trim();
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '').trim(),
  );
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function resolveTherapistAuthId(therapist) {
  const candidate = therapist?.authUserId || therapist?.id;
  return isUuid(candidate) ? String(candidate) : null;
}

function resolvePatientAuthId(patient) {
  const candidate = patient?.authUserId || patient?.id;
  return isUuid(candidate) ? String(candidate) : null;
}

function mapAppointmentStatusColor(painLevel, currentStatus) {
  if (String(currentStatus || '').trim()) {
    const normalizedStatus = normalizeText(currentStatus);
    if (normalizedStatus.includes('alerta') || normalizedStatus.includes('critico')) {
      return 'status-danger';
    }
    if (normalizedStatus.includes('pendiente') || normalizedStatus.includes('programad')) {
      return 'status-warning';
    }
    return 'status-ok';
  }

  const level = Number(painLevel || 0);
  if (level >= 8) {
    return 'status-danger';
  }
  if (level >= 5) {
    return 'status-warning';
  }
  return 'status-ok';
}

function getTherapistDisplayName(therapist) {
  const splitName = getSplitNameFields(therapist);
  return buildFullName(splitName.firstNames, splitName.lastNamePaternal, splitName.lastNameMaternal) || therapist.name || 'Sin nombre registrado';
}

function getPatientDisplayName(patient) {
  const splitName = getSplitNameFields(patient);
  return buildFullName(splitName.firstNames, splitName.lastNamePaternal, splitName.lastNameMaternal) || patient.name || 'Sin nombre registrado';
}

function getTherapistStatusClass(status) {
  const normalizedStatus = normalizeText(status);
  if (normalizedStatus.includes('pendiente')) {
    return 'status-warning';
  }
  if (normalizedStatus.includes('rechaz') || normalizedStatus.includes('inactivo')) {
    return 'status-danger';
  }
  return 'status-ok';
}

function getFilteredTherapists() {
  const search = normalizeText(therapistTableFilters.search);

  return terapeutas.filter((therapist) => {
    const normalizedStatus = normalizeText(therapist.status);

    if (therapistTableFilters.status !== 'all') {
      if (therapistTableFilters.status === 'verificado' && !normalizedStatus.includes('verificado')) {
        return false;
      }

      if (therapistTableFilters.status === 'pendiente' && !normalizedStatus.includes('pendiente')) {
        return false;
      }

      if (therapistTableFilters.status === 'actualizado' && !normalizedStatus.includes('actualizado')) {
        return false;
      }
    }

    if (therapistTableFilters.specialization !== 'all' && therapist.specialization !== therapistTableFilters.specialization) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchIndex = normalizeText(
      [
        getTherapistDisplayName(therapist),
        therapist.professionalLicense,
        therapist.curp,
        therapist.email,
        therapist.username,
        therapist.phone,
        therapist.specialization,
        therapist.institution,
      ].join(' '),
    );

    return searchIndex.includes(search);
  });
}

function getFilteredPatients() {
  const search = normalizeText(patientTableFilters.search);

  return pacientes.filter((patient) => {
    if (patientTableFilters.status !== 'all' && patient.statusColor !== patientTableFilters.status) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchIndex = normalizeText(
      [
        getPatientDisplayName(patient),
        patient.phone,
        patient.email,
        patient.diagnosis,
        patient.address,
      ].join(' '),
    );

    return searchIndex.includes(search);
  });
}

function escapeHtmlAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRowActionIcon(iconKey) {
  const icons = {
    view: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L18.4 9.35l-3.75-3.75L3 17.25z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m13.9 6.1 3.75 3.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    accept: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reject: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    schedule: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 2v4M16 2v4M3 10h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13v5M9.5 15.5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cancel: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8.5 8.5 7 7m0-7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  return icons[iconKey] || icons.view;
}

function renderRowActionButton({
  variantClass,
  datasetName,
  datasetValue,
  label,
  tooltipLabel,
  iconKey,
}) {
  const safeDatasetValue = escapeHtmlAttribute(datasetValue);
  const safeTooltip = escapeHtmlAttribute(tooltipLabel || label);

  return `
    <button
      type="button"
      class="row-btn ${variantClass}"
      data-${datasetName}="${safeDatasetValue}"
      data-tooltip="${safeTooltip}"
      aria-label="${safeTooltip}"
    >
      <span class="row-btn-icon" aria-hidden="true">${getRowActionIcon(iconKey)}</span>
    </button>
  `;
}

function getRowActionTooltipNode() {
  if (!rowActionTooltip) {
    rowActionTooltip = document.createElement('div');
    rowActionTooltip.className = 'row-action-tooltip';
    rowActionTooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(rowActionTooltip);
  }

  return rowActionTooltip;
}

function updateRowActionTooltipPosition() {
  if (!rowActionTooltipAnchor) {
    return;
  }

  const node = getRowActionTooltipNode();
  const anchorRect = rowActionTooltipAnchor.getBoundingClientRect();

  node.style.left = '0px';
  node.style.top = '0px';
  node.classList.add('is-visible');

  const margin = 8;
  const tooltipWidth = node.offsetWidth;
  const tooltipHeight = node.offsetHeight;

  let left = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

  let top = anchorRect.top - tooltipHeight - 10;
  let placeBelow = false;
  if (top < margin) {
    top = anchorRect.bottom + 10;
    placeBelow = true;
  }

  node.classList.toggle('is-below', placeBelow);
  node.style.left = `${Math.round(left)}px`;
  node.style.top = `${Math.round(top)}px`;
}

function showRowActionTooltip(target) {
  if (!target) {
    return;
  }

  const label = String(target.getAttribute('data-tooltip') || target.getAttribute('aria-label') || '').trim();
  if (!label) {
    return;
  }

  rowActionTooltipAnchor = target;
  const node = getRowActionTooltipNode();
  node.textContent = label;
  node.classList.add('is-visible');
  updateRowActionTooltipPosition();
}

function hideRowActionTooltip() {
  rowActionTooltipAnchor = null;
  if (rowActionTooltip) {
    rowActionTooltip.classList.remove('is-visible', 'is-below');
  }
}

function bindRowActionTooltips() {
  viewContainer.querySelectorAll('.row-btn[data-tooltip]').forEach((button) => {
    if (button.dataset.tooltipBound === '1') {
      return;
    }

    button.dataset.tooltipBound = '1';
    button.addEventListener('mouseenter', () => showRowActionTooltip(button));
    button.addEventListener('focus', () => showRowActionTooltip(button));
    button.addEventListener('mouseleave', hideRowActionTooltip);
    button.addEventListener('blur', hideRowActionTooltip);
    button.addEventListener('click', hideRowActionTooltip);
  });
}

function therapistRowTemplate(therapist) {
  const therapistName = getTherapistDisplayName(therapist);
  const statusClass = getTherapistStatusClass(therapist.status);
  const experienceYears = Number(therapist.experienceYears);
  const emergencyContact = [therapist.emergencyContact, therapist.emergencyPhone]
    .filter(Boolean)
    .join(' - ');

  return `
    <tr>
      <td data-label="ID">${therapist.id}</td>
      <td data-label="Perfil profesional">
        <div class="cell-primary">${therapistName}</div>
        <div class="cell-secondary">${therapist.specialization || 'Sin especializacion registrada'}</div>
        <span class="inline-status ${statusClass}">${therapist.status || 'Sin estado'}</span>
      </td>
      <td data-label="Contacto">
        <div class="cell-secondary"><strong>Telefono:</strong> ${therapist.phone || '-'}</div>
        <div class="cell-secondary"><strong>Correo:</strong> ${therapist.email || '-'}</div>
        <div class="cell-secondary"><strong>Usuario:</strong> ${therapist.username || '-'}</div>
      </td>
      <td data-label="Credenciales">
        <div class="cell-secondary"><strong>Cedula:</strong> ${therapist.professionalLicense || '-'}</div>
        <div class="cell-secondary"><strong>CURP:</strong> ${therapist.curp || '-'}</div>
        <div class="cell-secondary"><strong>Experiencia:</strong> ${Number.isFinite(experienceYears) ? `${experienceYears} anios` : '-'}</div>
      </td>
      <td data-label="Ubicacion y respaldo">
        <div class="cell-secondary"><strong>Institucion:</strong> ${therapist.institution || '-'}</div>
        <div class="cell-secondary"><strong>Direccion:</strong> ${therapist.address || '-'}</div>
        <div class="cell-secondary"><strong>Emergencia:</strong> ${emergencyContact || '-'}</div>
      </td>
      <td data-label="Acciones">
        <div class="row-actions">
          ${renderRowActionButton({
            variantClass: 'row-btn-view',
            datasetName: 'read-therapist',
            datasetValue: therapist.id,
            label: 'Leer',
            tooltipLabel: 'Ver detalle del terapeuta',
            iconKey: 'view',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-edit',
            datasetName: 'edit-therapist',
            datasetValue: therapist.id,
            label: 'Editar',
            tooltipLabel: 'Editar terapeuta',
            iconKey: 'edit',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-delete',
            datasetName: 'delete-therapist',
            datasetValue: therapist.id,
            label: 'Eliminar',
            tooltipLabel: 'Eliminar terapeuta',
            iconKey: 'delete',
          })}
        </div>
      </td>
    </tr>
  `;
}

function pendingRequestRowTemplate(request) {
  const submittedDate = request.submittedAt
    ? new Date(request.submittedAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
    : '-';
  const requestName = buildFullName(request.nombres, request.apellido_paterno, request.apellido_materno) || 'Sin nombre registrado';

  return `
    <tr>
      <td data-label="Solicitud">${request.requestId || '-'}</td>
      <td data-label="Perfil">
        <div class="cell-primary">${requestName}</div>
        <div class="cell-secondary"><strong>Cedula:</strong> ${request.cedula_profesional || '-'}</div>
        <div class="cell-secondary"><strong>CURP:</strong> ${request.curp || '-'}</div>
        <div class="cell-secondary"><strong>Telefono:</strong> ${request.telefono || '-'}</div>
      </td>
      <td data-label="Correo">${request.correo || '-'}</td>
      <td data-label="Especializacion">${request.especializacion || '-'}</td>
      <td data-label="Fecha">${submittedDate}</td>
      <td data-label="Acciones">
        <div class="row-actions">
          ${renderRowActionButton({
            variantClass: 'row-btn-accept',
            datasetName: 'approve-request',
            datasetValue: request.requestId,
            label: 'Aceptar',
            tooltipLabel: 'Aprobar solicitud',
            iconKey: 'accept',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-reject',
            datasetName: 'reject-request',
            datasetValue: request.requestId,
            label: 'Rechazar',
            tooltipLabel: 'Rechazar solicitud',
            iconKey: 'reject',
          })}
        </div>
      </td>
    </tr>
  `;
}

function patientRowTemplate(patient) {
  const patientName = getPatientDisplayName(patient);
  const therapyGoal = String(patient.therapyGoals || 'Sin objetivo terapeutico').trim();
  const contraindications = String(patient.contraindications || 'Sin contraindicaciones').trim();
  const emergencyContact = [patient.emergencyContact, patient.emergencyPhone]
    .filter(Boolean)
    .join(' - ');
  const patientAppointments = getPatientAppointments(patient.id);
  const nextAppointment = patientAppointments.find((appointment) => new Date(appointment.start).getTime() >= Date.now());

  return `
    <tr>
      <td data-label="ID">${patient.id}</td>
      <td data-label="Perfil del paciente">
        <div class="cell-primary">${patientName}</div>
        <div class="cell-secondary"><strong>Nacimiento:</strong> ${patient.birthDate || '-'}</div>
        <div class="cell-secondary"><strong>Edad:</strong> ${patient.age || '-'} anios | <strong>Mano:</strong> ${patient.dominantHand || '-'}</div>
      </td>
      <td data-label="Estado clinico">
        <div class="cell-secondary"><strong>Diagnostico:</strong> ${patient.diagnosis || '-'}</div>
        <div class="cell-secondary"><strong>Dolor:</strong> ${patient.painLevel}/10</div>
        <span class="inline-status ${patient.statusColor}">${patient.status}</span>
      </td>
      <td data-label="Contacto">
        <div class="cell-secondary"><strong>Telefono:</strong> ${patient.phone || '-'}</div>
        <div class="cell-secondary"><strong>Correo:</strong> ${patient.email || '-'}</div>
        <div class="cell-secondary"><strong>Emergencia:</strong> ${emergencyContact || '-'}</div>
      </td>
      <td data-label="Seguimiento">
        <div class="cell-secondary"><strong>Objetivo:</strong> ${therapyGoal}</div>
        <div class="cell-secondary"><strong>Contraindicaciones:</strong> ${contraindications}</div>
        <div class="cell-secondary"><strong>Citas:</strong> ${patientAppointments.length}</div>
        <div class="cell-secondary"><strong>Proxima:</strong> ${nextAppointment ? formatDateTimeLabel(nextAppointment.start) : 'Sin cita programada'}</div>
      </td>
      <td data-label="Acciones">
        <div class="row-actions">
          ${renderRowActionButton({
            variantClass: 'row-btn-accept',
            datasetName: 'schedule-patient',
            datasetValue: patient.id,
            label: 'Agendar',
            tooltipLabel: 'Agendar cita para paciente',
            iconKey: 'schedule',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-view',
            datasetName: 'read-patient',
            datasetValue: patient.id,
            label: 'Leer',
            tooltipLabel: 'Ver detalle del paciente',
            iconKey: 'view',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-edit',
            datasetName: 'edit-patient',
            datasetValue: patient.id,
            label: 'Editar',
            tooltipLabel: 'Editar paciente',
            iconKey: 'edit',
          })}
          ${renderRowActionButton({
            variantClass: 'row-btn-delete',
            datasetName: 'delete-patient',
            datasetValue: patient.id,
            label: 'Eliminar',
            tooltipLabel: 'Eliminar paciente',
            iconKey: 'delete',
          })}
        </div>
      </td>
    </tr>
  `;
}

function getPatientAvatar(id) {
  const avatars = {
    1: 'https://randomuser.me/api/portraits/women/65.jpg',
    2: 'https://randomuser.me/api/portraits/men/45.jpg',
    3: 'https://randomuser.me/api/portraits/women/33.jpg',
  };

  return avatars[id] || 'https://randomuser.me/api/portraits/lego/2.jpg';
}

function getNextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function buildUniqueTherapistUsername(rawUsername, excludeTherapistId = null, ...fallbackValues) {
  const candidates = [rawUsername, ...fallbackValues];
  let baseUsername = '';

  for (const candidate of candidates) {
    const rawValue = String(candidate || '').trim();
    if (!rawValue) {
      continue;
    }

    const source = rawValue.includes('@') ? rawValue.split('@')[0] : rawValue;
    const sanitized = sanitizeUsernameCandidate(source);
    if (sanitized.length >= 4) {
      baseUsername = sanitized.slice(0, 40);
      break;
    }
  }

  if (!baseUsername) {
    baseUsername = `terapeuta${Date.now().toString().slice(-6)}`;
  }

  let finalUsername = baseUsername;
  let attempt = 1;

  while (
    terapeutas.some(
      (item) =>
        item.id !== excludeTherapistId &&
        normalizeUsername(item.username) === finalUsername,
    )
  ) {
    const suffix = String(attempt);
    const maxBaseLength = Math.max(4, 40 - suffix.length - 1);
    finalUsername = `${baseUsername.slice(0, maxBaseLength)}.${suffix}`;
    attempt += 1;
  }

  return finalUsername;
}

function replaceArrayContent(target, source) {
  target.splice(0, target.length, ...source);
}

function buildDefaultTherapistSecurity() {
  const defaults = {};
  terapeutas.forEach((therapist) => {
    defaults[String(therapist.id)] = {
      password: '',
      updatedAt: null,
    };
  });
  return defaults;
}

async function initializeDashboardState() {
  if (typeof webStateGet !== 'function' || typeof webStateSet !== 'function') {
    therapistSecurity = buildDefaultTherapistSecurity();
    return;
  }

  try {
    const [
      storedTherapists,
      storedPatients,
      storedAppointments,
      storedPendingRequests,
      storedProfileRequests,
      storedTherapistSecurity,
    ] = await Promise.all([
      webStateGet(WEB_STATE_KEYS.therapists, null),
      webStateGet(WEB_STATE_KEYS.patients, null),
      webStateGet(WEB_STATE_KEYS.appointments, null),
      webStateGet(WEB_STATE_KEYS.pendingRequests, []),
      webStateGet(WEB_STATE_KEYS.profileChangeRequests, []),
      webStateGet(WEB_STATE_KEYS.therapistSecurity, null),
    ]);

    const therapistSource = Array.isArray(storedTherapists)
      ? storedTherapists
      : defaultTherapistsSeed;
    replaceArrayContent(terapeutas, therapistSource.map((item) => ({ ...item })));

    let therapistDataNormalized = false;

    terapeutas.forEach((therapist, index) => {
      const normalizedEmail = normalizeEmail(therapist.email);
      if (therapist.email !== normalizedEmail) {
        therapist.email = normalizedEmail;
        therapistDataNormalized = true;
      }

      const candidate = sanitizeUsernameCandidate(therapist.username);
      if (validateTherapistUsername(candidate)) {
        if (therapist.username !== candidate) {
          therapist.username = candidate;
          therapistDataNormalized = true;
        }
        return;
      }

      const generatedUsername = buildUniqueTherapistUsername(
        candidate,
        therapist.id,
        therapist.email,
        therapist.name,
        therapist.curp,
        `terapeuta${index + 1}`,
      );
      if (therapist.username !== generatedUsername) {
        therapist.username = generatedUsername;
        therapistDataNormalized = true;
      }
    });

    const patientSource = Array.isArray(storedPatients)
      ? storedPatients
      : defaultPatientsSeed;
    replaceArrayContent(pacientes, patientSource.map((item) => ({ ...item })));

    const appointmentSource = Array.isArray(storedAppointments)
      ? storedAppointments
      : defaultAppointmentsSeed;
    const normalizedAppointments = appointmentSource
      .map((appointment, index) => normalizeAppointmentRecord(appointment, index))
      .filter(Boolean);
    citas = Array.isArray(storedAppointments)
      ? normalizedAppointments
      : defaultAppointmentsSeed.map((item) => ({ ...item }));

    pendingTherapistRequests = Array.isArray(storedPendingRequests)
      ? storedPendingRequests
      : [];

    profileChangeRequests = Array.isArray(storedProfileRequests)
      ? storedProfileRequests
      : [];

    const defaultSecurity = buildDefaultTherapistSecurity();
    therapistSecurity =
      storedTherapistSecurity &&
      typeof storedTherapistSecurity === 'object' &&
      !Array.isArray(storedTherapistSecurity)
        ? { ...defaultSecurity, ...storedTherapistSecurity }
        : defaultSecurity;

    const bootstrapWrites = [];
    if (!Array.isArray(storedTherapists)) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.therapists, terapeutas));
    } else if (therapistDataNormalized) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.therapists, terapeutas));
    }
    if (!Array.isArray(storedPatients)) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.patients, pacientes));
    }
    if (!Array.isArray(storedAppointments)) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.appointments, citas));
    }
    if (!storedTherapistSecurity || typeof storedTherapistSecurity !== 'object') {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.therapistSecurity, therapistSecurity));
    }
    if (!Array.isArray(storedPendingRequests)) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.pendingRequests, pendingTherapistRequests));
    }
    if (!Array.isArray(storedProfileRequests)) {
      bootstrapWrites.push(webStateSet(WEB_STATE_KEYS.profileChangeRequests, profileChangeRequests));
    }

    if (bootstrapWrites.length) {
      await Promise.all(bootstrapWrites);
    }
  } catch (error) {
    console.warn('No se pudo inicializar el estado desde Supabase:', error);
    therapistSecurity = buildDefaultTherapistSecurity();
  }
}

async function saveTherapists() {
  await webStateSet(WEB_STATE_KEYS.therapists, terapeutas);
}

async function savePatients() {
  await webStateSet(WEB_STATE_KEYS.patients, pacientes);
}

function savePendingTherapistRequests() {
  void webStateSet(WEB_STATE_KEYS.pendingRequests, pendingTherapistRequests);
}

function buildAppointmentTitle(patientName, appointmentType) {
  const safePatientName = String(patientName || '').trim() || 'Usuario sin asignar';
  const safeType = String(appointmentType || '').trim() || 'Cita general';
  return `${safeType} - ${safePatientName}`;
}

function toDateTimeStorageValue(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part) => String(part).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function toDateTimeInputValue(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part) => String(part).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addMinutesToDateTime(startValue, minutes) {
  const date = new Date(startValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  date.setMinutes(date.getMinutes() + Number(minutes || 0));
  return toDateTimeStorageValue(date);
}

function getDurationMinutes(startValue, endValue) {
  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 45;
  }

  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return Math.max(15, minutes || 45);
}

function getSuggestedAppointmentDate() {
  const suggestion = new Date();
  suggestion.setMinutes(suggestion.getMinutes() + 30);
  suggestion.setSeconds(0, 0);

  const roundedMinutes = Math.ceil(suggestion.getMinutes() / 15) * 15;
  if (roundedMinutes === 60) {
    suggestion.setHours(suggestion.getHours() + 1);
    suggestion.setMinutes(0);
  } else {
    suggestion.setMinutes(roundedMinutes);
  }

  return toDateTimeInputValue(suggestion);
}

function formatDateTimeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return date.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function hasPatientAppointmentConflict(patientId, start, end, ignoreAppointmentId = null) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return false;
  }

  return citas.some((appointment) => {
    if (Number(appointment.patientId) !== Number(patientId) || appointment.id === ignoreAppointmentId) {
      return false;
    }

    const appointmentStart = new Date(appointment.start).getTime();
    const appointmentEndSource = appointment.end || addMinutesToDateTime(appointment.start, appointment.durationMinutes || 45);
    const appointmentEnd = new Date(appointmentEndSource).getTime();

    if (!Number.isFinite(appointmentStart) || !Number.isFinite(appointmentEnd)) {
      return false;
    }

    return startTime < appointmentEnd && endTime > appointmentStart;
  });
}

function getPatientAppointments(patientId) {
  return [...citas]
    .filter((appointment) => Number(appointment.patientId) === Number(patientId))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function syncAppointmentsForPatient(patient) {
  let hasChanges = false;

  citas.forEach((appointment) => {
    if (Number(appointment.patientId) !== Number(patient.id)) {
      return;
    }

    const normalizedName = String(patient.name || '').trim();
    const normalizedEmail = String(patient.email || '').trim();
    const appointmentType = String(appointment.appointmentType || '').trim() || 'Cita general';
    const nextTitle = buildAppointmentTitle(normalizedName, appointmentType);

    if (appointment.patientName !== normalizedName) {
      appointment.patientName = normalizedName;
      hasChanges = true;
    }

    if (appointment.patientEmail !== normalizedEmail) {
      appointment.patientEmail = normalizedEmail;
      hasChanges = true;
    }

    if (appointment.title !== nextTitle) {
      appointment.title = nextTitle;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveAppointments();
  }
}

function inferPatientFromAppointment(appointment) {
  const byId = pacientes.find((patient) => patient.id === Number(appointment.patientId));
  if (byId) {
    return byId;
  }

  const patientName = String(appointment.patientName || '').trim();
  if (patientName) {
    const normalizedName = normalizeText(patientName);
    const byName = pacientes.find((patient) => normalizeText(patient.name) === normalizedName);
    if (byName) {
      return byName;
    }
  }

  const title = normalizeText(appointment.title || '');
  return pacientes.find((patient) => title.includes(normalizeText(patient.name))) || null;
}

function normalizeAppointmentRecord(appointment, index) {
  if (!appointment || typeof appointment !== 'object') {
    return null;
  }

  const start = toDateTimeStorageValue(appointment.start);
  if (!start) {
    return null;
  }

  const patient = inferPatientFromAppointment(appointment);
  const rawTitle = String(appointment.title || '').trim();
  const inferredType = rawTitle.includes(' - ') ? rawTitle.split(' - ')[0].trim() : 'Cita general';
  const appointmentType = String(appointment.appointmentType || '').trim() || inferredType || 'Cita general';
  const patientName = patient ? patient.name : String(appointment.patientName || '').trim() || 'Usuario sin asignar';
  const patientEmail = patient ? patient.email || '' : String(appointment.patientEmail || '').trim();
  const duration = Number(appointment.durationMinutes);
  const durationMinutes = Number.isFinite(duration) && duration >= 15 ? duration : 45;
  const end = toDateTimeStorageValue(appointment.end) || addMinutesToDateTime(start, durationMinutes);

  return {
    id: String(appointment.id || `c${Date.now()}${index}`),
    title: rawTitle || buildAppointmentTitle(patientName, appointmentType),
    appointmentType,
    start,
    end,
    durationMinutes: getDurationMinutes(start, end),
    patientId: patient ? patient.id : Number(appointment.patientId) || null,
    patientName,
    patientEmail,
    status: String(appointment.status || 'Programada').trim(),
    modality: String(appointment.modality || 'Presencial').trim(),
    location: String(appointment.location || 'Consultorio principal').trim(),
    notes: String(appointment.notes || '').trim(),
    createdBy: String(appointment.createdBy || getCurrentAccountName() || 'Sistema').trim(),
    createdAt: String(appointment.createdAt || new Date().toISOString()),
  };
}

function findPatientByDbId(patientDbId) {
  const normalizedDbId = String(patientDbId || '').trim();
  if (!normalizedDbId) {
    return null;
  }

  return (
    pacientes.find((patient) => {
      const authId = resolvePatientAuthId(patient);
      if (authId && authId === normalizedDbId) {
        return true;
      }

      return String(patient.id || '').trim() === normalizedDbId;
    }) || null
  );
}

function mapDbAppointmentToLocal(dbAppointment, previousMap = new Map()) {
  if (!dbAppointment || typeof dbAppointment !== 'object') {
    return null;
  }

  const appointmentId = String(dbAppointment.id || '').trim();
  const start = toDateTimeStorageValue(dbAppointment.inicio);
  if (!appointmentId || !start) {
    return null;
  }

  const previous = previousMap.get(appointmentId) || null;
  const patient = findPatientByDbId(dbAppointment.id_paciente);
  const appointmentType = String(dbAppointment.tipo || previous?.appointmentType || 'Cita general').trim();
  const patientName = patient?.name || previous?.patientName || 'Usuario sin asignar';
  const patientEmail = patient?.email || previous?.patientEmail || '';
  const end = toDateTimeStorageValue(dbAppointment.fin) || addMinutesToDateTime(start, previous?.durationMinutes || 45);

  return {
    id: appointmentId,
    title: buildAppointmentTitle(patientName, appointmentType),
    appointmentType,
    start,
    end,
    durationMinutes: getDurationMinutes(start, end),
    patientId: patient?.id || previous?.patientId || null,
    patientName,
    patientEmail,
    status: String(dbAppointment.estado || previous?.status || 'Programada').trim(),
    modality: String(dbAppointment.modalidad || previous?.modality || 'Presencial').trim(),
    location: String(dbAppointment.ubicacion || previous?.location || 'Consultorio principal').trim(),
    notes: String(dbAppointment.notas || previous?.notes || '').trim(),
    createdBy: String(previous?.createdBy || getCurrentAccountName() || 'Sistema').trim(),
    createdAt: String(previous?.createdAt || new Date().toISOString()),
  };
}

async function reloadAppointmentsFromDb() {
  if (!supabaseDbClient) {
    return;
  }

  const { data, error } = await supabaseDbClient
    .from('citas')
    .select('id, id_paciente, inicio, fin, tipo, modalidad, estado, ubicacion, notas')
    .order('inicio', { ascending: true });

  if (error) {
    setLastSupabaseDbError('Fallo al sincronizar citas en tiempo real', error);
    return;
  }

  const previousMap = new Map(citas.map((appointment) => [String(appointment.id), appointment]));
  const syncedAppointments = Array.isArray(data)
    ? data
        .map((item) => mapDbAppointmentToLocal(item, previousMap))
        .filter(Boolean)
    : [];

  if (!syncedAppointments.length) {
    return;
  }

  citas = syncedAppointments;
  saveAppointments();

  if (currentRole === 'Terapeuta' && currentView === 'calendario') {
    renderCalendarView();
  }
}

async function startAppointmentsRealtimeSync() {
  if (!supabaseDbClient || typeof supabaseDbClient.channel !== 'function') {
    return;
  }

  if (appointmentsRealtimeChannel) {
    try {
      await supabaseDbClient.removeChannel(appointmentsRealtimeChannel);
    } catch (error) {
      console.warn('No se pudo limpiar el canal de citas previo:', error);
    }
    appointmentsRealtimeChannel = null;
  }

  await reloadAppointmentsFromDb();

  appointmentsRealtimeChannel = supabaseDbClient
    .channel(`dashboard-citas-live-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'citas',
      },
      () => {
        void reloadAppointmentsFromDb();
      },
    )
    .subscribe();
}

function saveAppointments() {
  void webStateSet(WEB_STATE_KEYS.appointments, citas);
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return -1;
  }

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function normalizeCurp(value) {
  return value.toUpperCase().replace(/\s+/g, '');
}

function validateCurp(curp) {
  return String(curp || '').length === 18;
}

function validatePhone10(phone) {
  return /^\d{10}$/.test(phone);
}

function validateStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(password);
}

function resetLastSupabaseDbError() {
  lastSupabaseDbErrorMessage = '';
}

function setLastSupabaseDbError(context, error) {
  const parts = [
    context || 'Error en Supabase',
    error?.message || null,
    error?.details || null,
    error?.hint || null,
    error?.code ? `code: ${error.code}` : null,
  ].filter(Boolean);

  lastSupabaseDbErrorMessage = parts.join(' | ');
}

function getLastSupabaseDbError() {
  return String(lastSupabaseDbErrorMessage || '').trim();
}

function formatSupabaseAuthError(error) {
  const rawMessage = String(error?.message || 'Error desconocido de autenticacion').trim();
  const lowerMessage = rawMessage.toLowerCase();
  const errorCode = String(error?.code || '').trim();

  if (errorCode === 'over_email_send_rate_limit' || lowerMessage.includes('rate limit')) {
    return `${rawMessage}. Se alcanzo el limite de correos de autenticacion. Espera unos minutos o desactiva temporalmente Confirm email en Supabase > Authentication > Providers > Email para pruebas.`;
  }

  if (lowerMessage.includes('signup is disabled') || lowerMessage.includes('signups not allowed')) {
    return `${rawMessage}. Activa Email signups en Supabase > Authentication > Providers > Email.`;
  }

  if (lowerMessage.includes('admin') && lowerMessage.includes('only')) {
    return `${rawMessage}. Este flujo usa signUp de cliente anon; habilita Email signups y evita endpoints de Admin API para el front.`;
  }

  if (lowerMessage.includes('email') && lowerMessage.includes('not confirmed')) {
    return `${rawMessage}. Confirma el correo del usuario o desactiva temporalmente Confirm email para pruebas.`;
  }

  if (lowerMessage.includes('user already registered')) {
    return `${rawMessage}. Prueba con otro correo o reutiliza la cuenta existente.`;
  }

  if (errorCode === 'user_already_exists') {
    return `${rawMessage}. La cuenta ya existe en Auth; si conoces la contrasena, el sistema puede reutilizarla para vincular el perfil.`;
  }

  if (errorCode) {
    return `${rawMessage} (code: ${errorCode}).`;
  }

  return rawMessage;
}

async function resolveExistingAuthUser(email, password) {
  if (!supabaseAuthClient) {
    return {
      ok: false,
      message: 'No se pudo validar la cuenta existente en Supabase Auth.',
      userId: null,
    };
  }

  const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user?.id) {
    return {
      ok: false,
      message:
        'El correo ya existe en Auth y no coincide la contrasena capturada. Usa otra cuenta o restablece la contrasena.',
      userId: null,
    };
  }

  await supabaseAuthClient.auth.signOut();

  return {
    ok: true,
    message: 'Cuenta existente validada correctamente.',
    userId: data.user.id,
  };
}

function isAuthUserAlreadyExistsError(error) {
  const errorCode = String(error?.code || '').trim().toLowerCase();
  const lowerMessage = String(error?.message || '').toLowerCase();

  return (
    errorCode === 'user_already_exists' ||
    lowerMessage.includes('user already') ||
    lowerMessage.includes('already registered')
  );
}

async function createPatientAuthAccount({ email, password, fullName, phone, diagnosis }) {
  if (!supabaseAuthClient || !supabaseDbClient) {
    return {
      ok: false,
      message: 'Supabase no esta disponible en esta vista. Verifica la carga de scripts.',
    };
  }

  const { data: duplicateByEmail, error: duplicateByEmailError } = await supabaseDbClient
    .from('pacientes')
    .select('id_paciente')
    .eq('email', email)
    .limit(1);

  if (!duplicateByEmailError && Array.isArray(duplicateByEmail) && duplicateByEmail.length > 0) {
    return {
      ok: false,
      message: 'Ya existe un paciente registrado con ese correo en Supabase.',
    };
  }

  const { data, error } = await supabaseAuthClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'paciente',
        full_name: fullName,
        phone,
        diagnosis,
      },
    },
  });

  if (error) {
    if (isAuthUserAlreadyExistsError(error)) {
      const existingAccount = await resolveExistingAuthUser(email, password);
      if (!existingAccount.ok) {
        return {
          ok: false,
          message: existingAccount.message,
        };
      }

      return {
        ok: true,
        message: 'La cuenta de acceso movil ya existia en Auth y se reutilizo para vincular al paciente.',
        userId: existingAccount.userId,
      };
    }

    return {
      ok: false,
      message: `No se pudo crear la cuenta en Supabase Auth: ${formatSupabaseAuthError(error)}`,
    };
  }

  const identities = Array.isArray(data?.user?.identities) ? data.user.identities : [];
  if (identities.length === 0) {
    const existingAccount = await resolveExistingAuthUser(email, password);
    if (!existingAccount.ok) {
      return {
        ok: false,
        message: existingAccount.message,
      };
    }

    return {
      ok: true,
      message: 'La cuenta de acceso movil ya existia y se reutilizo para vincular al paciente.',
      userId: existingAccount.userId,
    };
  }

  if (!data?.user?.id) {
    return {
      ok: false,
      message: 'Supabase no devolvio un usuario valido para la cuenta creada.',
    };
  }

  return {
    ok: true,
    message: 'Cuenta creada',
    userId: data.user.id,
  };
}

async function createTherapistAuthAccount({
  email,
  username,
  password,
  fullName,
  phone,
  specialization,
}) {
  if (!supabaseAuthClient || !supabaseDbClient) {
    return {
      ok: false,
      message: 'Supabase no esta disponible en esta vista. Verifica la carga de scripts.',
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  if (!validateTherapistUsername(normalizedUsername)) {
    return {
      ok: false,
      message: 'El nombre de usuario del terapeuta no cumple con el formato requerido.',
    };
  }

  const { data: duplicateByEmail, error: duplicateByEmailError } =
    await supabaseDbClient
      .from('terapeutas')
      .select('id_terapeuta')
      .eq('email', normalizedEmail)
      .limit(1);

  if (
    !duplicateByEmailError &&
    Array.isArray(duplicateByEmail) &&
    duplicateByEmail.length > 0
  ) {
    return {
      ok: false,
      message: 'Ya existe un terapeuta registrado con ese correo en Supabase.',
    };
  }

  const { data: duplicateByUsername, error: duplicateByUsernameError } =
    await supabaseDbClient
      .from('terapeutas')
      .select('id_terapeuta')
      .ilike('username', normalizedUsername)
      .limit(1);

  if (
    !duplicateByUsernameError &&
    Array.isArray(duplicateByUsername) &&
    duplicateByUsername.length > 0
  ) {
    return {
      ok: false,
      message: 'Ya existe un terapeuta registrado con ese nombre de usuario en Supabase.',
    };
  }

  const { data, error } = await supabaseAuthClient.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        role: 'terapeuta',
        full_name: fullName,
        phone,
        specialization,
        username: normalizedUsername,
      },
    },
  });

  if (error) {
    if (isAuthUserAlreadyExistsError(error)) {
      const existingAccount = await resolveExistingAuthUser(normalizedEmail, password);
      if (!existingAccount.ok) {
        return {
          ok: false,
          message: existingAccount.message,
        };
      }

      return {
        ok: true,
        message: 'La cuenta del terapeuta ya existia en Auth y se reutilizo para vincular el perfil.',
        userId: existingAccount.userId,
      };
    }

    return {
      ok: false,
      message: `No se pudo crear la cuenta del terapeuta en Supabase Auth: ${formatSupabaseAuthError(error)}`,
    };
  }

  const identities = Array.isArray(data?.user?.identities) ? data.user.identities : [];
  if (identities.length === 0) {
    const existingAccount = await resolveExistingAuthUser(normalizedEmail, password);
    if (!existingAccount.ok) {
      return {
        ok: false,
        message: existingAccount.message,
      };
    }

    return {
      ok: true,
      message: 'La cuenta del terapeuta ya existia en Auth y se reutilizo para vincular el perfil.',
      userId: existingAccount.userId,
    };
  }

  if (!data?.user?.id) {
    return {
      ok: false,
      message: 'Supabase no devolvio un usuario valido para la cuenta del terapeuta.',
    };
  }

  return {
    ok: true,
    message: 'Cuenta creada',
    userId: data.user.id,
  };
}

async function resolveTherapistDbId(therapist) {
  const directId = resolveTherapistAuthId(therapist);
  if (directId) {
    return directId;
  }

  const email = String(therapist?.email || '').trim().toLowerCase();
  if (!email || !supabaseDbClient) {
    return null;
  }

  const { data, error } = await supabaseDbClient
    .from('terapeutas')
    .select('id_terapeuta')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error || !data?.id_terapeuta) {
    return null;
  }

  therapist.authUserId = data.id_terapeuta;
  return data.id_terapeuta;
}

async function resolvePatientDbId(patient) {
  const directId = resolvePatientAuthId(patient);
  if (directId) {
    return directId;
  }

  const email = String(patient?.email || '').trim().toLowerCase();
  if (!email || !supabaseDbClient) {
    return null;
  }

  const { data, error } = await supabaseDbClient
    .from('pacientes')
    .select('id_paciente')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error || !data?.id_paciente) {
    return null;
  }

  patient.authUserId = data.id_paciente;
  return data.id_paciente;
}

function mapTherapistToDbPayload(therapist, therapistDbId) {
  return {
    id_terapeuta: therapistDbId,
    nombre_completo: therapist.name,
    email: therapist.email,
    username: normalizeUsername(therapist.username) || null,
    telefono: therapist.phone,
    especializacion: therapist.specialization,
    estatus: therapist.status || 'Verificado',
    first_names: therapist.firstNames || null,
    last_name_paternal: therapist.lastNamePaternal || null,
    last_name_maternal: therapist.lastNameMaternal || null,
    professional_license: therapist.professionalLicense || null,
    curp: therapist.curp || null,
    birth_date: therapist.birthDate || null,
    address: therapist.address || null,
    certifications: therapist.certifications || null,
    experience_years: Number.isFinite(Number(therapist.experienceYears))
      ? Number(therapist.experienceYears)
      : null,
    institution: therapist.institution || null,
    health_license: therapist.healthLicense || null,
    emergency_contact: therapist.emergencyContact || null,
    emergency_phone: therapist.emergencyPhone || null,
  };
}

function mapPatientToDbPayload(patient, patientDbId) {
  return {
    id_paciente: patientDbId,
    nombre_completo: patient.name,
    email: patient.email,
    telefono: patient.phone,
    diagnostico: patient.diagnosis || null,
    fecha_nacimiento: patient.birthDate || null,
    nivel_rehabilitacion: patient.status || 'Inicial',
    fuerza_actual_pct: Number.isFinite(Number(patient.progress))
      ? Number(patient.progress)
      : 0,
    racha_dias: Number.isFinite(Number(patient.adherence))
      ? Number(patient.adherence)
      : 0,
    sesiones_completadas: 0,
    sesiones_totales: 0,
    progreso_semanal: Number.isFinite(Number(patient.progress))
      ? Number(patient.progress)
      : 0,
    estado: patient.status || 'activo',
    first_names: patient.firstNames || null,
    last_name_paternal: patient.lastNamePaternal || null,
    last_name_maternal: patient.lastNameMaternal || null,
    address: patient.address || null,
    dominant_hand: patient.dominantHand || null,
    pain_level: Number.isFinite(Number(patient.painLevel))
      ? Number(patient.painLevel)
      : null,
    emergency_contact: patient.emergencyContact || null,
    emergency_phone: patient.emergencyPhone || null,
    medical_history: patient.medicalHistory || null,
    comorbidities: patient.comorbidities || null,
    medications: patient.medications || null,
    allergies: patient.allergies || null,
    functional_limitations: patient.functionalLimitations || null,
    therapy_goals: patient.therapyGoals || null,
    preferences: patient.preferences || null,
    contraindications: patient.contraindications || null,
  };
}

async function upsertTherapistRecord(therapist) {
  if (!supabaseDbClient) {
    resetLastSupabaseDbError();
    return true;
  }

  const therapistDbId = await resolveTherapistDbId(therapist);
  if (!therapistDbId) {
    setLastSupabaseDbError(
      'No se pudo resolver id_terapeuta para guardar el perfil',
      { message: `email: ${String(therapist?.email || '').trim()}` },
    );
    return false;
  }

  const payload = mapTherapistToDbPayload(therapist, therapistDbId);
  const { error } = await supabaseDbClient
    .from('terapeutas')
    .upsert(payload, { onConflict: 'id_terapeuta' });

  if (error) {
    setLastSupabaseDbError('Fallo al guardar terapeuta', error);
    return false;
  }

  resetLastSupabaseDbError();
  return !error;
}

async function deleteTherapistRecord(therapist) {
  if (!supabaseDbClient) {
    resetLastSupabaseDbError();
    return true;
  }

  const therapistDbId = await resolveTherapistDbId(therapist);
  if (!therapistDbId) {
    resetLastSupabaseDbError();
    return true;
  }

  const { error } = await supabaseDbClient
    .from('terapeutas')
    .delete()
    .eq('id_terapeuta', therapistDbId);

  if (error) {
    setLastSupabaseDbError('Fallo al eliminar terapeuta', error);
    return false;
  }

  resetLastSupabaseDbError();
  return !error;
}

async function upsertPatientRecord(patient) {
  if (!supabaseDbClient) {
    resetLastSupabaseDbError();
    return true;
  }

  const patientDbId = await resolvePatientDbId(patient);
  if (!patientDbId) {
    setLastSupabaseDbError(
      'No se pudo resolver id_paciente para guardar el expediente',
      { message: `email: ${String(patient?.email || '').trim()}` },
    );
    return false;
  }

  const payload = mapPatientToDbPayload(patient, patientDbId);
  const { error } = await supabaseDbClient
    .from('pacientes')
    .upsert(payload, { onConflict: 'id_paciente' });

  if (error) {
    setLastSupabaseDbError('Fallo al guardar paciente', error);
    return false;
  }

  resetLastSupabaseDbError();
  return !error;
}

async function deletePatientRecord(patient) {
  if (!supabaseDbClient) {
    resetLastSupabaseDbError();
    return true;
  }

  const patientDbId = await resolvePatientDbId(patient);
  if (!patientDbId) {
    resetLastSupabaseDbError();
    return true;
  }

  await supabaseDbClient.from('citas').delete().eq('id_paciente', patientDbId);

  const { error } = await supabaseDbClient
    .from('pacientes')
    .delete()
    .eq('id_paciente', patientDbId);

  if (error) {
    setLastSupabaseDbError('Fallo al eliminar paciente', error);
    return false;
  }

  resetLastSupabaseDbError();
  return !error;
}

async function upsertAppointmentRecord(appointment) {
  if (!supabaseDbClient) {
    resetLastSupabaseDbError();
    return true;
  }

  const patient = pacientes.find((item) => sameId(item.id, appointment.patientId));
  const patientDbId = patient ? await resolvePatientDbId(patient) : null;
  if (!patientDbId) {
    setLastSupabaseDbError(
      'No se pudo resolver id_paciente para guardar la cita',
      { message: `patientId: ${String(appointment?.patientId || '')}` },
    );
    return false;
  }

  const appointmentId = isUuid(appointment.id)
    ? String(appointment.id)
    : createUuid();

  const payload = {
    id: appointmentId,
    id_paciente: patientDbId,
    inicio: appointment.start,
    fin: appointment.end,
    tipo: appointment.appointmentType,
    modalidad: appointment.modality,
    estado: appointment.status,
    ubicacion: appointment.location,
    notas: appointment.notes,
  };

  const { error } = await supabaseDbClient
    .from('citas')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    setLastSupabaseDbError('Fallo al guardar cita', error);
    return false;
  }

  resetLastSupabaseDbError();
  appointment.id = appointmentId;
  return true;
}

async function deleteAppointmentRecord(appointmentId) {
  if (!supabaseDbClient || !isUuid(appointmentId)) {
    resetLastSupabaseDbError();
    return true;
  }

  const { error } = await supabaseDbClient
    .from('citas')
    .delete()
    .eq('id', appointmentId);

  if (error) {
    setLastSupabaseDbError('Fallo al eliminar cita', error);
    return false;
  }

  resetLastSupabaseDbError();
  return !error;
}

function buildFullName(firstNames, lastNamePaternal, lastNameMaternal) {
  return [firstNames, lastNamePaternal, lastNameMaternal].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function getSplitNameFields(record) {
  if (record.firstNames && record.lastNamePaternal && record.lastNameMaternal) {
    return {
      firstNames: record.firstNames,
      lastNamePaternal: record.lastNamePaternal,
      lastNameMaternal: record.lastNameMaternal,
    };
  }

  const rawName = String(record.name || '').trim().replace(/\s+/g, ' ');
  const parts = rawName ? rawName.split(' ') : [];

  return {
    firstNames: parts.slice(0, Math.max(parts.length - 2, 1)).join(' '),
    lastNamePaternal: parts.length >= 2 ? parts[parts.length - 2] : '',
    lastNameMaternal: parts.length >= 3 ? parts[parts.length - 1] : '',
  };
}

function destroyChart() {
  if (effortChart) {
    effortChart.destroy();
    effortChart = null;
  }
}

function destroyCalendar() {
  if (calendarRef) {
    calendarRef.destroy();
    calendarRef = null;
  }
}

async function logout() {
  const shouldLogout = await confirmAction({
    title: 'Cerrar sesion',
    message: 'Deseas cerrar sesion?',
    confirmLabel: 'Cerrar sesion',
    cancelLabel: 'Cancelar',
    variant: 'warning',
  });

  if (!shouldLogout) {
    return;
  }

  clearDashboardSession();

  if (appointmentsRealtimeChannel && supabaseDbClient) {
    try {
      await supabaseDbClient.removeChannel(appointmentsRealtimeChannel);
    } catch (error) {
      console.warn('No se pudo cerrar el canal realtime de citas:', error);
    } finally {
      appointmentsRealtimeChannel = null;
    }
  }

  if (supabaseAuthClient) {
    try {
      await supabaseAuthClient.auth.signOut();
    } catch (error) {
      console.warn('No se pudo cerrar sesion en Supabase Auth de forma local:', error);
    }
  }

  window.location.href = 'index.html';
}

function iconHome() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
}

function iconUsers() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="9" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14.5 19a4.5 4.5 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
}

function iconFolder() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
}

function iconSliders() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="11" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
}

function iconCalendar() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 2v4M16 2v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
}

function iconAccount() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 19a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
}
