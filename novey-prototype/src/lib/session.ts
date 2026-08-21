/* ARCHIVO GENERADO — no editar.
   Fuente: shared/session.ts  ·  Se regenera con `node shared/sync.mjs` (corre solo en dev y build). */

/* ============================================================================
 * Sesión del prototipo — FUENTE ÚNICA (ver shared/sync.mjs).
 *
 * La usan la home (que la crea al iniciar sesión) y el checkout (que la lee
 * para decidir en qué paso arrancar). Son dos apps con deploys separados, así
 * que el archivo se copia dentro de cada una antes de dev y de build.
 *
 * No es un sistema de autenticación: es la persistencia mínima del perfil,
 * el mismo patrón que el carrito y los favoritos. Si más adelante hay auth
 * real, se reemplaza `readSession` por la sesión del backend y nada más.
 * ========================================================================== */

export interface Session {
  email: string;
  name?: string;
  phone?: string;
}

const KEY = 'novey-session';
export const SESSION_CHANGE_EVENT = 'novey-session-change';

/**
 * El prototipo se muestra siempre con la sesión iniciada, así el checkout
 * abre directo en el paso 2 sin tener que pasar por /login en cada demo.
 * En la primera visita se siembra este perfil; después manda lo que haya
 * guardado el usuario.
 */
export const DEMO_SESSION: Session = {
  email: 'julieta.ferreiro@rubikanetworking.com',
  name: 'Julieta Ferreiro',
};

/** `null` = no hay sesión (sólo tras cerrar sesión explícitamente). */
export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      // Primera visita: arranca logueada.
      window.localStorage.setItem(KEY, JSON.stringify(DEMO_SESSION));
      return DEMO_SESSION;
    }
    const parsed = JSON.parse(raw);
    // Marca de sesión cerrada: permite probar el flujo de invitado.
    if (parsed && parsed.guest) return null;
    if (!parsed || typeof parsed.email !== 'string' || !parsed.email) return null;
    return {
      email: parsed.email,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    };
  } catch {
    return null;
  }
}

/** Guarda o completa el perfil. Merge: no pisa lo que ya había. */
export function saveSession(patch: Partial<Session> & { email?: string }) {
  const actual = readSession();
  const email = patch.email ?? actual?.email;
  if (!email) return;
  const next: Session = { ...actual, ...patch, email };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sin storage: la sesión vive sólo en memoria */
  }
  window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail: next }));
}

/**
 * Cierra la sesión. Guarda una marca en vez de borrar la clave, porque una
 * clave ausente significa "primera visita" y volvería a sembrar el perfil.
 */
export function clearSession() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ guest: true }));
  } catch {
    /* sin storage */
  }
  window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail: null }));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string) {
  return EMAIL_RE.test(email.trim());
}

/**
 * Datos obligatorios del checkout: nombre y correo. El teléfono es opcional
 * (la dirección de entrega tiene el suyo propio).
 */
export function perfilCompleto(s: Session | null): boolean {
  return !!s && !!s.name && s.name.trim().length > 1 && emailValido(s.email);
}
