const SUPABASE_URL =
  window.MIND_FORCE_SUPABASE?.url || 'https://jdgqsodglxuazxihhqgq.supabase.co';
const SUPABASE_ANON_KEY =
  window.MIND_FORCE_SUPABASE?.anonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ3Fzb2RnbHh1YXp4aWhocWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODU4ODUsImV4cCI6MjA5MTY2MTg4NX0.3Z2FbXxFewH8zCkeFbA29jzf0tdbbkVUxiFQmiRre_I';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const registerForm = document.getElementById('registerForm');
const welcomeMessage = document.getElementById('welcomeMessage');
const errorMessage = document.getElementById('errorMessage');
const passwordInput = document.getElementById('contrasena');
const passwordToggle = document.getElementById('togglePassword');
const passwordField = passwordInput?.closest('.password-field');
const confirmPasswordInput = document.getElementById('confirmar_contrasena');
const confirmPasswordToggle = document.getElementById('toggleConfirmPassword');
const confirmPasswordField = confirmPasswordInput?.closest('.password-field');
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const pendingRequestsStateKey = 'pending_therapist_requests';

registerForm.addEventListener('submit', handleRegister);
setupPasswordField();
setupThemeToggle();

function getRegisterNoticeHost() {
  let host = document.getElementById('registerNoticeHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'registerNoticeHost';
    host.className = 'register-notice-host';
    document.body.appendChild(host);
  }

  return host;
}

function showRegisterNotification(message, type = 'error', duration = 3600) {
  const host = getRegisterNoticeHost();
  const notice = document.createElement('article');
  notice.className = `register-notice register-notice-${type}`;

  const text = document.createElement('p');
  text.className = 'register-notice-text';
  text.textContent = String(message || '').trim();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'register-notice-close';
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

async function handleRegister(e) {
  e.preventDefault();

  const nombres = document.getElementById('nombres').value.trim();
  const apellidoPaterno = document.getElementById('apellido_paterno').value.trim();
  const apellidoMaterno = document.getElementById('apellido_materno').value.trim();

  const payload = {
    nombres,
    apellido_paterno: apellidoPaterno,
    apellido_materno: apellidoMaterno,
    nombre_completo: buildFullName(nombres, apellidoPaterno, apellidoMaterno),
    cedula_profesional: document.getElementById('cedula_profesional').value.trim(),
    curp: document.getElementById('curp').value.trim().toUpperCase().replace(/\s+/g, ''),
    fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
    telefono: document.getElementById('telefono').value.trim(),
    correo: document.getElementById('correo').value.trim().toLowerCase(),
    especializacion: document.getElementById('especializacion').value.trim(),
    contrasena: document.getElementById('contrasena').value.trim(),
    confirmar_contrasena: document.getElementById('confirmar_contrasena').value.trim(),
    consentimiento: document.getElementById('consentimiento').checked,
  };

  if (!validateForm(payload)) {
    return;
  }

  const submitButton = document.querySelector('.btn-register');
  submitButton.disabled = true;
  submitButton.textContent = 'Registrando...';
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }

  try {
    const pendingRequests = await getPendingRequests();
    const duplicateRequest = pendingRequests.find(
      (request) =>
        request.correo?.toLowerCase() === payload.correo ||
        request.curp === payload.curp ||
        request.cedula_profesional === payload.cedula_profesional
    );

    if (duplicateRequest) {
      throw new Error('Ya existe una solicitud pendiente con ese correo, CURP o cédula profesional.');
    }

    const requestRecord = {
      requestId: `req-${Date.now()}`,
      role: 'Terapeuta',
      nombres: payload.nombres,
      apellido_paterno: payload.apellido_paterno,
      apellido_materno: payload.apellido_materno,
      nombre_completo: payload.nombre_completo,
      cedula_profesional: payload.cedula_profesional,
      curp: payload.curp,
      fecha_nacimiento: payload.fecha_nacimiento,
      telefono: payload.telefono,
      correo: payload.correo,
      especializacion: payload.especializacion,
      contrasena: payload.contrasena,
      submittedAt: new Date().toISOString(),
      status: 'Pendiente',
    };

    pendingRequests.push(requestRecord);
    await savePendingRequests(pendingRequests);

    registerForm.style.display = 'none';
    welcomeMessage.style.display = 'block';
    welcomeMessage.innerHTML = `Solicitud enviada para <strong>${payload.nombre_completo.split(' ')[0]}</strong>.<br><small>Administracion revisara tu alta y decidira si acepta o rechaza la creacion de cuenta.</small>`;

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } catch (error) {
    console.error('Error en el registro:', error.message);
    showError(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Solicitar Alta de Terapeuta';
  }
}

function validateForm(payload) {
  if (
    !payload.nombres ||
    !payload.apellido_paterno ||
    !payload.apellido_materno ||
    !payload.cedula_profesional ||
    !payload.curp ||
    !payload.fecha_nacimiento ||
    !payload.telefono ||
    !payload.correo ||
    !payload.especializacion ||
    !payload.contrasena ||
    !payload.confirmar_contrasena
  ) {
    showError('Por favor completa todos los campos');
    return false;
  }

  if (!payload.consentimiento) {
    showError('Debes aceptar el aviso de privacidad para enviar la solicitud');
    return false;
  }

  if (payload.nombres.length < 2 || payload.apellido_paterno.length < 2 || payload.apellido_materno.length < 2) {
    showError('Nombres y apellidos deben tener al menos 2 caracteres');
    return false;
  }

  if (!/^\d{7,8}$/.test(payload.cedula_profesional)) {
    showError('La cédula profesional debe tener 7 u 8 dígitos');
    return false;
  }

  if (payload.curp.length !== 18) {
    showError('La CURP debe contener exactamente 18 caracteres');
    return false;
  }

  if (!/^\d{10}$/.test(payload.telefono)) {
    showError('El teléfono debe contener 10 dígitos');
    return false;
  }

  if (calculateAge(payload.fecha_nacimiento) < 22) {
    showError('La edad mínima para registro de terapeuta es 22 años');
    return false;
  }

  if (payload.contrasena.length < 10) {
    showError('La contraseña debe tener mínimo 10 caracteres');
    return false;
  }

  if (!validateStrongPassword(payload.contrasena)) {
    showError('La contraseña debe incluir mayúscula, minúscula, número y símbolo');
    return false;
  }

  if (payload.contrasena !== payload.confirmar_contrasena) {
    showError('La confirmación de contraseña no coincide');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.correo)) {
    showError('Por favor ingresa un correo válido');
    return false;
  }

  return true;
}

function validateStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(password);
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return -1;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function buildFullName(nombres, apellidoPaterno, apellidoMaterno) {
  return [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function showError(message) {
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
  showRegisterNotification(`Error: ${message}`, 'error');
}

function setupPasswordField() {
  setupSinglePasswordField(passwordInput, passwordToggle, passwordField, {
    showLabel: 'Mostrar contraseña',
    hideLabel: 'Ocultar contraseña',
  });

  setupSinglePasswordField(confirmPasswordInput, confirmPasswordToggle, confirmPasswordField, {
    showLabel: 'Mostrar confirmacion de contraseña',
    hideLabel: 'Ocultar confirmacion de contraseña',
  });
}

function setupSinglePasswordField(input, toggle, field, labels) {
  if (!input || !toggle || !field) {
    return;
  }

  const syncPasswordState = () => {
    field.classList.toggle('has-value', input.value.length > 0);
  };

  input.addEventListener('focus', () => {
    field.classList.add('is-active');
  });

  input.addEventListener('blur', () => {
    field.classList.remove('is-active');
    syncPasswordState();
  });

  input.addEventListener('input', syncPasswordState);

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(isHidden));
    toggle.setAttribute('aria-label', isHidden ? labels.hideLabel : labels.showLabel);
    toggle.classList.toggle('is-visible', isHidden);
    const icon = toggle.querySelector('.password-toggle-icon');
    if (icon) {
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    }
    field.classList.add('is-active');
    input.focus();
    syncPasswordState();
  });

  syncPasswordState();
}

async function getPendingRequests() {
  try {
    const stored = await webStateGet(pendingRequestsStateKey, []);
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn('No se pudo leer almacenamiento de solicitudes:', error);
    return [];
  }
}

async function savePendingRequests(requests) {
  await webStateSet(pendingRequestsStateKey, requests);
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
