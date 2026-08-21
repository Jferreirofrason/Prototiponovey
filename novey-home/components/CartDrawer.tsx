'use client';

// Mini carrito lateral: se abre desde el ícono del navbar (o al agregar algo
// desde el buscador) y deja ver y ajustar el carrito sin salir de la página.
// La página completa sigue existiendo en /carrito.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUTES } from '../lib/routes';
import ProductThumb from './ProductThumb';
import { CartItem, countUnits, readCart, subtotal, writeCart } from '../lib/cart';

const money = (n: number) => `$${n.toFixed(2)}`;

/** Cualquier parte de la app puede pedir que se abra el mini carrito. */
export const CART_OPEN_EVENT = 'novey-cart-open';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const antesRef = useRef<HTMLElement | null>(null);

  // `montado` mantiene el panel en el DOM mientras corre la animación de
  // salida. Dejarlo montado siempre metería sus botones en el orden de
  // tabulación, y ocultarlo con visibility impide animarlo.
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    if (open) {
      setMontado(true);
      return;
    }
    const t = window.setTimeout(() => setMontado(false), 250);
    return () => window.clearTimeout(t);
  }, [open]);

  // Se sincroniza con el storage al abrir y ante cualquier cambio del carrito.
  useEffect(() => {
    const leer = () => setItems(readCart() ?? []);
    leer();
    window.addEventListener('novey-cart-change', leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener('novey-cart-change', leer);
      window.removeEventListener('storage', leer);
    };
  }, [open]);

  // Escape para cerrar, foco adentro mientras está abierto y scroll bloqueado.
  // Depende de `montado` porque el panel recién existe en el DOM después de
  // que se monta: antes no habría a qué mover el foco.
  useEffect(() => {
    if (!open || !montado) return;
    antesRef.current = document.activeElement as HTMLElement;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      antesRef.current?.focus();
    };
  }, [open, montado, onClose]);

  const persistir = useCallback((next: CartItem[]) => {
    setItems(next);
    writeCart(next);
  }, []);

  const cambiarQty = (id: string, delta: number) =>
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it,
      );
      writeCart(next);
      return next;
    });

  const quitar = (id: string) => persistir(items.filter((it) => it.id !== id));

  const unidades = countUnits(items);

  if (!montado) return null;

  return (
    <>
      {/* Fondo */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/40 ${
          open ? 'overlay-in' : 'pointer-events-none overlay-out'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-carrito-titulo"
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl ${
          open ? 'drawer-in' : 'drawer-out'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border-light px-5 py-4">
          <h2 id="mini-carrito-titulo" className="flex-1 text-base font-semibold">
            Tu carrito{' '}
            <span className="font-normal text-gray-500">
              ({unidades} {unidades === 1 ? 'artículo' : 'artículos'})
            </span>
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar el carrito"
            className="grid h-9 w-9 place-items-center rounded-novey text-2xl leading-none text-text-secondary transition-colors hover:bg-[#F3F4F6] hover:text-novey-blue"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-base font-semibold text-gray-900">Tu carrito está vacío</p>
            <p className="text-sm text-gray-500">Agrega productos y vuelve para completar tu compra.</p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-novey bg-novey-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-light overflow-y-auto">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 p-4">
                  <ProductThumb src={it.image} alt={it.name} className="h-16 w-16" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{it.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{money(it.price)} c/u</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-novey border border-border-medium">
                        <button
                          type="button"
                          onClick={() => cambiarQty(it.id, -1)}
                          disabled={it.qty <= 1}
                          aria-label={`Quitar una unidad de ${it.name}`}
                          className="grid h-8 w-8 place-items-center leading-none text-text-secondary transition-colors hover:text-novey-blue disabled:cursor-not-allowed disabled:text-text-disabled"
                        >
                          −
                        </button>
                        <span aria-live="polite" className="min-w-[2rem] text-center text-sm font-semibold">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarQty(it.id, 1)}
                          aria-label={`Agregar una unidad de ${it.name}`}
                          className="grid h-8 w-8 place-items-center leading-none text-text-secondary transition-colors hover:text-novey-blue"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitar(it.id)}
                        className="text-xs font-medium text-feedback-error-dark hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold">{money(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>

            <div className="border-t border-border-light p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-secondary">Subtotal</span>
                <span className="text-lg font-bold">{money(subtotal(items))}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                El envío y los impuestos se calculan en el pago.
              </p>
              <a
                href={ROUTES.carritoCheckout}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-novey bg-novey-blue text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
              >
                Continuar al pago
              </a>
              <a
                href={ROUTES.carrito}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-novey border border-novey-blue bg-white text-sm font-semibold text-novey-blue transition-colors hover:bg-novey-blue-bg"
              >
                Ver carrito completo
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
