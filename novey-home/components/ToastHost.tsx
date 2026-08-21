'use client';

/**
 * Sistema único de toasts del prototipo.
 *
 * Se monta una sola vez en el layout y escucha un evento, así cualquier
 * componente puede avisar algo con `showToast(...)` sin pasar props ni
 * duplicar la animación en cada card.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_EVENT = 'novey-toast';
const DURACION = 3000;

export interface ToastData {
  /** Agrupa por tipo: un toast de favoritos reemplaza al anterior de favoritos. */
  kind: 'favorito' | 'carrito';
  message: string;
  image?: string;
  productName?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

interface Toast extends ToastData {
  id: number;
}

export function showToast(data: ToastData) {
  window.dispatchEvent(new CustomEvent<ToastData>(TOAST_EVENT, { detail: data }));
}

let seq = 0;

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const cerrar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
  }, []);

  useEffect(() => {
    const onToast = (e: Event) => {
      const data = (e as CustomEvent<ToastData>).detail;
      const id = ++seq;
      setToasts((prev) => [...prev.filter((t) => t.kind !== data.kind), { ...data, id }]);
      timers.current.set(id, window.setTimeout(() => cerrar(id), DURACION));
    };
    window.addEventListener(TOAST_EVENT, onToast);
    const mapa = timers.current;
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      mapa.forEach((t) => window.clearTimeout(t));
      mapa.clear();
    };
  }, [cerrar]);

  return (
    // aria-live para que el lector de pantalla anuncie el mensaje sin robar foco
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in pointer-events-auto flex items-center gap-3 rounded-novey border border-border-light bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
        >
          {t.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.image}
              alt=""
              className="h-10 w-10 shrink-0 rounded-novey border border-border-light object-contain"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">{t.message}</p>
            {t.productName && (
              <p className="truncate text-xs text-text-tertiary">{t.productName}</p>
            )}
          </div>
          {t.action &&
            (t.action.href ? (
              <a
                href={t.action.href}
                className="shrink-0 text-sm font-semibold text-novey-blue hover:underline"
              >
                {t.action.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  cerrar(t.id);
                }}
                className="shrink-0 text-sm font-semibold text-novey-blue hover:underline"
              >
                {t.action.label}
              </button>
            ))}
          <button
            type="button"
            onClick={() => cerrar(t.id)}
            aria-label="Cerrar la notificación"
            className="shrink-0 rounded-novey px-1 text-lg leading-none text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
