'use client';

/**
 * Botón "Agregar al carrito" con confirmación propia: check + "Agregado",
 * miniatura que vuela hasta el ícono del carrito y toast. Deliberadamente
 * distinto del latido del corazón de favoritos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CartItem, readCart, writeCart } from '../lib/cart';
import { showToast } from './ToastHost';
import { ROUTES } from '../lib/routes';

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
  const [agregado, setAgregado] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return; // agotado: ni se agrega ni se anima

      addItemsToCart([item]);

      // La miniatura sale de la imagen de la card si la hay; si no, del botón.
      const card = ref.current?.closest('article, li, div');
      const origen = card?.querySelector<HTMLElement>('img') ?? ref.current;
      flyToCart(origen, item.image);

      setAgregado(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAgregado(false), 1600);

      showToast({
        kind: 'carrito',
        message: 'Producto agregado al carrito',
        productName: item.name,
        image: item.image,
        action: { label: 'Ver carrito', href: ROUTES.carrito },
      });
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
          : agregado
            ? 'bg-feedback-success-dark text-white'
            : 'bg-novey-blue text-white hover:bg-novey-blue-dark'
      } ${full ? 'w-full' : ''} ${className}`}
    >
      {agregado ? (
        <>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12 5 5L20 7" />
          </svg>
          Agregado
        </>
      ) : (
        children
      )}
    </button>
  );
}
