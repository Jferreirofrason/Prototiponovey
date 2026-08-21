'use client';

/* ============================================================================
 * FUENTE ÚNICA del carrusel de marcas.
 *
 * Lo usan dos apps Next distintas (novey-home y novey-checkout), que se
 * deployean por separado y por eso no pueden importar el mismo archivo en
 * runtime. `shared/sync.mjs` copia ESTE archivo dentro de cada app antes de
 * `dev` y de `build`, así que se edita acá y nunca en las copias generadas.
 *
 * - Home: "Nuestras marcas exclusivas".
 * - Confirmación de compra: "Sigue tus marcas favoritas".
 *
 * Cambia solamente el título y el subtítulo; tarjetas, logos, textos, enlaces,
 * medidas, hover y comportamiento son idénticos en ambas.
 * ========================================================================== */

import { useCallback, useEffect, useRef } from 'react';

type Brand = {
  name: string;
  logo: string;
  /** alto del logo en px (el ancho se ajusta solo, caja de 99px) */
  logoH: number;
  description: string;
};

const BRANDS: Brand[] = [
  {
    name: 'LANCO',
    logo: '/figma/3b4e49e91a5b043d422b1b999a4c47b8308dbca8.png',
    logoH: 58,
    description: 'Pinturas y Recubrimientos de alta calidad',
  },
  {
    name: 'INGCO',
    logo: '/figma/9d11d8e0a652763ee89c9413614c5576a8ec405f.png',
    logoH: 36,
    description: 'Herramientas profesionales para cada proyecto',
  },
  {
    name: 'DYLLU',
    logo: '/figma/d7a912b83554559074bc5884fce0b8b3206a278a.png',
    logoH: 32,
    description: 'Iluminación moderna y eficiente',
  },
  {
    name: 'KOHLER',
    logo: '/figma/d9d6d7b04d36e8ca7938e14c1bec4e8f30314f3e.png',
    logoH: 56,
    description: 'Baños y Sanitarios premium',
  },
  {
    name: 'MiPRO',
    logo: '/figma/ae1709a11bd64d1782a8aec7a09451393c140bc4.png',
    logoH: 29,
    description: 'Soluciones de instalación profesional',
  },
  {
    name: 'AKUA',
    logo: '/figma/7813415afe16404019a3f73c47493754d2bcea21.png',
    logoH: 46,
    description: 'Plomería de calidad superior',
  },
];

const ARROW_EXPLORE = '/figma/69e044c188d118384b41b0b52fea75e53044f1a8.svg';
const ARROW_PREV = '/figma/05d92d67d8f87a743801c7875cdc5c3814628f48.svg';
const ARROW_NEXT = '/figma/06dfec72e0661a6bc34af245defd1dafeb8feb5e.svg';

// ancho de card (218) + gap (13)
const CARD_STEP = 231;
// Copias de la lista para que el bucle no tenga bordes. El scroll vive siempre
// dentro de la banda [2·período, 3·período): como todas las copias son idénticas,
// volver al inicio de la banda es invisible. La copia REAL_SET es la única que
// ve el lector de pantalla; el resto va con aria-hidden.
const SETS = 5;
const REAL_SET = 2;
const AUTO_SPEED = 40; // px/s — lento para poder leer cada tarjeta
const RAMP = 450; // ms de arranque/frenado del automático
const USER_IDLE = 900; // ms de espera antes de retomar tras una interacción manual

const LOOP = Array.from({ length: SETS }, (_, set) => set);

export type BrandsCarouselProps = {
  title: string;
  subtitle: string;
  /** id del <h2> para poder etiquetar la <section> desde afuera */
  headingId?: string;
  /**
   * Prefijo de los assets. La home los sirve en `/figma/...`; el checkout corre
   * bajo basePath `/checkout`, así que pasa `/checkout` y usa su propio public.
   */
  assetBase?: string;
  /** Destino del botón "Explorar" (mismo enlace en ambas páginas). */
  exploreHref?: string;
};

export default function BrandsCarousel({
  title,
  subtitle,
  headingId = 'marcas-heading',
  assetBase = '',
  exploreHref = '#marcas',
}: BrandsCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const periodRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeAtRef = useRef(0);
  /** hasta cuándo el loop no debe tocar scrollLeft (swipe o scroll suave en curso) */
  const holdRef = useRef(0);
  const trackId = `${headingId}-track`;

  // Mide el período (ancho de una copia completa, gaps incluidos) y arranca
  // el scroll en el centro de la banda.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const items = track.children;
      if (items.length <= BRANDS.length) return;
      const first = items[0] as HTMLElement;
      const next = items[BRANDS.length] as HTMLElement;
      const period = next.offsetLeft - first.offsetLeft;
      if (period > 0 && Math.abs(period - periodRef.current) > 0.5) {
        periodRef.current = period;
        track.scrollLeft = period * REAL_SET;
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Desplazamiento automático: un solo rAF que empuja scrollLeft. Todo lo demás
  // (flechas, swipe, rueda, foco) también escribe scrollLeft, así que conviven
  // sin pelearse: mientras el usuario mueve el carrusel, el loop no escribe.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let prev = 0;
    let factor = 0; // 0..1, rampa de velocidad
    let pos = track.scrollLeft; // posición en float (scrollLeft puede redondear)
    let expected = -1; // último valor que escribimos nosotros

    const onScroll = () => {
      // Si el valor coincide con lo que escribimos, el movimiento es nuestro.
      if (expected >= 0 && Math.abs(track.scrollLeft - expected) < 1.5) return;
      const now = performance.now();
      holdRef.current = Math.max(holdRef.current, now + 160);
      resumeAtRef.current = Math.max(resumeAtRef.current, now + USER_IDLE);
      factor = 0;
      pos = track.scrollLeft;
    };
    track.addEventListener('scroll', onScroll, { passive: true });

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = prev ? Math.min(t - prev, 50) : 0;
      prev = t;

      const period = periodRef.current;
      if (!period) return;

      // Mientras el usuario arrastra o corre un scroll suave, no tocamos nada.
      if (t < holdRef.current) {
        expected = -1;
        pos = track.scrollLeft;
        return;
      }

      // Reencuadre invisible dentro de la banda.
      let x = pos;
      while (x >= period * (REAL_SET + 1)) x -= period;
      while (x < period * REAL_SET) x += period;
      if (x !== pos) {
        pos = x;
        track.scrollLeft = x;
      }

      const running = !reduced.matches && !pausedRef.current && t >= resumeAtRef.current;
      const target = running ? 1 : 0;
      if (dt > 0 && factor !== target) {
        const delta = dt / RAMP;
        factor = target > factor ? Math.min(target, factor + delta) : Math.max(target, factor - delta);
      }

      const eased = factor * factor * (3 - 2 * factor); // smoothstep
      if (eased > 0.001 && dt > 0) {
        pos += (AUTO_SPEED * eased * dt) / 1000;
        track.scrollLeft = pos;
      }
      expected = track.scrollLeft;
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Flechas: avanzan las tarjetas que entren enteras en pantalla (1 en mobile,
  // hasta 3 en desktop) y después el automático vuelve a arrancar solo.
  const scrollByCards = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = (periodRef.current || CARD_STEP * BRANDS.length) / BRANDS.length;
    const visible = Math.max(1, Math.min(3, Math.floor(track.clientWidth / card)));
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const now = performance.now();
    // el loop suelta el control mientras corre el scroll suave y retoma después
    holdRef.current = Math.max(holdRef.current, now + (smooth ? 800 : 60));
    resumeAtRef.current = Math.max(resumeAtRef.current, holdRef.current + USER_IDLE);
    track.scrollBy({ left: direction * card * visible, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);
  const resumeAfterTouch = useCallback(() => {
    pausedRef.current = false;
    resumeAtRef.current = performance.now() + USER_IDLE;
  }, []);

  return (
    <section aria-labelledby={headingId}>
      <div className="mx-auto w-full max-w-[1276px] px-4 sm:px-6 lg:px-6">
        <h2 id={headingId} className="text-2xl font-bold leading-8 text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-[21px] text-gray-500">{subtitle}</p>

        {/* flow-root: evita que el margen negativo del track colapse con el mt-6 */}
        <div
          className="relative mt-6 flow-root"
          role="group"
          aria-roledescription="carrusel"
          aria-label={title}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onTouchStart={pause}
          onTouchEnd={resumeAfterTouch}
          onTouchCancel={resumeAfterTouch}
        >
          {/* El padding vertical deja aire para el levante y la sombra del hover
              (el scroll horizontal recorta el eje Y); los márgenes negativos
              devuelven el alto original de la sección. */}
          <ul
            id={trackId}
            ref={trackRef}
            className="scroll-x -mb-6 -mt-6 flex gap-[13px] overflow-x-auto pb-8 pt-6"
          >
            {LOOP.map((set) =>
              BRANDS.map((brand) => {
                const real = set === REAL_SET;
                return (
                  <li
                    key={`${set}-${brand.name}`}
                    aria-hidden={real ? undefined : true}
                    className="group flex h-[346px] w-[218px] shrink-0 flex-col items-center rounded-novey bg-white px-5 pb-[26px] pt-[26px] shadow-[0px_5px_8px_0px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,85,184,0)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:shadow-[0px_14px_28px_-6px_rgba(0,85,184,0.22),0_0_0_1px_rgba(0,85,184,0.35)] focus-within:-translate-y-2 focus-within:shadow-[0px_14px_28px_-6px_rgba(0,85,184,0.22),0_0_0_1px_rgba(0,85,184,0.35)]"
                  >
                    <div className="flex h-[119px] w-[99px] items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${assetBase}${brand.logo}`}
                        alt={real ? `Logo de ${brand.name}` : ''}
                        style={{ height: brand.logoH }}
                        className="w-auto max-w-[99px] object-contain transition-transform duration-300 ease-out group-hover:scale-105 group-focus-within:scale-105"
                      />
                    </div>
                    <h3 className="mt-2 text-lg font-bold leading-6 text-gray-900">{brand.name}</h3>
                    <p className="mt-3 text-center text-xs leading-4 text-gray-500">
                      {brand.description}
                    </p>
                    <a
                      href={exploreHref}
                      tabIndex={real ? undefined : -1}
                      className="mt-auto inline-flex h-9 w-full items-center justify-center gap-2 rounded-novey bg-novey-blue text-xs font-semibold text-white transition-colors duration-300 hover:bg-novey-blue-dark group-hover:bg-novey-blue-dark group-focus-within:bg-novey-blue-dark"
                    >
                      Explorar
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${assetBase}${ARROW_EXPLORE}`}
                        alt=""
                        width={13}
                        height={13}
                        className="transition-transform duration-300 ease-out group-hover:translate-x-[3px] group-focus-within:translate-x-[3px]"
                      />
                    </a>
                  </li>
                );
              })
            )}
          </ul>

          <button
            type="button"
            aria-label="Ver marcas anteriores"
            aria-controls={trackId}
            onClick={() => scrollByCards(-1)}
            className="absolute -left-3 top-1/2 hidden size-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-black/60 shadow-[0px_3px_10px_0px_rgba(0,0,0,0.2)] transition-colors duration-150 hover:bg-black/80 md:flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${assetBase}${ARROW_PREV}`} alt="" width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Ver más marcas"
            aria-controls={trackId}
            onClick={() => scrollByCards(1)}
            className="absolute -right-3 top-1/2 hidden size-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-black/60 shadow-[0px_3px_10px_0px_rgba(0,0,0,0.2)] transition-colors duration-150 hover:bg-black/80 md:flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${assetBase}${ARROW_NEXT}`} alt="" width={16} height={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
