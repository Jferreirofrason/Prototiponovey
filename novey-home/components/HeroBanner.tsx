'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ROUTES } from '../lib/routes';

// 3 slides con foto de calidad + texto vivo (el arte original de Figma venía
// en 600×300 con el texto horneado; se reconstruyó con la misma jerarquía).
const SLIDES = [
  {
    src: '/images/hero-pets.jpg',
    alt: 'Perro corriendo feliz por el pasto',
    tag: 'Novey Pets Club',
    title: 'Recíbelo el mismo día',
    text: 'Que tu peludito no se quede sin su snack o comida favorita. Compra y recíbelo el mismo día.',
    cta: 'Comprar ahora',
    href: ROUTES.categoria,
  },
  {
    src: '/images/hero-navidad.jpg',
    alt: 'Living decorado para Navidad con árbol y chimenea',
    tag: 'Especial Navidad',
    title: 'Todo para tu Navidad',
    text: 'Decoración, luces y regalos para que tu hogar brille estas fiestas.',
    cta: 'Ver Navidad',
    href: ROUTES.navidad,
  },
  {
    src: '/images/hero-herramientas.jpg',
    alt: 'Taladro inalámbrico DeWalt sobre una mesa de trabajo',
    tag: 'Solo por hoy',
    title: 'Hasta 40% en herramientas',
    text: 'Descuentos en herramientas seleccionadas con el cupón NOVIEMBRE15.',
    cta: 'Ver ofertas',
    href: ROUTES.ofertas,
  },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    setActive((index + SLIDES.length) % SLIDES.length);
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones destacadas"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-page md:px-6 lg:px-6">
        <div className="relative">
          {/* Viewport del carrusel */}
          <div className="relative overflow-hidden shadow-lg md:rounded-novey">
            <div
              className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Banner ${i + 1} de ${SLIDES.length}`}
                  aria-hidden={i !== active}
                  className="relative aspect-[4/3] w-full shrink-0 sm:aspect-[2/1] md:aspect-auto md:h-[363px]"
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 1196px, 100vw"
                    priority={i === 0}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-novey-navy/90 via-novey-navy/55 to-novey-navy/5"
                  />
                  <div className="absolute inset-0 flex items-center">
                    <div className="flex max-w-[560px] flex-col items-start gap-3 px-6 py-6 sm:px-12 md:gap-4 md:px-16">
                      <span className="rounded-novey bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {slide.tag}
                      </span>
                      <h2 className="text-[28px] font-bold leading-[1.1] text-white sm:text-[36px] md:text-[44px]">
                        {slide.title}
                      </h2>
                      <p className="text-[14px] leading-5 text-white/90 sm:text-[16px] sm:leading-6">
                        {slide.text}
                      </p>
                      <a
                        href={slide.href}
                        tabIndex={i === active ? 0 : -1}
                        className="mt-1 flex h-11 items-center rounded-novey bg-white px-6 text-[14px] font-semibold text-novey-navy transition-colors duration-150 hover:bg-novey-blue hover:text-white"
                      >
                        {slide.cta}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    i === active ? 'w-8 bg-white/90' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Flechas prev/next */}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Banner anterior"
            className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors duration-150 hover:bg-white lg:left-12"
          >
            <img src="/figma/1699f3578e9a1b204834a5cdb4d636716dadc4f3.svg" alt="" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Banner siguiente"
            className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors duration-150 hover:bg-white lg:right-12"
          >
            <img src="/figma/b89994f0a47f6e7c8b8d6ef7c2226789aef9fde0.svg" alt="" className="size-6" />
          </button>

          {/* Anuncio del slide activo para lectores de pantalla */}
          <p aria-live="polite" className="sr-only">
            Banner {active + 1} de {SLIDES.length}
          </p>
        </div>
      </div>
    </section>
  );
}
