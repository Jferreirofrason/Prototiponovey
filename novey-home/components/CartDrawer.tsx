'use client';

// Mini carrito lateral: se abre desde el ícono del navbar (o al agregar algo
// desde el buscador) y deja ver y ajustar el carrito sin salir de la página.
// La página completa sigue existiendo en /carrito.
//
// Quitar un producto no pide confirmación: es inmediato y recuperable. La fila
// pasa por "Quitando…" (sus controles se deshabilitan, el resto sigue vivo),
// y al salir aparece un toast DENTRO del drawer con "Deshacer" durante unos
// segundos. Si se quitó el último producto, el estado vacío convive con ese
// toast. Errores de quitar/restaurar quedan en el drawer con su reintento.
// Las mutaciones de lista viven en lib/carrito-drawer.mjs (probadas solas).
//
// Gancho de desarrollo: window.__noveySimularErrorCarrito = 'quitar' |
// 'restaurar' fuerza el camino de error para verificarlo visualmente.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUTES } from '../lib/routes';
import ProductThumb from './ProductThumb';
import { CartItem, countUnits, readCart, subtotal, writeCart } from '../lib/cart';
import {
  LATENCIA_MS,
  TOAST_ELIMINADO_MS,
  TOAST_RESTAURADO_MS,
  quitarItem,
  restaurarItem,
  volverAAgregar,
} from '../lib/carrito-drawer.mjs';

const money = (n: number) => `$${n.toFixed(2)}`;

/** Cualquier parte de la app puede pedir que se abra el mini carrito. */
export const CART_OPEN_EVENT = 'novey-cart-open';

/** Recuerdo de una eliminación, para poder deshacerla. */
interface Recuerdo {
  item: CartItem;
  indice: number;
}

type Toast =
  | { tipo: 'eliminado'; recuerdo: Recuerdo; restaurando: boolean }
  | { tipo: 'restaurado'; nombre: string }
  | { tipo: 'error-quitar'; id: string; nombre: string }
  | { tipo: 'error-restaurar'; recuerdo: Recuerdo };

declare global {
  interface Window {
    __noveySimularErrorCarrito?: 'quitar' | 'restaurar';
  }
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Ids con una eliminación en curso: cada producto maneja su estado solo.
  const [quitando, setQuitando] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const antesRef = useRef<HTMLElement | null>(null);
  const deshacerRef = useRef<HTMLButtonElement>(null);
  const tituloVacioRef = useRef<HTMLParagraphElement>(null);
  // Número de serie del toast: los timers viejos comparan antes de tocar
  // nada, así una respuesta tardía no pisa un estado más nuevo.
  const serieToast = useRef(0);
  const timers = useRef<number[]>([]);

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

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Escape para cerrar, foco adentro mientras está abierto y scroll bloqueado.
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

  const programar = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /** Publica un toast y agenda su cierre; el número de serie evita pisadas. */
  const publicarToast = useCallback((t: Toast, ms?: number) => {
    const serie = ++serieToast.current;
    setToast(t);
    if (ms) {
      timers.current.push(
        window.setTimeout(() => {
          if (serieToast.current === serie) setToast(null);
        }, ms),
      );
    }
    return serie;
  }, []);

  const cambiarQty = (id: string, delta: number) =>
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it,
      );
      writeCart(next);
      return next;
    });

  /** Paso 2 y 3 del flujo: "Quitando…" → lista sin el ítem + toast Deshacer. */
  const quitar = (id: string) => {
    if (quitando.has(id)) return; // sin operaciones duplicadas
    setQuitando((prev) => new Set(prev).add(id));

    programar(() => {
      setQuitando((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      const falla = typeof window !== 'undefined' && window.__noveySimularErrorCarrito === 'quitar';
      setItems((prev) => {
        const r = quitarItem(prev, id);
        if (!r) return prev; // ya no estaba
        if (falla) {
          // La fuente de datos no se toca: el producto sigue en la lista.
          publicarToast({ tipo: 'error-quitar', id, nombre: r.item.name });
          return prev;
        }
        writeCart(r.restantes);
        publicarToast(
          { tipo: 'eliminado', recuerdo: { item: r.item, indice: r.indice }, restaurando: false },
          TOAST_ELIMINADO_MS,
        );
        // Foco: a "Deshacer" (o al título del vacío, que llega por autoFocus
        // del efecto de abajo cuando la lista queda en cero).
        requestAnimationFrame(() => {
          if (r.restantes.length > 0) deshacerRef.current?.focus();
          else tituloVacioRef.current?.focus();
        });
        return r.restantes;
      });
    }, LATENCIA_MS);
  };

  /** Paso 5: "Restaurando…" → producto de vuelta en su posición original. */
  const deshacer = (recuerdo: Recuerdo) => {
    setToast((t) => (t && t.tipo === 'eliminado' ? { ...t, restaurando: true } : t));

    programar(() => {
      const falla =
        typeof window !== 'undefined' && window.__noveySimularErrorCarrito === 'restaurar';
      if (falla) {
        publicarToast({ tipo: 'error-restaurar', recuerdo });
        return;
      }
      setItems((prev) => {
        const next = restaurarItem(prev, recuerdo);
        writeCart(next);
        return next;
      });
      publicarToast({ tipo: 'restaurado', nombre: recuerdo.item.name }, TOAST_RESTAURADO_MS);
      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelector<HTMLButtonElement>(`[data-quitar="${recuerdo.item.id}"]`)
          ?.focus();
      });
    }, LATENCIA_MS);
  };

  /** Paso 7: la alternativa cuando restaurar falló — como agregar de nuevo. */
  const volverAAgregarItem = (recuerdo: Recuerdo) => {
    setItems((prev) => {
      const next = volverAAgregar(prev, recuerdo.item);
      writeCart(next);
      return next;
    });
    publicarToast({ tipo: 'restaurado', nombre: recuerdo.item.name }, TOAST_RESTAURADO_MS);
  };

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
            className="grid h-11 w-11 place-items-center rounded-novey text-2xl leading-none text-text-secondary transition-colors hover:bg-[#F3F4F6] hover:text-novey-blue"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p ref={tituloVacioRef} tabIndex={-1} className="text-base font-semibold text-gray-900 outline-none">
              Tu carrito está vacío
            </p>
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
              {items.map((it) => {
                const enProceso = quitando.has(it.id);
                return (
                  <li key={it.id} className="flex gap-3 p-4">
                    <ProductThumb src={it.image} alt={it.name} className="h-16 w-16" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{it.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{money(it.price)} c/u</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className={`flex items-center rounded-novey border border-border-medium ${
                            enProceso ? 'opacity-50' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => cambiarQty(it.id, -1)}
                            disabled={enProceso || it.qty <= 1}
                            aria-label={`Quitar una unidad de ${it.name}`}
                            className="grid h-11 w-9 place-items-center leading-none text-text-secondary transition-colors hover:text-novey-blue disabled:cursor-not-allowed disabled:text-text-disabled"
                          >
                            −
                          </button>
                          <span aria-live="polite" className="min-w-[2rem] text-center text-sm font-semibold">
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiarQty(it.id, 1)}
                            disabled={enProceso}
                            aria-label={`Agregar una unidad de ${it.name}`}
                            className="grid h-11 w-9 place-items-center leading-none text-text-secondary transition-colors hover:text-novey-blue disabled:cursor-not-allowed disabled:text-text-disabled"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          data-quitar={it.id}
                          onClick={() => quitar(it.id)}
                          disabled={enProceso}
                          className="flex min-h-11 min-w-[76px] items-center gap-1.5 px-1 text-xs font-medium text-feedback-error-dark hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-70"
                        >
                          {enProceso ? (
                            <>
                              <Spinner />
                              Quitando…
                            </>
                          ) : (
                            `Quitar`
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold">{money(it.price * it.qty)}</p>
                  </li>
                );
              })}
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

        {/* Toast del drawer: eliminación, restauración y errores. Vive sobre
            el contenido (overlay) para no mover el layout, también con el
            carrito vacío. aria-live anuncia cada cambio de estado. */}
        <div aria-live="polite" className="pointer-events-none absolute inset-x-3 bottom-3 z-10">
          {toast?.tipo === 'eliminado' && (
            <div className="pointer-events-auto flex items-center gap-2 rounded-novey bg-text-ink px-4 py-2.5 text-sm text-white shadow-lg">
              <span className="min-w-0 flex-1 truncate">Producto eliminado del carrito</span>
              <button
                ref={deshacerRef}
                type="button"
                disabled={toast.restaurando}
                onClick={() => deshacer(toast.recuerdo)}
                className="flex min-h-11 items-center gap-1.5 px-2 font-semibold text-[#8ABAF7] hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-80"
              >
                {toast.restaurando ? (
                  <>
                    <Spinner />
                    Restaurando…
                  </>
                ) : (
                  'Deshacer'
                )}
              </button>
              <button
                type="button"
                onClick={() => setToast(null)}
                disabled={toast.restaurando}
                aria-label="Cerrar el mensaje"
                className="grid h-11 w-9 place-items-center text-lg leading-none text-white/70 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {toast?.tipo === 'restaurado' && (
            <div className="pointer-events-auto rounded-novey bg-text-ink px-4 py-3 text-sm text-white shadow-lg">
              Producto restaurado
            </div>
          )}

          {toast?.tipo === 'error-quitar' && (
            <div role="alert" className="pointer-events-auto flex items-center gap-2 rounded-novey border border-feedback-error-dark/30 bg-feedback-error-bg px-4 py-2.5 text-sm text-feedback-error-dark shadow-lg">
              <span className="min-w-0 flex-1">No pudimos quitar el producto. Intentá nuevamente.</span>
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  quitar(toast.id);
                }}
                className="flex min-h-11 items-center px-2 font-semibold hover:underline"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Cerrar el mensaje"
                className="grid h-11 w-9 place-items-center text-lg leading-none opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {toast?.tipo === 'error-restaurar' && (
            <div role="alert" className="pointer-events-auto flex items-center gap-2 rounded-novey border border-feedback-error-dark/30 bg-feedback-error-bg px-4 py-2.5 text-sm text-feedback-error-dark shadow-lg">
              <span className="min-w-0 flex-1">No pudimos restaurar el producto.</span>
              <button
                type="button"
                onClick={() => volverAAgregarItem(toast.recuerdo)}
                className="flex min-h-11 items-center px-2 font-semibold hover:underline"
              >
                Volver a agregar
              </button>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Cerrar el mensaje"
                className="grid h-11 w-9 place-items-center text-lg leading-none opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
