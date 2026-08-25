'use client';

/**
 * Mensaje de feedback inline del mini carrito (y de cualquier otro lugar que
 * lo necesite). Pensado para personas con poca experiencia tecnológica: el
 * ícono dice de qué tipo es el mensaje sin depender del color, el texto dice
 * exactamente qué pasó y las acciones dicen qué se puede hacer ahora.
 *
 *  - `cargando`  spinner + texto (fondo azul muy suave)
 *  - `info`      confirmaciones neutras (fondo azul muy suave)
 *  - `exito`     check (fondo verde suave)
 *  - `advertencia`  triángulo (fondo amarillo suave)
 *  - `error`     círculo con ! (fondo rojo suave) — se anuncia con role=alert
 *
 * Los errores permanecen hasta que el usuario los cierre o resuelva; los
 * cierres automáticos los maneja quien lo usa (acá no hay timers).
 */

import { forwardRef, ReactNode } from 'react';

export type TipoAviso = 'cargando' | 'info' | 'exito' | 'advertencia' | 'error';

const ESTILOS: Record<TipoAviso, string> = {
  cargando: 'bg-novey-blue-bg text-novey-navy',
  info: 'bg-novey-blue-bg text-novey-navy',
  exito: 'bg-feedback-success-bg text-feedback-success-dark',
  advertencia: 'bg-feedback-warning-bg text-feedback-warning-dark',
  error: 'bg-feedback-error-bg text-feedback-error-dark',
};

function Icono({ tipo }: { tipo: TipoAviso }) {
  if (tipo === 'cargando') {
    return (
      <span
        aria-hidden="true"
        className="mt-0.5 inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
    );
  }
  const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" {...trazo}>
      {tipo === 'exito' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </>
      )}
      {tipo === 'info' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8v.5" />
        </>
      )}
      {tipo === 'advertencia' && (
        <>
          <path d="M12 4 21 20H3L12 4Z" />
          <path d="M12 10v4M12 17v.5" />
        </>
      )}
      {tipo === 'error' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16v.5" />
        </>
      )}
    </svg>
  );
}

const AvisoInline = forwardRef<HTMLDivElement, {
  tipo: TipoAviso;
  children: ReactNode;
  /** Botones o links de acción, ya armados por quien lo usa. */
  acciones?: ReactNode;
  /** Si viene, muestra la × de "Cerrar mensaje". */
  onCerrar?: () => void;
  className?: string;
}>(function AvisoInline({ tipo, children, acciones, onCerrar, className = '' }, ref) {
  return (
    <div
      ref={ref}
      role={tipo === 'error' ? 'alert' : undefined}
      tabIndex={-1}
      className={`flex items-start gap-2 rounded-novey px-3 py-2.5 text-sm outline-none ${ESTILOS[tipo]} ${className}`}
    >
      <Icono tipo={tipo} />
      <div className="min-w-0 flex-1">
        <div className="leading-snug">{children}</div>
        {acciones && <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">{acciones}</div>}
      </div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar mensaje"
          className="-my-1 grid h-11 w-9 shrink-0 place-items-center text-lg leading-none opacity-70 transition-opacity hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
});

export default AvisoInline;

/** Acción de texto dentro de un aviso (mínimo 44px de alto tocable). */
export function AccionAviso({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const clase = 'inline-flex min-h-11 items-center text-sm font-semibold underline';
  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={clase}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={clase}>
      {children}
    </button>
  );
}
