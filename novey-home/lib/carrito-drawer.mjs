// Reglas del flujo "Quitar" del mini carrito (drawer).
//
// Separadas del componente para poder probarlas sin montar React
// (pruebas/carrito-drawer.test.mjs). El drawer solo orquesta: estados de
// "Quitando…"/"Restaurando…", toast con Deshacer y foco; las mutaciones de
// la lista salen de acá y siempre derivan de la lista actual, nunca de una
// copia vieja.

/** Latencia simulada de las operaciones (la costura para la API real). */
export const LATENCIA_MS = 250;

/** Cuánto queda visible el toast con "Deshacer" (el brief pide 5–8 s). */
export const TOAST_ELIMINADO_MS = 6000;

/** Confirmación breve tras restaurar. */
export const TOAST_RESTAURADO_MS = 2500;

/**
 * Quita un ítem y devuelve lo necesario para poder deshacerlo: el ítem con
 * su cantidad y su posición original. `null` si el ítem ya no está (por
 * ejemplo, dos "Quitar" seguidos sobre lo mismo).
 */
export function quitarItem(items, id) {
  const indice = items.findIndex((it) => it.id === id);
  if (indice === -1) return null;
  return {
    item: items[indice],
    indice,
    restantes: items.filter((it) => it.id !== id),
  };
}

/**
 * Restaura un ítem eliminado.
 *  - Si la lista cambió y la posición original ya no existe, entra al final.
 *  - Si el ítem volvió a aparecer por otro camino (lo agregaron de nuevo
 *    mientras el toast seguía visible), se fusionan las cantidades en lugar
 *    de duplicar la fila.
 */
export function restaurarItem(items, recuerdo) {
  const { item, indice } = recuerdo;
  const existente = items.findIndex((it) => it.id === item.id);
  if (existente !== -1) {
    return items.map((it, i) => (i === existente ? { ...it, qty: it.qty + item.qty } : it));
  }
  const donde = Math.min(indice, items.length);
  return [...items.slice(0, donde), item, ...items.slice(donde)];
}

/**
 * "Volver a agregar" (el camino alternativo cuando restaurar falló): mismo
 * comportamiento que agregar desde el catálogo — al final, fusionando si ya
 * está.
 */
export function volverAAgregar(items, item) {
  return restaurarItem(items, { item, indice: items.length });
}
