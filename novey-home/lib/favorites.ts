/* ARCHIVO GENERADO — no editar.
   Fuente: shared/favorites.ts  ·  Se regenera con `node shared/sync.mjs` (corre solo en dev y build). */

/**
 * Favoritos del prototipo.
 *
 * Mismo patrón que `lib/cart.ts`: se guardan en localStorage y cualquier
 * cambio emite un evento para que el corazón de cada card, el contador del
 * header y la página /favoritos queden sincronizados sin recargar.
 *
 * Se guardan sólo ids: el catálogo real vive en `data/products.ts`, así que
 * nombre, precio y disponibilidad salen siempre de ahí y nunca se duplican.
 */

const KEY = 'novey-favorites';
export const FAV_CHANGE_EVENT = 'novey-fav-change';

/** Lista única: el proyecto no tiene listas múltiples. */
export const LISTA_UNICA = 'Favoritos';

export function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sin duplicados: un producto está o no está.
    return Array.from(new Set(parsed.filter((id): id is string => typeof id === 'string')));
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  const unicos = Array.from(new Set(ids));
  try {
    window.localStorage.setItem(KEY, JSON.stringify(unicos));
  } catch {
    /* sin storage: el estado vive sólo en memoria */
  }
  window.dispatchEvent(new CustomEvent(FAV_CHANGE_EVENT, { detail: unicos }));
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

/**
 * Agrega o quita, y devuelve el estado resultante. Lee del storage en cada
 * llamada, así varios clics seguidos no se pisan entre sí.
 */
export function toggleFavorite(id: string): boolean {
  const actuales = readFavorites();
  const estaba = actuales.includes(id);
  writeFavorites(estaba ? actuales.filter((x) => x !== id) : [...actuales, id]);
  return !estaba;
}

export function removeFavorites(ids: string[]) {
  const fuera = new Set(ids);
  writeFavorites(readFavorites().filter((id) => !fuera.has(id)));
}

export function addFavorite(id: string) {
  addFavorites([id]);
}

/** Repone varios sobre lo que haya ahora (usado por "Deshacer"). */
export function addFavorites(ids: string[]) {
  writeFavorites([...readFavorites(), ...ids]);
}
