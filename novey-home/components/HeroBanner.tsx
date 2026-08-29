'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '../lib/routes';

// Hero compacto en dos columnas: slider de campañas (75%) + dos banners
// estáticos apilados (25%) para dar visibilidad simultánea a otras categorías.
// Los textos y botones viven en HTML, nunca horneados en la imagen: se editan
// acá, se leen con lector de pantalla y se adaptan solos entre dispositivos.

interface Pieza {
  src: string;
  alt: string;
  tag?: string;
  title: string;
  text?: string;
  cta: string;
  href: string;
}

const SLIDES: Pieza[] = [
  {
    src: '/images/hero-pets.jpg',
    alt: 'Perro corriendo feliz por el pasto',
    tag: 'Novey Pets Club',
    title: 'Recíbelo el mismo día',
    text: 'Que tu peludito no se quede sin su snack o comida favorita.',
    cta: 'Comprar ahora',
    href: ROUTES.categoria,
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
  {
    src: '/images/ambiente.jpg',
    alt: 'Living moderno con sofá y decoración cálida',
    tag: 'Renueva tu hogar',
    title: 'Muebles y decoración',
    text: 'Todo para que cada espacio de tu casa se sienta nuevo.',
    cta: 'Ver muebles',
    href: ROUTES.categoria,
  },
];

/** Banner estático superior de la columna derecha (foto + texto encima). */
const BANNER_FOTO: Pieza = {
  src: '/images/hero-navidad.jpg',
  alt: 'Living decorado para Navidad con árbol y luces',
  title: 'Tu Navidad empieza aquí',
  text: 'Encuentra tus favoritos en tienda y en línea.',
  cta: 'Comprar ahora',
  href: ROUTES.navidad,
};

/** Banner estático inferior: bloque de marca + ofertas de la semana. */
const BANNER_OFERTAS = {
  title: 'Las ofertas de la semana',
  cta: 'Comprar ahora',
  href: ROUTES.ofertas,
};

const AUTOPLAY_MS = 6000;

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timer = useRef<number>();

  const goTo = (index: number) => {
    setActive((index + SLIDES.length) % SLIDES.length);
  };

  // Navegación automática; se frena con el mouse encima, con el foco adentro
  // o si la persona pidió menos movimiento.
  useEffect(() => {
    if (pausado) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = window.setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer.current);
  }, [pausado]);

  return (
    <section aria-label="Promociones destacadas" className="w-full">
      <div className="mx-auto grid w-full max-w-page gap-3 px-4 md:grid-cols-4 md:px-6">
        {/* Columna izquierda: slider de campañas (única pieza con movimiento) */}
        <div
          aria-roledescription="carrusel"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
          className="relative overflow-hidden rounded-novey shadow-md md:col-span-3"
        >
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
                className="relative aspect-[16/9] w-full shrink-0 sm:aspect-[21/9] md:aspect-auto md:h-[300px]"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 900px, 100vw"
                  priority={i === 0}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-novey-navy/85 via-novey-navy/45 to-transparent"
                />
                <div className="absolute inset-0 flex items-center">
                  <div className="flex max-w-[440px] flex-col items-start gap-2.5 px-6 py-5 sm:px-10">
                    {slide.tag && (
                      <span className="rounded-novey bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {slide.tag}
                      </span>
                    )}
                    <h2 className="text-[24px] font-bold leading-[1.1] text-white sm:text-[30px] md:text-[34px]">
                      {slide.title}
                    </h2>
                    {slide.text && (
                      <p className="text-[13px] leading-5 text-white/90 sm:text-[14px]">{slide.text}</p>
                    )}
                    <a
                      href={slide.href}
                      tabIndex={i === active ? 0 : -1}
                      className="mt-1 flex h-11 items-center rounded-novey bg-white px-5 text-[14px] font-semibold text-novey-navy transition-colors duration-150 hover:bg-novey-blue hover:text-white"
                    >
                      {slide.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors duration-150 hover:bg-white"
          >
            <img src="/figma/1699f3578e9a1b204834a5cdb4d636716dadc4f3.svg" alt="" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors duration-150 hover:bg-white"
          >
            <img src="/figma/b89994f0a47f6e7c8b8d6ef7c2226789aef9fde0.svg" alt="" className="size-6" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
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

          <p aria-live="polite" className="sr-only">
            Banner {active + 1} de {SLIDES.length}
          </p>
        </div>

        {/* Columna derecha: dos banners estáticos apilados */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-1 md:grid-cols-1 md:grid-rows-[1fr_auto]">
          {/* Campaña destacada con foto */}
          <a
            href={BANNER_FOTO.href}
            className="group relative block overflow-hidden rounded-novey shadow-md min-h-[150px] md:min-h-0"
          >
            <Image
              src={BANNER_FOTO.src}
              alt={BANNER_FOTO.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              sizes="(min-width: 768px) 300px, 100vw"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-novey-navy/55" />
            <span className="absolute inset-0 flex flex-col justify-center gap-1 p-4">
              <span className="text-[18px] font-bold leading-tight text-white">{BANNER_FOTO.title}</span>
              <span className="text-[12px] leading-4 text-white/90">{BANNER_FOTO.text}</span>
              <span className="mt-1.5 text-[13px] font-semibold text-white underline underline-offset-4">
                {BANNER_FOTO.cta}
              </span>
            </span>
          </a>

          {/* Ofertas de la semana: bloque de marca + texto editable */}
          <a
            href={BANNER_OFERTAS.href}
            className="group flex items-stretch overflow-hidden rounded-novey border border-border-light bg-white shadow-md"
          >
            <span className="flex w-[104px] shrink-0 flex-col items-center justify-center gap-0.5 bg-novey-red px-2 py-4 text-white md:w-[74px] lg:w-[104px]">
              <span className="text-[13px] font-bold leading-none md:text-[11px] lg:text-[13px]">Novey</span>
              <span className="text-[19px] font-black leading-tight md:text-[15px] lg:text-[19px]">Ofertas</span>
            </span>
            <span className="flex min-w-0 flex-col justify-center gap-1 px-4 py-4 md:px-3 lg:px-4">
              <span className="text-[15px] font-bold leading-tight text-text-ink md:text-[13px] lg:text-[15px]">
                Las <span className="text-novey-red">ofertas</span> de la semana
              </span>
              <span className="text-[13px] font-semibold text-novey-blue underline underline-offset-4 group-hover:text-novey-blue-dark md:text-[12px] lg:text-[13px]">
                {BANNER_OFERTAS.cta}
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
