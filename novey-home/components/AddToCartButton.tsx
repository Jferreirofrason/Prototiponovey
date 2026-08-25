'use client';

/**
 * Botón "Agregar al carrito". No escribe el carrito por su cuenta: le pasa el
 * producto al mini carrito (CART_ADD_EVENT) y lo abre (CART_OPEN_EVENT). Todo
 * el feedback — "Agregando al carrito…", "Agregaste X al carrito." — vive
 * dentro del drawer, cerca del producto, no en toasts sueltos.
 */

import { useCallback, useRef } from 'react';
import { CartItem, readCart, writeCart } from '../lib/cart';
import { CART_ADD_EVENT, CART_OPEN_EVENT } from './CartDrawer';

/** El ícono del carrito del header se marca con este atributo. */
export const CART_ICON_ATTR = 'data-cart-icon';

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Anima una copia de la imagen desde el origen hasta el ícono del carrito.
 * Si falta el ícono o el usuario pidió menos movimiento, no hace nada.
 */
export function flyToCart(desde: HTMLElement | null, imagen?: string) {
  if (!desde || !imagen || reducedMotion()) return;
  const destino = document.querySelector<HTMLElement>(`[${CART_ICON_ATTR}]`);
  if (!destino) return;

  const o = desde.getBoundingClientRect();
  const d = destino.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = imagen;
  img.alt = '';
  img.className = 'fly-to-cart';
  img.style.left = `${o.left}px`;
  img.style.top = `${o.top}px`;
  img.style.width = `${o.width}px`;
  img.style.height = `${o.height}px`;
  img.style.setProperty('--fly-dx', `${d.left + d.width / 2 - (o.left + o.width / 2)}px`);
  img.style.setProperty('--fly-dy', `${d.top + d.height / 2 - (o.top + o.height / 2)}px`);
  document.body.appendChild(img);
  window.setTimeout(() => img.remove(), 700);
}

/** Suma al carrito sin duplicar: si ya estaba, incrementa la cantidad. */
export function addItemsToCart(nuevos: CartItem[]) {
  const actual = readCart() ?? [];
  const mapa = new Map(actual.map((it) => [it.id, { ...it }]));
  nuevos.forEach((n) => {
    const existente = mapa.get(n.id);
    if (existente) existente.qty += n.qty;
    else mapa.set(n.id, { ...n });
  });
  writeCart(Array.from(mapa.values()));
}

export default function AddToCartButton({
  item,
  disabled = false,
  full = false,
  className = '',
  children = 'Agregar al carrito',
}: {
  item: CartItem;
  disabled?: boolean;
  full?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return; // agotado: no hay nada que agregar

      // El drawer hace el alta y muestra "Agregando al carrito…" adentro.
      window.dispatchEvent(new CustomEvent(CART_ADD_EVENT, { detail: item }));
      window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
    },
    [item, disabled],
  );

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-novey text-sm font-semibold transition-colors duration-200 ${
        disabled
          ? 'cursor-not-allowed bg-border-light text-text-disabled'
          : 'bg-novey-blue text-white hover:bg-novey-blue-dark'
      } ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
