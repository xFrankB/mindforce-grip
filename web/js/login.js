const SUPABASE_URL = window.MIND_FORCE_SUPABASE?.url || '';
const SUPABASE_ANON_KEY = window.MIND_FORCE_SUPABASE?.anonKey || '';
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const DASHBOARD_SESSION_STORAGE_KEY = 'mindforce_dashboard_session';

const supabaseClient = HAS_SUPABASE_CONFIG && typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
}) : null;

const loginForm = document.getElementById('loginForm');
const welcomeMessage = document.getElementById('welcomeMessage');
const debugInfo = document.getElementById('debugInfo');
const passwordInput = document.getElementById('contrasena');
const passwordToggle = document.getElementById('togglePassword');
const passwordField = passwordInput?.closest('.password-field');
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = document.getElementById('themeToggleIcon');

loginForm.addEventListener('submit', handleLogin);
setupPasswordField();
setupThemeToggle();
clearDashboardSession();

function getLoginNoticeHost() {
  let host = document.getElementById('loginNoticeHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'loginNoticeHost';
    host.className = 'login-notice-host';
    document.body.appendChild(host);
  }

  return host;
}

function showLoginNotification(message, type = 'error', duration = 3600) {
  const host = getLoginNoticeHost();
  const notice = document.createElement('article');
  notice.className = `login-notice login-notice-${type}`;

  const text = document.createElement('p');
  text.className = 'login-notice-text';
  text.textContent = String(message || '').trim();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'login-notice-close';
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

async function handleLogin(e) {
  e.preventDefault();

  const loginInput = String(document.getElementById('no_admin').value || '').trim();
  const contrasena = String(document.getElementById('contrasena').value || '').trim();
  const submitButton = document.querySelector('.btn-login');

  if (!loginInput || !contrasena) {
    showLoginNotification('Error: Ingresa usuario o correo y contraseña.', 'error');
    return;
  }

  if (!supabaseClient) {
    showLoginNotification('La conexión de Supabase debe configurarse antes de iniciar sesión.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Verificando...';

  try {
    const therapistAttempt = await tryTherapistLogin(loginInput, contrasena);
    if (therapistAttempt.ok) {
      completeLogin(therapistAttempt.session, therapistAttempt.welcomeName);
      return;
    }

    const adminAttempt = await tryAdminLogin(loginInput, contrasena);
    if (adminAttempt.ok) {
      completeLogin(adminAttempt.session, adminAttempt.welcomeName);
      return;
    }

    const therapistMessage = String(therapistAttempt.message || '').trim();
    const authMessage = therapistMessage && therapistMessage !== 'Usuario o contraseña incorrectos.'
      ? therapistMessage
      : String(adminAttempt.message || 'Usuario o contraseña incorrectos.').trim();

    throw new Error(authMessage);
  } catch (error) {
    console.error('Error de inicio de sesión:', error.message);
    showLoginNotification(`Error: ${error.message}`, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
}

function normalizeLoginIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function clearDashboardSession() {
  try {
    window.sessionStorage.removeItem(DASHBOARD_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar la sesion local del dashboard:', error);
  }
}

function persistDashboardSession(sessionData) {
  try {
    window.sessionStorage.setItem(
      DASHBOARD_SESSION_STORAGE_KEY,
      JSON.stringify({
        role: sessionData.role,
        userId: sessionData.userId,
        authUserId: sessionData.authUserId || '',
        name: sessionData.name,
        email: sessionData.email,
        username: sessionData.username || '',
        loginAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    throw new Error('No se pudo guardar la sesion local del navegador.');
  }
}

function completeLogin(sessionData, rawName) {
  persistDashboardSession(sessionData);
  loginForm.style.display = 'none';
  debugInfo.style.display = 'none';

  const displayName = String(rawName || sessionData.name || 'Usuario').trim();
  const firstName = displayName.split(' ')[0] || 'Usuario';
  welcomeMessage.style.display = 'block';
  welcomeMessage.innerHTML = `Bienvenido de nuevo, <strong>${firstName}</strong>.<br><small>Redirigiendo al panel...</small>`;

  window.setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1400);
}

function formatTherapistAuthError(error) {
  const rawMessage = String(error?.message || '').trim();
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Usuario o contraseña incorrectos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Tu correo no ha sido confirmado en Supabase Auth.';
  }

  if (!rawMessage) {
    return 'No se pudo iniciar sesión del terapeuta.';
  }

  return `No se pudo iniciar sesión del terapeuta: ${rawMessage}`;
}

async function fetchTherapistByEmail(email) {
  const { data, error } = await supabaseClient
    .from('terapeutas')
    .select('id_terapeuta, nombre_completo, email, username, estatus')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo consultar terapeuta por correo:', error.message || error);
    return null;
  }

  return data || null;
}

async function fetchTherapistByAuthId(authUserId) {
  const { data, error } = await supabaseClient
    .from('terapeutas')
    .select('id_terapeuta, nombre_completo, email, username, estatus')
    .eq('id_terapeuta', authUserId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo consultar terapeuta por id de Auth:', error.message || error);
    return null;
  }

  return data || null;
}

async function fetchTherapistByUsername(username) {
  const { data, error } = await supabaseClient
    .from('terapeutas')
    .select('id_terapeuta, nombre_completo, email, username, estatus')
    .ilike('username', username)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo consultar terapeuta por username:', error.message || error);
    return null;
  }

  return data || null;
}

async function tryTherapistLogin(identifier, password) {
  const normalizedIdentifier = normalizeLoginIdentifier(identifier);
  if (!normalizedIdentifier || !password) {
    return {
      ok: false,
      message: 'Usuario o contraseña incorrectos.',
    };
  }

  let therapistRecord = null;
  let therapistEmail = '';

  if (isValidEmail(normalizedIdentifier)) {
    therapistEmail = normalizedIdentifier;
    therapistRecord = await fetchTherapistByEmail(therapistEmail);
  } else {
    therapistRecord = await fetchTherapistByUsername(normalizedIdentifier);
    therapistEmail = normalizeLoginIdentifier(therapistRecord?.email || '');
  }

  if (!therapistEmail) {
    return {
      ok: false,
      message: 'Usuario o contraseña incorrectos.',
    };
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: therapistEmail,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: formatTherapistAuthError(error),
    };
  }

  if (!data?.user?.id) {
    return {
      ok: false,
      message: 'No se pudo validar la cuenta de terapeuta en Supabase Auth.',
    };
  }

  therapistRecord =
    therapistRecord ||
    (await fetchTherapistByAuthId(data.user.id)) ||
    (await fetchTherapistByEmail(therapistEmail));

  if (!therapistRecord) {
    await supabaseClient.auth.signOut();
    return {
      ok: false,
      message: 'La cuenta existe en Auth pero no tiene perfil de terapeuta vinculado.',
    };
  }

  const therapistStatus = String(therapistRecord.estatus || '').toLowerCase();
  if (therapistStatus.includes('inactivo') || therapistStatus.includes('suspend')) {
    await supabaseClient.auth.signOut();
    return {
      ok: false,
      message: 'La cuenta del terapeuta esta inactiva. Contacta a administracion.',
    };
  }

  await supabaseClient.auth.signOut();

  const displayName =
    String(therapistRecord.nombre_completo || '').trim() ||
    String(data.user.user_metadata?.full_name || '').trim() ||
    therapistEmail.split('@')[0];

  const username =
    String(therapistRecord.username || '').trim().toLowerCase() ||
    (isValidEmail(normalizedIdentifier) ? therapistEmail.split('@')[0] : normalizedIdentifier);

  return {
    ok: true,
    session: {
      role: 'Terapeuta',
      userId: String(therapistRecord.id_terapeuta || data.user.id),
      authUserId: String(therapistRecord.id_terapeuta || data.user.id),
      name: displayName,
      email: therapistEmail,
      username,
    },
    welcomeName: displayName,
  };
}

async function tryAdminLogin(identifier, password) {
  const adminIdentifier = String(identifier || '').trim();

  const { data, error } = await supabaseClient
    .from('administradores')
    .select('*')
    .eq('no_admin', adminIdentifier)
    .eq('contrasena', password)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: `Error al verificar cuenta de administrador: ${error.message}`,
    };
  }

  if (!data) {
    return {
      ok: false,
      message: 'Usuario o contraseña incorrectos.',
    };
  }

  const normalizedAdminEmail = normalizeLoginIdentifier(data.correo || '');
  const adminDisplayName = String(data.nombre_completo || data.no_admin || 'Administrador').trim();

  return {
    ok: true,
    session: {
      role: 'Administrador',
      userId: String(data.id_admin || data.no_admin || 'admin'),
      authUserId: '',
      name: adminDisplayName,
      email: normalizedAdminEmail,
      username: String(data.no_admin || '').trim(),
    },
    welcomeName: adminDisplayName,
  };
}

function setupPasswordField() {
  if (!passwordInput || !passwordToggle || !passwordField) {
    return;
  }

  const syncPasswordState = () => {
    passwordField.classList.toggle('has-value', passwordInput.value.length > 0);
  };

  passwordInput.addEventListener('focus', () => {
    passwordField.classList.add('is-active');
  });

  passwordInput.addEventListener('blur', () => {
    passwordField.classList.remove('is-active');
    syncPasswordState();
  });

  passwordInput.addEventListener('input', syncPasswordState);

  passwordToggle.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(isHidden));
    passwordToggle.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
    passwordToggle.classList.toggle('is-visible', isHidden);
    const icon = passwordToggle.querySelector('.password-toggle-icon');
    if (icon) {
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    }
    passwordField.classList.add('is-active');
    passwordInput.focus();
    syncPasswordState();
  });

  syncPasswordState();
}

function setupThemeToggle() {
  if (!themeToggle || !themeToggleIcon) {
    return;
  }

  applyTheme('dark');

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const isLight = theme === 'light';
  themeToggleIcon.classList.toggle('fa-sun', isLight);
  themeToggleIcon.classList.toggle('fa-moon', !isLight);
  themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
}

