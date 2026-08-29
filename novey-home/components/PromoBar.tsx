'use client';

import { useEffect, useRef, useState } from 'react';

const COUPON = 'NOVIEMBRE15';

export default function PromoBar() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard no disponible: el cupón queda visible igual.
    }
  };

  return (
    <section
      aria-label="Oferta especial con cupón de descuento"
      className="sticky top-0 z-40 mt-3 w-full bg-[#FFD200]"
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-6">
        {/* Mensaje */}
        <div className="flex items-center gap-4">
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-novey bg-novey-blue">
            <img src="/figma/68586c1bddcc1aa53c87e68d9753f67c7dbd3f4d.svg" alt="" className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-[21px] text-text-ink">¡Aprovecha la oferta especial!</p>
            <p className="text-sm font-semibold leading-[21px] text-text-ink">
              Solo por hoy: hasta 40% de descuento en herramientas seleccionadas
            </p>
          </div>
        </div>

        {/* Cupón */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm leading-[21px] text-text-ink">Cupón:</span>
          <span className="flex h-10 items-center rounded-novey border border-dashed border-novey-blue bg-white px-5 shadow-sm">
            <span className="text-sm uppercase leading-[21px] tracking-[0.7px] text-novey-blue">{COUPON}</span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Cupón copiado' : `Copiar cupón ${COUPON}`}
            className="flex h-11 items-center gap-2 rounded-novey bg-novey-blue px-4 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-novey-blue-dark md:h-9"
          >
            <img src="/figma/5e413ea79b846bc2a797f9c84c28b139e5a20f03.svg" alt="" className="size-[18px]" />
            {copied ? '¡Copiado!' : 'Copiar cupón'}
          </button>
        </div>
      </div>
    </section>
  );
}
