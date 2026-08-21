/**
 * Carrito compartido entre las apps del dominio unificado.
 *
 * Vive en `localStorage['novey-cart']` (mismo origen bajo prototiponovey), lo
 * escriben el buscador de la home y el PDP, y lo lee el checkout al montar.
 * Este módulo centraliza el formato para no reimplementarlo en cada pantalla.
 */

export interface CartItem {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  oldPrice?: number;
  qty: number;
  image?: string;
}

const KEY = 'novey-cart';

/**
 * Pedido de muestra: el mismo que usa el checkout cuando no hay carrito real,
 * para que el prototipo no muestre datos distintos en cada pantalla.
 * Sólo se siembra si NUNCA hubo carrito; si el usuario lo vació, queda vacío.
 */
export const DEMO_CART: CartItem[] = [
  {
    id: 'destacado-1',
    name: 'Sierra circular 7 1/4" 1800W con guía láser',
    brand: 'DEWALT',
    sku: 'NV-destacado-1',
    price: 189.99,
    oldPrice: 229.99,
    qty: 1,
    image: '/images/p-sierra.jpg',
  },
  {
    id: 'destacado-3',
    name: 'Set de brocas para concreto x12 piezas',
    brand: 'TRUPER',
    sku: 'NV-destacado-3',
    price: 24.99,
    qty: 1,
    image: '/images/p-brocas.jpg',
  },
  {
    id: 'entrega-2',
    name: 'Pintura látex interior blanca lavable',
    brand: 'SHERWIN-WILLIAMS',
    sku: 'NV-entrega-2',
    price: 32.99,
    qty: 1,
    image: '/images/p-pintura.jpg',
  },
];

/** Lee el carrito. `null` = nunca existió (hay que sembrar el demo). */
export function readCart(): CartItem[] | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items)) return null;
    return parsed.items.filter((it: CartItem) => it && it.name).map(normalize);
  } catch {
    return null;
  }
}

export function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ items, ts: Date.now() }));
    // El badge del navbar escucha este evento para actualizarse sin recargar.
    window.dispatchEvent(new CustomEvent('novey-cart-change'));
  } catch {
    /* sin storage: el carrito queda sólo en memoria */
  }
}

function normalize(it: CartItem): CartItem {
  const qty = Number(it.qty);
  return { ...it, price: Number(it.price) || 0, qty: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1 };
}

/** Unidades totales, para el contador del navbar. */
export function countUnits(items: CartItem[]): number {
  return items.reduce((n, it) => n + it.qty, 0);
}

export function subtotal(items: CartItem[]): number {
  return +items.reduce((n, it) => n + it.price * it.qty, 0).toFixed(2);
}

/** Ahorro contra el precio anterior, sólo con los datos que trae cada ítem. */
export function savings(items: CartItem[]): number {
  return +items
    .reduce((n, it) => n + Math.max(0, (it.oldPrice ?? it.price) - it.price) * it.qty, 0)
    .toFixed(2);
}
