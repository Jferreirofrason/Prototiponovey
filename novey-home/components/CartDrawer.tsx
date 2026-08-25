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
import {
  combinarConCarrito,
  esFormatoValido,
  normalizarNumero,
  resolverCotizacion,
} from '../lib/cotizaciones.mjs';

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
  | { tipo: 'error-restaurar'; recuerdo: Recuerdo }
  | { tipo: 'cotizacion-ok'; texto: string };

/** Números de cotización ya aplicados a este carrito (estado "ya agregada"). */
const APLICADAS_KEY = 'novey-cotizaciones-aplicadas';
const leerAplicadas = (): string[] => {
  try {
    const raw = window.localStorage.getItem(APLICADAS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const guardarAplicada = (numero: string) => {
  try {
    window.localStorage.setItem(APLICADAS_KEY, JSON.stringify([...leerAplicadas(), numero]));
  } catch {}
};

/** WhatsApp real del sitio (el mismo del menú): canal de las acciones de ayuda. */
const WHATSAPP_SOPORTE = 'https://wa.me/50764336170';

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


/** Ícono de etiqueta/cotización. */
function QuoteIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 4h16v14H8l-4 4V4Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

type AvisoCotizacion =
  | { tipo: 'validacion' }
  | { tipo: 'no-encontrada' }
  | { tipo: 'vencida' }
  | { tipo: 'ajena' }
  | { tipo: 'ya-agregada' }
  | { tipo: 'error-red' };

type ConfirmacionCotizacion =
  | { tipo: 'parcial'; disponibles: CartItem[]; noDisponibles: string[] }
  | { tipo: 'precios'; items: CartItem[]; cambios: { name: string; precioCotizado: number; precioActual: number }[]; totalCotizado: number; totalActual: number };

/**
 * "Agregar una cotización": control expandible del drawer. Valida el formato,
 * resuelve la cotización (demo: COT-1001 ok, COT-4004 stock parcial, COT-5005
 * precios, COT-2002 vencida, COT-3003 ajena, COT-9999 error de red con
 * reintento) y delega en `aplicar` la combinación con el carrito. Nunca toca
 * el carrito por su cuenta ni cierra el drawer.
 */
function CotizacionForm({ aplicar }: { aplicar: (items: CartItem[], numero: string) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState<AvisoCotizacion | null>(null);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionCotizacion | null>(null);

  const disparadorRef = useRef<HTMLButtonElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const intentos = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (abierto) campoRef.current?.focus();
  }, [abierto]);

  const limpiar = () => {
    setValor('');
    setAviso(null);
    setConfirmacion(null);
    setProcesando(false);
  };

  const cancelar = () => {
    limpiar();
    setAbierto(false);
    disparadorRef.current?.focus();
  };

  const exito = (items: CartItem[], numero: string) => {
    aplicar(items, numero);
    limpiar();
    setAbierto(false);
  };

  const enviar = (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (procesando) return; // sin envíos duplicados
    const numero = normalizarNumero(valor);
    if (!esFormatoValido(numero)) {
      setAviso({ tipo: 'validacion' });
      campoRef.current?.focus();
      return;
    }
    setAviso(null);
    setConfirmacion(null);
    setProcesando(true);
    const intento = (intentos.current.get(numero) ?? 0) + 1;
    intentos.current.set(numero, intento);

    window.setTimeout(() => {
      setProcesando(false);
      const r = resolverCotizacion(numero, { aplicadas: leerAplicadas(), intento });
      if (r.tipo === 'ok') {
        intentos.current.delete(numero);
        exito(r.items as CartItem[], numero);
      } else if (r.tipo === 'parcial' || r.tipo === 'precios') {
        setConfirmacion(r as ConfirmacionCotizacion);
      } else {
        setAviso({ tipo: r.tipo } as AvisoCotizacion);
      }
    }, LATENCIA_MS);
  };

  const numero = normalizarNumero(valor);
  const conError = aviso !== null;

  return (
    <div className="border-t border-border-light px-4 py-2">
      <button
        ref={disparadorRef}
        type="button"
        aria-expanded={abierto}
        aria-controls="form-cotizacion"
        onClick={() => (abierto ? cancelar() : setAbierto(true))}
        className="flex min-h-11 w-full items-center gap-2 text-sm font-medium text-novey-blue hover:underline"
      >
        <QuoteIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Agregar una cotización</span>
        <span aria-hidden="true" className={`text-xs transition-transform duration-150 ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {abierto && (
        <form id="form-cotizacion" onSubmit={enviar} className="pb-2">
          <label htmlFor="nro-cotizacion" className="text-xs font-medium text-text-secondary">
            Número de cotización
          </label>
          <input
            ref={campoRef}
            id="nro-cotizacion"
            type="text"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              if (aviso) setAviso(null);
            }}
            placeholder="Ingresa el número de cotización"
            disabled={procesando || confirmacion !== null}
            aria-invalid={conError || undefined}
            aria-describedby={conError ? 'cotizacion-aviso' : undefined}
            className={`mt-1 h-11 w-full rounded-novey border px-3 text-sm outline-none transition-colors placeholder:text-text-tertiary focus:border-novey-blue disabled:bg-[#F9FAFB] disabled:text-text-tertiary ${
              conError ? 'border-feedback-error-dark' : 'border-border-medium'
            }`}
          />

          {/* Avisos inline: siempre texto + acción, nunca solo color */}
          <div id="cotizacion-aviso" aria-live="polite" className="text-sm">
            {aviso?.tipo === 'validacion' && (
              <p className="mt-1.5 text-feedback-error-dark">
                Número de cotización inválido. Revisa el número e intenta nuevamente.
              </p>
            )}
            {aviso?.tipo === 'no-encontrada' && (
              <p className="mt-1.5 text-feedback-error-dark">
                No encontramos una cotización con ese número.{' '}
                <button type="button" onClick={() => enviar()} className="min-h-11 font-semibold underline">
                  Intentar nuevamente
                </button>
              </p>
            )}
            {aviso?.tipo === 'vencida' && (
              <p className="mt-1.5 text-feedback-error-dark">
                Esta cotización está vencida y no puede agregarse al carrito.{' '}
                <a href={WHATSAPP_SOPORTE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">
                  Solicitar una nueva cotización
                </a>
              </p>
            )}
            {aviso?.tipo === 'ajena' && (
              <p className="mt-1.5 text-feedback-error-dark">
                No pudimos agregar esta cotización a tu carrito.{' '}
                <a href={WHATSAPP_SOPORTE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">
                  Contactar con soporte
                </a>
              </p>
            )}
            {aviso?.tipo === 'ya-agregada' && (
              <p className="mt-1.5 text-text-secondary">Esta cotización ya fue agregada al carrito.</p>
            )}
            {aviso?.tipo === 'error-red' && (
              <p className="mt-1.5 text-feedback-error-dark">
                No pudimos agregar la cotización. Intenta nuevamente.{' '}
                <button type="button" onClick={() => enviar()} className="min-h-11 font-semibold underline">
                  Reintentar
                </button>
              </p>
            )}
          </div>

          {/* Confirmaciones inline (no modales): stock parcial y precios */}
          {confirmacion?.tipo === 'parcial' && (
            <div className="mt-2 rounded-novey border border-border-medium bg-[#F9FAFB] p-3 text-sm" aria-live="polite">
              <p className="font-medium">Algunos productos ya no están disponibles. ¿Quieres agregar los productos restantes?</p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-text-tertiary">
                {confirmacion.noDisponibles.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-text-secondary">
                Se agregarán solo los {confirmacion.disponibles.length} productos disponibles.
              </p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => exito(confirmacion.disponibles, numero)} className="flex h-11 flex-1 items-center justify-center rounded-novey bg-novey-blue px-3 text-sm font-semibold text-white hover:bg-novey-blue-dark">
                  Agregar disponibles
                </button>
                <button type="button" onClick={cancelar} className="flex h-11 items-center justify-center rounded-novey border border-border-medium px-3 text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {confirmacion?.tipo === 'precios' && (
            <div className="mt-2 rounded-novey border border-border-medium bg-[#F9FAFB] p-3 text-sm" aria-live="polite">
              <p className="font-medium">Algunos precios cambiaron desde que se creó la cotización.</p>
              <ul className="mt-1.5 space-y-1 text-xs text-text-secondary">
                {confirmacion.cambios.map((c) => (
                  <li key={c.name}>
                    {c.name}: cotizado {money(c.precioCotizado)}, actual {money(c.precioActual)} (+{money(c.precioActual - c.precioCotizado)})
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs font-semibold text-text-primary">Total actualizado: {money(confirmacion.totalActual)}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => exito(confirmacion.items, numero)} className="flex h-11 flex-1 items-center justify-center rounded-novey bg-novey-blue px-3 text-sm font-semibold text-white hover:bg-novey-blue-dark">
                  Aceptar y agregar
                </button>
                <button type="button" onClick={cancelar} className="flex h-11 items-center justify-center rounded-novey border border-border-medium px-3 text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!confirmacion && (
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={valor.trim() === '' || procesando}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-novey bg-novey-blue px-3 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-disabled"
              >
                {procesando ? (
                  <>
                    <Spinner />
                    Agregando…
                  </>
                ) : (
                  'Agregar'
                )}
              </button>
              <button
                type="button"
                onClick={cancelar}
                disabled={procesando}
                className="flex h-11 items-center justify-center rounded-novey border border-border-medium px-3 text-sm font-medium text-text-secondary transition-colors hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Espejo síncrono de `items`: las mutaciones parten de acá y no de un
  // updater, porque escribir el storage dentro de un updater dispara
  // `novey-cart-change` en pleno render y React reaplica el updater sobre el
  // resultado ya combinado (cada cotización se sumaba dos veces).
  const itemsRef = useRef<CartItem[]>([]);
  // Ids con una eliminación en curso: cada producto maneja su estado solo.
  const [quitando, setQuitando] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const antesRef = useRef<HTMLElement | null>(null);
  const deshacerRef = useRef<HTMLButtonElement>(null);
  const tituloVacioRef = useRef<HTMLParagraphElement>(null);
  const cotizacionOkRef = useRef<HTMLDivElement>(null);
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
    const leer = () => {
      itemsRef.current = readCart() ?? [];
      setItems(itemsRef.current);
    };
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

  /** Única puerta de mutación: espejo, estado y storage siempre juntos. */
  const mutarItems = (next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
    writeCart(next);
  };

  const cambiarQty = (id: string, delta: number) =>
    mutarItems(
      itemsRef.current.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it,
      ),
    );

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
      const r = quitarItem(itemsRef.current, id);
      if (!r) return; // ya no estaba
      if (falla) {
        // La fuente de datos no se toca: el producto sigue en la lista.
        publicarToast({ tipo: 'error-quitar', id, nombre: r.item.name });
        return;
      }
      mutarItems(r.restantes);
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
      mutarItems(restaurarItem(itemsRef.current, recuerdo));
      publicarToast({ tipo: 'restaurado', nombre: recuerdo.item.name }, TOAST_RESTAURADO_MS);
      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelector<HTMLButtonElement>(`[data-quitar="${recuerdo.item.id}"]`)
          ?.focus();
      });
    }, LATENCIA_MS);
  };

  /** Cotización resuelta: combina con el carrito (regla: sumar/fusionar). */
  const aplicarCotizacion = (nuevos: CartItem[], numero: string) => {
    mutarItems(combinarConCarrito(itemsRef.current, nuevos));
    guardarAplicada(numero);
    publicarToast(
      { tipo: 'cotizacion-ok', texto: `Cotización ${numero} agregada correctamente.` },
      TOAST_ELIMINADO_MS,
    );
    requestAnimationFrame(() => cotizacionOkRef.current?.focus());
  };

  /** Paso 7: la alternativa cuando restaurar falló — como agregar de nuevo. */
  const volverAAgregarItem = (recuerdo: Recuerdo) => {
    mutarItems(volverAAgregar(itemsRef.current, recuerdo.item));
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
            <div className="w-full max-w-[320px] text-left">
              <CotizacionForm aplicar={aplicarCotizacion} />
            </div>
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

            <CotizacionForm aplicar={aplicarCotizacion} />

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

          {toast?.tipo === 'cotizacion-ok' && (
            <div
              ref={cotizacionOkRef}
              tabIndex={-1}
              className="pointer-events-auto rounded-novey bg-text-ink px-4 py-3 text-sm text-white shadow-lg outline-none"
            >
              {toast.texto}
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
