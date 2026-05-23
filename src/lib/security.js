// Security utilities: PIN hashing, session, confirmation helpers

// SHA-256 hash using Web Crypto API (available in all modern browsers)
export async function hashPIN(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'keuangan-pribadi-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPIN(pin, storedHash) {
  const hash = await hashPIN(pin);
  return hash === storedHash;
}

// PIN storage in localStorage
const PIN_HASH_KEY = 'pin_hash';
const PIN_ENABLED_KEY = 'pin_enabled';
const PIN_TIMEOUT_KEY = 'pin_timeout'; // 'always' | '1' | '5' | '15' | '30' | 'never'
const PIN_LAST_AUTH_KEY = 'pin_last_auth';

export function getPINEnabled() {
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true';
}

export function setPINEnabled(enabled) {
  localStorage.setItem(PIN_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function getPINHash() {
  return localStorage.getItem(PIN_HASH_KEY);
}

export async function savePIN(pin) {
  const hash = await hashPIN(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

export function clearPIN() {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_ENABLED_KEY);
  localStorage.removeItem(PIN_LAST_AUTH_KEY);
}

export function getPINTimeout() {
  return localStorage.getItem(PIN_TIMEOUT_KEY) || '5';
}

export function setPINTimeout(timeout) {
  localStorage.setItem(PIN_TIMEOUT_KEY, timeout);
}

export function recordPINAuth() {
  localStorage.setItem(PIN_LAST_AUTH_KEY, Date.now().toString());
}

export function isPINRequired() {
  if (!getPINEnabled()) return false;
  const hash = getPINHash();
  if (!hash) return false;

  const timeout = getPINTimeout();
  if (timeout === 'always') return true;
  if (timeout === 'never') return false;

  const lastAuth = parseInt(localStorage.getItem(PIN_LAST_AUTH_KEY) || '0');
  const minutes = parseInt(timeout);
  const elapsed = (Date.now() - lastAuth) / 1000 / 60;
  return elapsed > minutes;
}

// Session idle tracker
let idleTimer = null;

export function startIdleTracker(onIdle) {
  const reset = () => {
    clearTimeout(idleTimer);
    const timeout = getPINTimeout();
    if (timeout === 'never' || timeout === 'always' || !getPINEnabled()) return;
    const ms = parseInt(timeout) * 60 * 1000;
    idleTimer = setTimeout(onIdle, ms);
  };

  ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll'].forEach(e => {
    document.addEventListener(e, reset, { passive: true });
  });

  reset();

  return () => {
    clearTimeout(idleTimer);
    ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll'].forEach(e => {
      document.removeEventListener(e, reset);
    });
  };
}
