export async function startApp() {
  const { initSplash } = await import('./splash.js');
  initSplash(document.getElementById('splash'));
  await import('./app.js');
  import('./sw-register.js');
}

async function getUsers() {
  const res = await fetch('libs/tester-access.json');
  return res.ok ? res.json() : [];
}

function storeCredentials(id, password) {
  if ('credentials' in navigator && window.PasswordCredential) {
    try {
      const cred = new window.PasswordCredential({ id, password });
      navigator.credentials.store(cred).catch(() => {});
    } catch {}
  }
}

async function attemptAutoLogin(users) {
  if ('credentials' in navigator && window.PasswordCredential) {
    try {
      const cred = await navigator.credentials.get({ password: true });
      if (cred) {
        const ok = users.some(u => u.username === cred.id && u.password === cred.password);
        if (ok) {
          storeCredentials(cred.id, cred.password);
          return { ok: true, user: cred.id };
        }
      }
    } catch {}
  }
  return { ok: false };
}

function showError(msg) {
  const el = document.getElementById('loginError');
  if (el) el.textContent = msg;
}

async function handleSubmit(e, users) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const valid = users.some(u => u.username === username && u.password === password);
  if (valid) {
    storeCredentials(username, password);
    await loginSuccess();
  } else {
    showError('Credenciales inválidas');
  }
}

async function loginSuccess() {
  const overlay = document.getElementById('loginOverlay');
  overlay.classList.add('hidden');
  await startApp();
}

function setupBiometrics(users) {
  const btn = document.getElementById('bioBtn');
  if (!btn || !window.PublicKeyCredential) return;
  btn.style.display = 'block';
  btn.addEventListener('click', async () => {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(16),
          timeout: 60000,
          userVerification: 'preferred'
        }
      });
      await loginSuccess();
    } catch {
      showError('Biometría cancelada');
    }
  });
}

(async () => {
  const users = await getUsers();
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', e => handleSubmit(e, users));
  setupBiometrics(users);
  const { ok } = await attemptAutoLogin(users);
  if (ok) await loginSuccess();
})();
