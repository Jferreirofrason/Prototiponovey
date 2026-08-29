'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '../lib/routes';

// Hero compacto en dos columnas, enfocado en muebles: slider de ambientes
// (75%) + dos banners estáticos de foto, apilados y del mismo tamaño (25%,
// mitad y mitad). Los textos y botones viven en HTML, nunca horneados en la
// imagen: se editan acá, se leen con lector de pantalla y se adaptan solos.

interface Pieza {
  src: string;
  alt: string;
  tag?: string;
  title: string;
  text?: string;
  cta: string;
  href: string;
  /** Encuadre de la foto dentro del recorte (object-position). */
  pos?: string;
}

const SLIDES: Pieza[] = [
  {
    src: '/images/sala-loft.jpg',
    alt: 'Sala tipo loft con sofá gris, sillones y mesas de madera clara',
    tag: 'Salas',
    title: 'Renueva tu sala',
    text: 'Sofás, sillones y mesas para armar el living que quieres.',
    cta: 'Ver muebles',
    href: ROUTES.categoria,
    pos: 'center 58%',
  },
  {
    src: '/images/dormitorio-boho.jpg',
    alt: 'Dormitorio cálido con cama tendida, plantas y lámpara de mimbre',
    tag: 'Dormitorios',
    title: 'Dormitorios para descansar mejor',
    text: 'Camas, colchones y mesas de noche con estilo.',
    cta: 'Explorar colección',
    href: ROUTES.categoria,
    pos: 'center 55%',
  },
  {
    src: '/images/oficina-escritorio.jpg',
    alt: 'Escritorio blanco minimalista con silla y cuadro apoyado',
    tag: 'Oficina',
    title: 'Tu oficina en casa',
    text: 'Escritorios y sillas para trabajar cómodo todos los días.',
    cta: 'Comprar ahora',
    href: ROUTES.categoria,
    pos: 'center 78%',
  },
];

/** Los dos banners estáticos de la derecha: mismo formato, mismo tamaño. */
const BANNERS: Pieza[] = [
  {
    src: '/images/sala-sofa.jpg',
    alt: 'Sofá de terciopelo verde sobre piso de madera clara',
    title: 'Sofás y sillones',
    cta: 'Explorar colección',
    href: ROUTES.categoria,
    pos: 'center 62%',
  },
  {
    src: '/images/sillon-ambiente.jpg',
    alt: 'Sillón amarillo con lámpara dorada y mueble de televisión',
    title: 'Ofertas en muebles',
    cta: 'Ver ofertas',
    href: ROUTES.ofertas,
    pos: 'center 60%',
  },
];

const AUTOPLAY_MS = 6000;

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timer = useRef<number>();

  const goTo = (index: number) => {
    setActive((index + SLIDES.length) % SLIDES.length);
  };

  // Rotación automática; se frena con el mouse encima, con el foco adentro
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
    <section aria-label="Muebles y promociones destacadas" className="w-full">
      <div className="mx-auto grid w-full max-w-page gap-3 px-4 md:grid-cols-4 md:px-6">
        {/* Columna izquierda: slider de ambientes (única pieza con movimiento) */}
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
                  style={{ objectPosition: slide.pos ?? 'center' }}
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

        {/* Columna derecha: dos banners de foto, mitad y mitad exacta */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-1 md:grid-cols-1 md:grid-rows-2">
          {BANNERS.map((b) => (
            <a
              key={b.title}
              href={b.href}
              className="group relative block min-h-[150px] overflow-hidden rounded-novey shadow-md md:min-h-0"
            >
              <Image
                src={b.src}
                alt={b.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                style={{ objectPosition: b.pos ?? 'center' }}
                sizes="(min-width: 768px) 300px, 100vw"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-novey-navy/80 via-novey-navy/35 to-novey-navy/10"
              />
              <span className="absolute inset-0 flex flex-col justify-end gap-1 p-4">
                <span className="text-[17px] font-bold leading-tight text-white">{b.title}</span>
                <span className="text-[13px] font-semibold text-white underline underline-offset-4">
                  {b.cta}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
