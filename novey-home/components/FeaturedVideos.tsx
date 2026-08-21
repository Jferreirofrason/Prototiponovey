'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ROUTES } from '../lib/routes';

const PLAY_ICON = '/figma/d5aa33b067a8dce44d4029591abd54b41169abbc.svg';
const CHEVRON_ICON = '/figma/b89994f0a47f6e7c8b8d6ef7c2226789aef9fde0.svg';

type VideoCard = {
  user: string;
  duration: string;
  video: string;
  videoAlt: string;
  product: string;
  price: string;
  thumb: string;
};

const VIDEOS: VideoCard[] = [
  {
    user: '@juan_mejoras',
    duration: '0:42',
    video: '/images/video-taladro.jpg',
    videoAlt: 'Video de @juan_mejoras usando un taladro inalámbrico en un proyecto de madera',
    product: 'Taladro Inalámbrico DeWalt',
    price: '$179.99',
    thumb: '/figma/53ac16c281bf6b6c41cd60b71a5973214f740e2f.png',
  },
  {
    user: '@maria_decoracion',
    duration: '1:05',
    video: '/images/video-navidad.jpg',
    videoAlt: 'Video de @maria_decoracion colocando esferas en el árbol de Navidad',
    product: 'Árbol Navideño Premium',
    price: '$149.99',
    thumb: '/figma/ab339d0d46f4cb265d299655e73315b3d273a581.png',
  },
  {
    user: '@carlos_hogar',
    duration: '0:58',
    video: '/images/video-sofa.jpg',
    videoAlt: 'Video de @carlos_hogar renovando su living con un sofá gris',
    product: 'Sofá Modular Premium',
    price: '$599.99',
    thumb: '/figma/3b7affc36fe253dc2fbae54f20b65e8358ad5069.png',
  },
  {
    user: '@ana_pintora',
    duration: '0:36',
    video: '/images/video-pintura.jpg',
    videoAlt: 'Video de @ana_pintora eligiendo rodillos de colores para pintar',
    product: 'Pintura Latex Interior',
    price: '$89.99',
    thumb: '/figma/81c1aea1fc9b28989e7085a38d463997f58e32ce.png',
  },
];

export default function FeaturedVideos() {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({
      left: direction * Math.round(track.clientWidth * 0.8),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section aria-labelledby="featured-videos-heading" className="w-full">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        {/* Header: título + flechas (las flechas solo cuando hay carrusel) */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="featured-videos-heading" className="text-[23px] font-bold leading-[30px] text-[#111827]">
              Videos destacados
            </h2>
            <p className="text-[13px] leading-5 text-[#6b7280]">
              Inspiración y tutoriales de nuestra comunidad
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex lg:hidden">
            <button
              type="button"
              aria-label="Ver videos anteriores"
              onClick={() => scrollByCards(-1)}
              className="flex size-11 items-center justify-center rounded-full border border-border-light bg-white shadow-card transition-colors duration-150 hover:bg-novey-blue-pale"
            >
              <img src={CHEVRON_ICON} alt="" className="size-5 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Ver más videos"
              onClick={() => scrollByCards(1)}
              className="flex size-11 items-center justify-center rounded-full border border-border-light bg-white shadow-card transition-colors duration-150 hover:bg-novey-blue-pale"
            >
              <img src={CHEVRON_ICON} alt="" className="size-5" />
            </button>
          </div>
        </div>

        {/* Carrusel en mobile/tablet, grilla de 4 en desktop */}
        <ul
          ref={trackRef}
          role="list"
          className="scroll-x mt-4 flex snap-x snap-mandatory list-none gap-4 p-0 lg:grid lg:grid-cols-4 lg:gap-6"
        >
          {VIDEOS.map((v) => (
            <li
              key={v.user}
              className="group w-[68vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-novey border border-border-light bg-white shadow-card transition-shadow duration-150 hover:shadow-card-hover lg:w-auto lg:max-w-none"
            >
              {/* Media del video */}
              <a
                href={ROUTES.videos}
                aria-label={`Reproducir video de ${v.user}: ${v.product}`}
                className="relative block aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={v.video}
                  alt={v.videoAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 1024px) 68vw, 280px"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25"
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-novey bg-black/55 px-2.5 py-1 text-[12px] font-semibold leading-[17px] text-white backdrop-blur-sm">
                  {v.user}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 rounded-novey bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
                >
                  {v.duration}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 flex size-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-[0px_8px_11px_0px_rgba(0,0,0,0.3)] transition-transform duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                >
                  <img src={PLAY_ICON} alt="" className="size-[24px]" />
                </span>
              </a>

              {/* Producto del video */}
              <a
                href={ROUTES.producto}
                className="flex items-center gap-3 p-3 transition-colors duration-150 hover:bg-novey-blue-pale"
              >
                <span className="relative block size-[48px] shrink-0 overflow-hidden rounded-novey bg-[#f3f4f6]">
                  <Image src={v.thumb} alt="" fill className="object-cover" sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold leading-4 text-[#111827]">
                    {v.product}
                  </span>
                  <span className="mt-0.5 block text-[15px] font-bold leading-[22px] text-novey-blue">
                    {v.price}
                  </span>
                </span>
                <img src={CHEVRON_ICON} alt="" className="size-4 shrink-0 opacity-60" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
