'use client';

// Mini carrito lateral: se abre desde el ícono del navbar o al agregar algo
// desde cualquier sección. La página completa sigue existiendo en /carrito.
//
// Todo el feedback vive DENTRO del drawer, cerca de lo que cambió, con
// palabras de todos los días (pensado para personas con poca experiencia
// tecnológica):
//  - lo general (producto agregado desde otra sección) va debajo del
//    encabezado, destacando la fila que cambió;
//  - lo de cada producto (sumar, restar, quitar, errores) va debajo de esa
//    fila, y cada fila maneja su estado sin bloquear al resto;
//  - "Quitaste X del carrito" aparece EN el lugar donde estaba el producto,
//    con Deshacer, durante 8–10 segundos;
//  - lo de la cotización va debajo de su formulario.
// No hay toasts flotantes, modales ni mensajes en el header.
//
// Las reglas de lista y de cantidades viven en lib/carrito-drawer.mjs y las
// de cotización en lib/cotizaciones.mjs (probadas sin montar React).
//
// Gancho de desarrollo: window.__noveySimularErrorCarrito =
// 'quitar' | 'restaurar' | 'sumar' | 'restar' fuerza cada camino de error.

import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '../lib/routes';
import ProductThumb from './ProductThumb';
import AvisoInline, { AccionAviso } from './AvisoInline';
import { CartItem, countUnits, readCart, subtotal, writeCart } from '../lib/cart';
import {
  LATENCIA_MS,
  MENSAJE_ELIMINADO_MS,
  MENSAJE_EXITO_MS,
  MENSAJE_INFO_MS,
  ajustarCantidad,
  quitarItem,
  restaurarItem,
  textoCantidad,
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

/**
 * Agregar un producto desde otra sección: se despacha este evento con el
 * CartItem en `detail` y el drawer hace el alta (con su estado de carga y su
 * confirmación adentro). Despachar también CART_OPEN_EVENT para abrirlo.
 */
export const CART_ADD_EVENT = 'novey-cart-agregar';

/** Recuerdo de una eliminación, para poder deshacerla. */
interface Recuerdo {
  item: CartItem;
  indice: number;
}

/** Mensaje debajo de una fila. Uno solo por producto: el nuevo pisa al viejo. */
type AvisoProducto =
  | { tipo: 'sumando' }
  | { tipo: 'restando' }
  | { tipo: 'quitando' }
  | { tipo: 'cantidad'; qty: number }
  | { tipo: 'ultima-unidad' }
  | { tipo: 'sin-stock'; max: number }
  | { tipo: 'error-sumar' }
  | { tipo: 'error-restar' }
  | { tipo: 'error-quitar' }
  | { tipo: 'restaurado' };

/** El mensaje de "Quitaste X", en el lugar de la lista donde estaba X. */
type Eliminado = { recuerdo: Recuerdo; fase: 'visible' | 'restaurando' | 'error' };

/** Mensaje general debajo del encabezado (producto agregado desde afuera). */
type AvisoGeneral =
  | { tipo: 'agregando'; nombre: string }
  | { tipo: 'agregado'; id: string; nombre: string; yaEstaba: boolean; qty: number };

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
    __noveySimularErrorCarrito?: 'quitar' | 'restaurar' | 'sumar' | 'restar';
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

interface ResumenCotizacion {
  numero: string;
  items: CartItem[];
  total: number;
  noDisponibles: string[];
  preciosActualizados: { name: string; precioCotizado: number; precioActual: number }[];
}

/**
 * "Agregar una cotización": control expandible del drawer, en dos pasos.
 * Primero busca (demo: 1001 completa, 4004 con faltantes, 5005 con precios
 * cambiados, 2002 vencida, 3003 de otra cuenta, 9999 error de conexión con
 * reintento), muestra un resumen sencillo y recién al confirmar la agrega.
 * El mensaje de éxito lo maneja el drawer (prop `exito`), así sobrevive al
 * cambio de rama vacío/lleno. Nunca cierra el drawer.
 */
function CotizacionForm({
  aplicar,
  exito,
  onCerrarExito,
  exitoRef,
}: {
  aplicar: (items: CartItem[], numero: string) => void;
  exito: string | null;
  onCerrarExito: () => void;
  exitoRef: React.RefObject<HTMLDivElement>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState('');
  const [fase, setFase] = useState<'campo' | 'buscando' | 'resumen' | 'agregando'>('campo');
  const [aviso, setAviso] = useState<AvisoCotizacion | null>(null);
  const [resumen, setResumen] = useState<ResumenCotizacion | null>(null);

  const disparadorRef = useRef<HTMLButtonElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const intentos = useRef<Map<string, number>>(new Map());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (abierto) campoRef.current?.focus();
  }, [abierto]);

  const limpiar = () => {
    setValor('');
    setAviso(null);
    setResumen(null);
    setFase('campo');
  };

  const cancelar = () => {
    limpiar();
    setAbierto(false);
    disparadorRef.current?.focus();
  };

  const buscar = (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (fase === 'buscando' || fase === 'agregando') return; // sin envíos duplicados
    const numero = normalizarNumero(valor);
    if (!esFormatoValido(numero)) {
      setAviso({ tipo: 'validacion' });
      campoRef.current?.focus();
      return;
    }
    setAviso(null);
    setResumen(null);
    setFase('buscando');
    const intento = (intentos.current.get(numero) ?? 0) + 1;
    intentos.current.set(numero, intento);

    timers.current.push(
      window.setTimeout(() => {
        const r = resolverCotizacion(numero, { aplicadas: leerAplicadas(), intento });
        if (r.tipo === 'encontrada') {
          intentos.current.delete(numero);
          setFase('resumen');
          setResumen({ numero, ...r } as ResumenCotizacion);
        } else {
          setFase('campo');
          setAviso({ tipo: r.tipo } as AvisoCotizacion);
        }
      }, LATENCIA_MS),
    );
  };

  const confirmar = () => {
    if (!resumen || fase === 'agregando') return;
    setFase('agregando');
    timers.current.push(
      window.setTimeout(() => {
        aplicar(resumen.items, resumen.numero);
        limpiar();
        setAbierto(false);
      }, LATENCIA_MS),
    );
  };

  const ocupado = fase === 'buscando' || fase === 'agregando';
  const conError = aviso !== null && aviso.tipo !== 'ya-agregada';

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
        <form id="form-cotizacion" onSubmit={buscar} className="pb-2">
          <label htmlFor="nro-cotizacion" className="text-xs font-medium text-text-secondary">
            Número de cotización
          </label>
          <p id="cotizacion-ayuda" className="mt-0.5 text-xs text-text-tertiary">
            Escribe el número que aparece en tu cotización.
          </p>
          <input
            ref={campoRef}
            id="nro-cotizacion"
            type="text"
            inputMode="numeric"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              if (aviso) setAviso(null);
            }}
            placeholder="Ejemplo: 123456"
            disabled={ocupado || fase === 'resumen'}
            aria-invalid={conError || undefined}
            aria-describedby={`cotizacion-ayuda${aviso ? ' cotizacion-aviso' : ''}`}
            className={`mt-1.5 h-11 w-full rounded-novey border px-3 text-sm outline-none transition-colors placeholder:text-text-tertiary focus:border-novey-blue disabled:bg-[#F9FAFB] disabled:text-text-tertiary ${
              conError ? 'border-feedback-error-dark' : 'border-border-medium'
            }`}
          />

          {/* Mensajes del paso de búsqueda: siempre texto + acción */}
          <div id="cotizacion-aviso" aria-live="polite" className="empty:hidden">
            {fase === 'buscando' && (
              <AvisoInline tipo="cargando" className="mt-2">Buscando tu cotización…</AvisoInline>
            )}
            {aviso?.tipo === 'validacion' && (
              <AvisoInline tipo="error" className="mt-2">
                El número debe tener entre 4 y 6 dígitos. Revisa el número que aparece en tu cotización.
              </AvisoInline>
            )}
            {aviso?.tipo === 'no-encontrada' && (
              <AvisoInline tipo="error" className="mt-2">
                No encontramos una cotización con ese número.
                <span className="mt-0.5 block text-xs">Revisa el número e intenta nuevamente.</span>
              </AvisoInline>
            )}
            {aviso?.tipo === 'vencida' && (
              <AvisoInline
                tipo="error"
                className="mt-2"
                acciones={<AccionAviso href={WHATSAPP_SOPORTE}>Solicitar una nueva cotización</AccionAviso>}
              >
                Esta cotización está vencida y ya no se puede usar.
              </AvisoInline>
            )}
            {aviso?.tipo === 'ajena' && (
              <AvisoInline
                tipo="error"
                className="mt-2"
                acciones={<AccionAviso href={WHATSAPP_SOPORTE}>Contactar con soporte</AccionAviso>}
              >
                No pudimos agregar esta cotización a tu carrito.
              </AvisoInline>
            )}
            {aviso?.tipo === 'ya-agregada' && (
              <AvisoInline tipo="info" className="mt-2">Esta cotización ya está en tu carrito.</AvisoInline>
            )}
            {aviso?.tipo === 'error-red' && (
              <AvisoInline
                tipo="error"
                className="mt-2"
                acciones={
                  <>
                    <AccionAviso onClick={() => buscar()}>Intentar nuevamente</AccionAviso>
                    <AccionAviso onClick={cancelar}>Cancelar</AccionAviso>
                  </>
                }
              >
                No pudimos buscar la cotización.
              </AvisoInline>
            )}
          </div>

          {/* Paso 2: resumen sencillo antes de tocar el carrito */}
          {fase === 'resumen' && resumen && (
            <div aria-live="polite">
              <AvisoInline tipo="exito" className="mt-2">Encontramos tu cotización.</AvisoInline>
              <div className="mt-2 rounded-novey border border-border-medium bg-[#F9FAFB] p-3 text-sm">
                <p className="font-semibold">Cotización {resumen.numero}</p>
                <p className="mt-1 text-text-secondary">
                  {resumen.items.length} {resumen.items.length === 1 ? 'producto' : 'productos'} · Total {money(resumen.total)}
                </p>
                {resumen.noDisponibles.length > 0 && (
                  <div className="mt-1.5 text-xs text-text-secondary">
                    <p className="font-medium">Ya no está disponible y no se va a agregar:</p>
                    <ul className="mt-0.5 list-inside list-disc">
                      {resumen.noDisponibles.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resumen.preciosActualizados.length > 0 && (
                  <p className="mt-1.5 text-xs text-text-secondary">
                    Algunos precios cambiaron desde que se hizo la cotización. El total ya muestra los precios de hoy.
                  </p>
                )}
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmar}
                    className="flex h-11 flex-1 items-center justify-center rounded-novey bg-novey-blue px-3 text-sm font-semibold text-white hover:bg-novey-blue-dark"
                  >
                    Agregar al carrito
                  </button>
                  <button
                    type="button"
                    onClick={cancelar}
                    className="flex h-11 items-center justify-center rounded-novey border border-border-medium px-3 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
          {fase === 'agregando' && (
            <AvisoInline tipo="cargando" className="mt-2">Agregando los productos de tu cotización…</AvisoInline>
          )}

          {(fase === 'campo' || fase === 'buscando') && (
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={valor.trim() === '' || ocupado}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-novey bg-novey-blue px-3 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-disabled"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={cancelar}
                disabled={ocupado}
                className="flex h-11 items-center justify-center rounded-novey border border-border-medium px-3 text-sm font-medium text-text-secondary transition-colors hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      )}

      {/* El éxito sobrevive al colapso del formulario y al cambio de rama */}
      <div aria-live="polite" className="empty:hidden">
        {exito && (
          <AvisoInline ref={exitoRef} tipo="exito" className="mb-1 mt-1" onCerrar={onCerrarExito}>
            Agregamos los productos de la cotización {exito} a tu carrito.
          </AvisoInline>
        )}
      </div>
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

  // Un mensaje por producto (el nuevo reemplaza al anterior) y el mensaje de
  // eliminación, que ocupa el lugar de la fila quitada.
  const [avisos, setAvisos] = useState<Map<string, AvisoProducto>>(new Map());
  const [eliminado, setEliminado] = useState<Eliminado | null>(null);
  const [avisoGeneral, setAvisoGeneral] = useState<AvisoGeneral | null>(null);
  const [cotExito, setCotExito] = useState<string | null>(null);
  const [destacado, setDestacado] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const antesRef = useRef<HTMLElement | null>(null);
  const deshacerRef = useRef<HTMLButtonElement>(null);
  const tituloVacioRef = useRef<HTMLParagraphElement>(null);
  const cotizacionOkRef = useRef<HTMLDivElement>(null);
  // Números de serie por mensaje: un timer viejo compara antes de borrar,
  // así una respuesta tardía no pisa un estado más nuevo.
  const seriesAviso = useRef<Map<string, number>>(new Map());
  const serieEliminado = useRef(0);
  const serieGeneral = useRef(0);
  const serieCotExito = useRef(0);
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

  /** Única puerta de mutación: espejo, estado y storage siempre juntos. */
  const mutarItems = (next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
    writeCart(next);
  };

  /**
   * Pone (o reemplaza) el mensaje de un producto; con `ms` se borra solo.
   * Cada producto lleva su propia serie: no se pisan entre sí.
   */
  const ponerAviso = (id: string, aviso: AvisoProducto | null, ms?: number) => {
    const serie = (seriesAviso.current.get(id) ?? 0) + 1;
    seriesAviso.current.set(id, serie);
    setAvisos((prev) => {
      const next = new Map(prev);
      if (aviso) next.set(id, aviso);
      else next.delete(id);
      return next;
    });
    if (aviso && ms) {
      programar(() => {
        if (seriesAviso.current.get(id) === serie) ponerAviso(id, null);
      }, ms);
    }
  };

  const ocupado = (id: string) => {
    const a = avisos.get(id);
    return a?.tipo === 'sumando' || a?.tipo === 'restando' || a?.tipo === 'quitando';
  };

  /** "+": valida el tope, muestra "Sumando…" y confirma la cantidad nueva. */
  const sumar = (id: string) => {
    if (ocupado(id)) return;
    const regla = ajustarCantidad(itemsRef.current, id, 1);
    if (!regla) return;
    if (regla.tipo === 'sin-stock') {
      ponerAviso(id, { tipo: 'sin-stock', max: regla.max });
      return;
    }
    ponerAviso(id, { tipo: 'sumando' });
    programar(() => {
      if (window.__noveySimularErrorCarrito === 'sumar') {
        ponerAviso(id, { tipo: 'error-sumar' });
        return;
      }
      const r = ajustarCantidad(itemsRef.current, id, 1);
      if (r?.tipo !== 'ok') {
        ponerAviso(id, null);
        return;
      }
      mutarItems(r.items);
      ponerAviso(id, { tipo: 'cantidad', qty: r.qty }, MENSAJE_INFO_MS);
    }, LATENCIA_MS);
  };

  /** "−": nunca baja a cero solo; con una unidad explica que existe "Quitar". */
  const restar = (id: string) => {
    if (ocupado(id)) return;
    const regla = ajustarCantidad(itemsRef.current, id, -1);
    if (!regla) return;
    if (regla.tipo === 'ultima-unidad') {
      ponerAviso(id, { tipo: 'ultima-unidad' });
      return;
    }
    ponerAviso(id, { tipo: 'restando' });
    programar(() => {
      if (window.__noveySimularErrorCarrito === 'restar') {
        ponerAviso(id, { tipo: 'error-restar' });
        return;
      }
      const r = ajustarCantidad(itemsRef.current, id, -1);
      if (r?.tipo !== 'ok') {
        ponerAviso(id, null);
        return;
      }
      mutarItems(r.items);
      ponerAviso(id, { tipo: 'cantidad', qty: r.qty }, MENSAJE_INFO_MS);
    }, LATENCIA_MS);
  };

  /** "Quitar": la fila queda en "Quitando…" y al salir aparece el Deshacer. */
  const quitar = (id: string) => {
    if (ocupado(id)) return;
    const item = itemsRef.current.find((it) => it.id === id);
    if (!item) return;
    ponerAviso(id, { tipo: 'quitando' });

    programar(() => {
      if (window.__noveySimularErrorCarrito === 'quitar') {
        // La fuente de datos no se toca: el producto sigue en la lista.
        ponerAviso(id, { tipo: 'error-quitar' });
        return;
      }
      const r = quitarItem(itemsRef.current, id);
      if (!r) {
        ponerAviso(id, null);
        return;
      }
      ponerAviso(id, null);
      mutarItems(r.restantes);
      // Sin productos tampoco queda nada de cotización, ni siquiera su éxito.
      if (r.restantes.length === 0) setCotExito(null);
      const serie = ++serieEliminado.current;
      setEliminado({ recuerdo: { item: r.item, indice: r.indice }, fase: 'visible' });
      programar(() => {
        // Solo se va solo mientras nadie lo esté usando (deshacer/error quedan).
        if (serieEliminado.current === serie) {
          setEliminado((e) => (e && e.fase === 'visible' ? null : e));
        }
      }, MENSAJE_ELIMINADO_MS);
      // Foco: a "Deshacer" (o al título del vacío si no quedó nada).
      requestAnimationFrame(() => {
        if (r.restantes.length > 0) deshacerRef.current?.focus();
        else tituloVacioRef.current?.focus();
      });
    }, LATENCIA_MS);
  };

  /** "Deshacer": el producto vuelve con su cantidad a su posición original. */
  const deshacer = () => {
    const recuerdo = eliminado?.recuerdo;
    if (!recuerdo || eliminado?.fase === 'restaurando') return;
    serieEliminado.current += 1;
    setEliminado({ recuerdo, fase: 'restaurando' });

    programar(() => {
      if (window.__noveySimularErrorCarrito === 'restaurar') {
        setEliminado({ recuerdo, fase: 'error' });
        return;
      }
      mutarItems(restaurarItem(itemsRef.current, recuerdo));
      setEliminado(null);
      ponerAviso(recuerdo.item.id, { tipo: 'restaurado' }, MENSAJE_INFO_MS);
      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelector<HTMLButtonElement>(`[data-quitar="${recuerdo.item.id}"]`)
          ?.focus();
      });
    }, LATENCIA_MS);
  };

  /** La salida del error de deshacer: como agregarlo de nuevo, al final. */
  const volverAAgregarItem = () => {
    const recuerdo = eliminado?.recuerdo;
    if (!recuerdo) return;
    serieEliminado.current += 1;
    mutarItems(volverAAgregar(itemsRef.current, recuerdo.item));
    setEliminado(null);
    ponerAviso(recuerdo.item.id, { tipo: 'restaurado' }, MENSAJE_INFO_MS);
  };

  /** Cotización confirmada: combina con el carrito (regla: sumar/fusionar). */
  const aplicarCotizacion = (nuevos: CartItem[], numero: string) => {
    mutarItems(combinarConCarrito(itemsRef.current, nuevos));
    guardarAplicada(numero);
    const serie = ++serieCotExito.current;
    setCotExito(numero);
    programar(() => {
      if (serieCotExito.current === serie) setCotExito(null);
    }, MENSAJE_EXITO_MS);
    requestAnimationFrame(() => cotizacionOkRef.current?.focus());
  };

  /** Lleva la vista a una fila y la destaca un momento. */
  const mostrarFila = (id: string) => {
    setDestacado(null);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector(`[data-fila="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      setDestacado(id);
      programar(() => setDestacado((d) => (d === id ? null : d)), 1500);
    });
  };

  // Alta desde otra sección (evento CART_ADD_EVENT): el drawer hace el
  // agregado con su carga y su confirmación, y destaca la fila que cambió.
  useEffect(() => {
    const alta = (e: Event) => {
      const item = (e as CustomEvent<CartItem>).detail;
      if (!item?.id) return;
      const serie = ++serieGeneral.current;
      setAvisoGeneral({ tipo: 'agregando', nombre: item.name });
      programar(() => {
        const existente = itemsRef.current.find((it) => it.id === item.id);
        const qty = (existente?.qty ?? 0) + item.qty;
        mutarItems(
          existente
            ? itemsRef.current.map((it) => (it.id === item.id ? { ...it, qty } : it))
            : [...itemsRef.current, { ...item }],
        );
        setAvisoGeneral({ tipo: 'agregado', id: item.id, nombre: item.name, yaEstaba: !!existente, qty });
        mostrarFila(item.id);
        programar(() => {
          if (serieGeneral.current === serie) setAvisoGeneral((a) => (a?.tipo === 'agregado' ? null : a));
        }, MENSAJE_EXITO_MS);
      }, LATENCIA_MS);
    };
    window.addEventListener(CART_ADD_EVENT, alta);
    return () => window.removeEventListener(CART_ADD_EVENT, alta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unidades = countUnits(items);

  if (!montado) return null;

  /** El mensaje debajo de una fila, según su estado. */
  const avisoDeFila = (it: CartItem) => {
    const a = avisos.get(it.id);
    if (!a) return null;
    switch (a.tipo) {
      case 'sumando':
        return <AvisoInline tipo="cargando">Sumando una unidad…</AvisoInline>;
      case 'restando':
        return <AvisoInline tipo="cargando">Quitando una unidad…</AvisoInline>;
      case 'quitando':
        return <AvisoInline tipo="cargando">Quitando {it.name}…</AvisoInline>;
      case 'cantidad':
        return <AvisoInline tipo="exito">{textoCantidad(a.qty)}</AvisoInline>;
      case 'restaurado':
        return <AvisoInline tipo="exito">{it.name} volvió a tu carrito.</AvisoInline>;
      case 'ultima-unidad':
        return (
          <AvisoInline tipo="advertencia" onCerrar={() => ponerAviso(it.id, null)}>
            Esta es la última unidad. Para sacarla del carrito, selecciona “Quitar”.
          </AvisoInline>
        );
      case 'sin-stock':
        return (
          <AvisoInline tipo="advertencia" onCerrar={() => ponerAviso(it.id, null)}>
            Solo hay {a.max} unidades disponibles.
          </AvisoInline>
        );
      case 'error-sumar':
        return (
          <AvisoInline
            tipo="error"
            onCerrar={() => ponerAviso(it.id, null)}
            acciones={<AccionAviso onClick={() => { ponerAviso(it.id, null); sumar(it.id); }}>Intentar nuevamente</AccionAviso>}
          >
            No pudimos sumar otra unidad.
          </AvisoInline>
        );
      case 'error-restar':
        return (
          <AvisoInline
            tipo="error"
            onCerrar={() => ponerAviso(it.id, null)}
            acciones={<AccionAviso onClick={() => { ponerAviso(it.id, null); restar(it.id); }}>Intentar nuevamente</AccionAviso>}
          >
            No pudimos cambiar la cantidad.
          </AvisoInline>
        );
      case 'error-quitar':
        return (
          <AvisoInline
            tipo="error"
            onCerrar={() => ponerAviso(it.id, null)}
            acciones={<AccionAviso onClick={() => { ponerAviso(it.id, null); quitar(it.id); }}>Intentar nuevamente</AccionAviso>}
          >
            No pudimos quitar {it.name} del carrito.
          </AvisoInline>
        );
    }
  };

  /** La fila-mensaje de "Quitaste X", en el lugar donde estaba el producto. */
  const filaEliminado = eliminado && (
    <li key="__eliminado" className="p-3">
      {eliminado.fase === 'visible' && (
        <AvisoInline
          tipo="info"
          onCerrar={() => setEliminado(null)}
          acciones={
            <button
              ref={deshacerRef}
              type="button"
              onClick={deshacer}
              className="inline-flex min-h-11 items-center text-sm font-semibold underline"
            >
              Deshacer
            </button>
          }
        >
          Quitaste {eliminado.recuerdo.item.name} del carrito.
        </AvisoInline>
      )}
      {eliminado.fase === 'restaurando' && (
        <AvisoInline tipo="cargando">Volviendo a agregar el producto…</AvisoInline>
      )}
      {eliminado.fase === 'error' && (
        <AvisoInline
          tipo="error"
          onCerrar={() => setEliminado(null)}
          acciones={
            <>
              <AccionAviso onClick={deshacer}>Intentar nuevamente</AccionAviso>
              <AccionAviso onClick={volverAAgregarItem}>Volver a agregar al final</AccionAviso>
              <AccionAviso href={ROUTES.producto}>Buscar el producto</AccionAviso>
            </>
          }
        >
          No pudimos volver a agregar el producto.
        </AvisoInline>
      )}
    </li>
  );

  // La lista con el mensaje de eliminación insertado donde estaba el producto.
  const filasProductos = items.map((it) => {
    const enProceso = ocupado(it.id);
    return (
      <li
        key={it.id}
        data-fila={it.id}
        className={`p-4 ${destacado === it.id ? 'fila-destacada' : ''}`}
      >
        <div className="flex gap-3">
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
                  onClick={() => restar(it.id)}
                  disabled={enProceso}
                  aria-label={`Quitar una unidad de ${it.name}`}
                  className="grid h-11 w-9 place-items-center leading-none text-text-secondary transition-colors hover:text-novey-blue disabled:cursor-not-allowed disabled:text-text-disabled"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">{it.qty}</span>
                <button
                  type="button"
                  onClick={() => sumar(it.id)}
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
                className="flex min-h-11 items-center px-1 text-xs font-medium text-feedback-error-dark hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-70"
              >
                Quitar
              </button>
            </div>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold">{money(it.price * it.qty)}</p>
        </div>
        {/* El mensaje de ESTE producto, pegado a su fila */}
        <div aria-live="polite" className="mt-2 empty:hidden">
          {avisoDeFila(it)}
        </div>
      </li>
    );
  });
  if (filaEliminado && items.length > 0) {
    filasProductos.splice(Math.min(eliminado!.recuerdo.indice, items.length), 0, filaEliminado);
  }

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

        {/* Mensaje general: lo que llegó desde otra sección */}
        <div aria-live="polite" className="empty:hidden">
          {avisoGeneral?.tipo === 'agregando' && (
            <AvisoInline tipo="cargando" className="mx-4 mt-3">Agregando al carrito…</AvisoInline>
          )}
          {avisoGeneral?.tipo === 'agregado' && (
            <AvisoInline
              tipo="exito"
              className="mx-4 mt-3"
              onCerrar={() => setAvisoGeneral(null)}
              acciones={<AccionAviso onClick={() => mostrarFila(avisoGeneral.id)}>Ver producto en el carrito</AccionAviso>}
            >
              {avisoGeneral.yaEstaba
                ? `Sumaste una unidad más de ${avisoGeneral.nombre}. Ahora tienes ${avisoGeneral.qty}.`
                : `Agregaste ${avisoGeneral.nombre} al carrito.`}
            </AvisoInline>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p ref={tituloVacioRef} tabIndex={-1} className="text-base font-semibold text-gray-900 outline-none">
              Tu carrito está vacío
            </p>
            {/* Si acaba de quitar el último producto, el vacío lo explica */}
            {eliminado ? (
              <div className="w-full max-w-[320px] text-left" aria-live="polite">
                {eliminado.fase === 'visible' && (
                  <AvisoInline tipo="info">
                    Quitaste {eliminado.recuerdo.item.name}. Puedes volver a agregarlo o seguir comprando.
                  </AvisoInline>
                )}
                {eliminado.fase === 'restaurando' && (
                  <AvisoInline tipo="cargando">Volviendo a agregar el producto…</AvisoInline>
                )}
                {eliminado.fase === 'error' && (
                  <AvisoInline
                    tipo="error"
                    onCerrar={() => setEliminado(null)}
                    acciones={
                      <>
                        <AccionAviso onClick={deshacer}>Intentar nuevamente</AccionAviso>
                        <AccionAviso href={ROUTES.producto}>Buscar el producto</AccionAviso>
                      </>
                    }
                  >
                    No pudimos volver a agregar el producto.
                  </AvisoInline>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Agrega productos y vuelve para completar tu compra.</p>
            )}
            <div className="flex w-full max-w-[320px] flex-col gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-novey bg-novey-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
              >
                Seguir comprando
              </button>
              {eliminado?.fase === 'visible' && (
                <button
                  ref={deshacerRef}
                  type="button"
                  onClick={deshacer}
                  className="flex h-11 items-center justify-center rounded-novey border border-novey-blue bg-white px-6 text-sm font-semibold text-novey-blue transition-colors hover:bg-novey-blue-bg"
                >
                  Deshacer
                </button>
              )}
            </div>
            {/* Sin productos no hay cotización: la sección desaparece entera
                junto con el subtotal (al desmontarse, su formulario se cierra
                y se limpia solo). */}
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-light overflow-y-auto">{filasProductos}</ul>

            <CotizacionForm
              aplicar={aplicarCotizacion}
              exito={cotExito}
              onCerrarExito={() => setCotExito(null)}
              exitoRef={cotizacionOkRef}
            />

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
