'use client';

// Miniatura de producto del carrito y el minicart. Encuadre uniforme:
// `object-contain` para no recortar ni deformar, y respaldo si la imagen
// falta o falla al cargar.

import { useState } from 'react';

export default function ProductThumb({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  /** El mini carrito carga sus pocas miniaturas de inmediato. */
  eager?: boolean;
}) {
  const [falla, setFalla] = useState(false);
  const caja = `grid shrink-0 place-items-center overflow-hidden rounded-novey border border-border-light bg-white ${className}`;

  if (!src || falla) {
    return (
      <span className={caja}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-400" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </span>
    );
  }

  return (
    <span className={caja}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        onError={() => setFalla(true)}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
