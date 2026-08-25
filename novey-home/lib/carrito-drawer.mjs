// Reglas del flujo "Quitar" del mini carrito (drawer).
//
// Separadas del componente para poder probarlas sin montar React
// (pruebas/carrito-drawer.test.mjs). El drawer solo orquesta: estados de
// "Quitando…"/"Restaurando…", toast con Deshacer y foco; las mutaciones de
// la lista salen de acá y siempre derivan de la lista actual, nunca de una
// copia vieja.

/** Latencia simulada de las operaciones (la costura para la API real). */
export const LATENCIA_MS = 250;

/** Cuánto queda visible el mensaje con "Deshacer" (el brief pide 8–10 s). */
export const MENSAJE_ELIMINADO_MS = 9000;

/** Confirmaciones informativas (cantidad nueva, producto restaurado). */
export const MENSAJE_INFO_MS = 5000;

/** Confirmaciones importantes (cotización agregada, producto agregado). */
export const MENSAJE_EXITO_MS = 8000;

/**
 * Stock de demostración: el prototipo no tiene inventario real, así que todos
 * los productos comparten este tope para poder mostrar el estado "solo hay N
 * unidades disponibles". La costura para el stock real es `ajustarCantidad`.
 */
export const MAX_UNIDADES = 10;

/**
 * Regla de los botones +/− de una fila:
 *  - sumar con el stock lleno → `sin-stock` (no es un error: no hay reintento)
 *  - restar con una sola unidad → `ultima-unidad` (nunca se baja a cero solo;
 *    para sacar el producto está "Quitar")
 *  - si no, `ok` con la lista nueva y la cantidad confirmada
 *
 * @template {{ id: string, qty: number }} T
 * @param {T[]} items
 * @param {string} id
 * @param {number} delta
 * @returns {{ tipo: 'sin-stock', max: number } | { tipo: 'ultima-unidad' } | { tipo: 'ok', qty: number, items: T[] } | null}
 */
export function ajustarCantidad(items, id, delta) {
  const item = items.find((it) => it.id === id);
  if (!item) return null;
  if (delta > 0 && item.qty >= MAX_UNIDADES) return { tipo: 'sin-stock', max: MAX_UNIDADES };
  if (delta < 0 && item.qty <= 1) return { tipo: 'ultima-unidad' };
  const qty = item.qty + delta;
  return {
    tipo: 'ok',
    qty,
    items: items.map((it) => (it.id === id ? { ...it, qty } : it)),
  };
}

/** "Ahora tienes N unidades de este producto." (singular incluido). */
export function textoCantidad(qty) {
  return qty === 1
    ? 'Ahora tienes 1 unidad de este producto.'
    : `Ahora tienes ${qty} unidades de este producto.`;
}

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
