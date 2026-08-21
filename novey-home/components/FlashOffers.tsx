'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import FavoriteButton from './FavoriteButton';

// 08 — Flash Offers (Component 3/Navidad) — bloque temático navideño
const IMG = {
  decor: '/figma/7e717984a7747489aba7f6542db4ca1fb4ae6fa6.png',
  cmfLogo: '/figma/cmf-logo.svg',
  favorito: '/figma/ee4e8b6098f19d45be72f15f8ae49529106303e9.svg',
  compartir: '/figma/77f2509fb36a8dfb250dd8b82e154e2cedc2a34c.svg',
};

const OFFERS = [
  {
    id: 'flash-1',
    pdpId: 17,
    brand: 'PHILIPS',
    name: 'Licuadora reversible 700W jarra de vidrio',
    price: '$49.99',
    oldPrice: '$79.99',
    image: '/images/f-licuadora.jpg',
  },
  {
    id: 'flash-2',
    pdpId: 18,
    brand: 'IROBOT',
    name: 'Aspiradora robot Roomba con base de carga',
    price: '$199.99',
    oldPrice: '$299.99',
    image: '/images/f-robot.jpg',
  },
  {
    id: 'flash-3',
    pdpId: 1,
    brand: 'T-FAL',
    name: 'Batería de cocina 12 piezas antiadherente roja',
    price: '$89.99',
    oldPrice: '$149.99',
    image: '/images/f-ollas.jpg',
  },
  {
    id: 'flash-4',
    pdpId: 2,
    brand: 'STANLEY',
    name: 'Juego de herramientas 108 piezas con maletín',
    price: '$59.99',
    oldPrice: '$99.99',
    image: '/images/f-herramientas.jpg',
  },
].map((o) => ({
  ...o,
  priceLabel: 'Precio oferta',
  store: 'Brisas del Golf',
  stock: '|quedan 3 unidades',
}));

// Offset inicial igual al diseño: 03 días, 12 horas, 45 min, 10 seg
const INITIAL_OFFSET_S = 3 * 86400 + 12 * 3600 + 45 * 60 + 10;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function useCountdown() {
  const [remaining, setRemaining] = useState(INITIAL_OFFSET_S);

  useEffect(() => {
    // Fecha futura fija: se calcula una vez al montar (+3d 12h 45m 10s)
    const target = Date.now() + INITIAL_OFFSET_S * 1000;
    const tick = () =>
      setRemaining(Math.max(0, Math.round((target - Date.now()) / 1000)));
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return {
    days: pad2(Math.floor(remaining / 86400)),
    hours: pad2(Math.floor((remaining % 86400) / 3600)),
    minutes: pad2(Math.floor((remaining % 3600) / 60)),
    seconds: pad2(remaining % 60),
  };
}

function CmfLogo() {
  return <img alt="CMF" src={IMG.cmfLogo} className="h-3 w-[21px] shrink-0" />;
}

function FlashOfferCard({ offer }: { offer: (typeof OFFERS)[number] }) {
  const pdpQuery = new URLSearchParams({
    nombre: offer.name,
    marca: offer.brand,
    precio: offer.price,
    img: offer.image,
    oldprecio: offer.oldPrice,
  });
  const pdpHref = `/productos/producto/${offer.pdpId}?${pdpQuery.toString()}`;
  return (
    <article className="flex h-full w-full min-w-0 flex-col rounded-novey md:w-[264px] md:shrink-0 md:snap-start border border-border-light bg-white shadow-card transition-shadow duration-150 hover:shadow-card-hover">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-novey md:aspect-auto md:h-[264px]">
        <Link href={pdpHref} aria-label={`Ver detalle de ${offer.name}`} className="absolute inset-0 z-0">
          <Image
            src={offer.image}
            alt={offer.name}
            fill
            className="object-cover"
            sizes="264px"
          />
        </Link>
        <span className="absolute left-3 top-3 flex min-h-[23px] max-w-[calc(100%-56px)] flex-wrap items-center gap-1 rounded-novey bg-feedback-success-bg px-2 py-1">
          <span className="text-[11px] font-bold leading-none text-feedback-success-dark">
            OFERTA EXCLUSIVA
          </span>
          <CmfLogo />
        </span>
        <FavoriteButton
          productId={offer.id}
          productName={offer.name}
          productImage={offer.image}
          className="absolute right-3 top-3 size-8"
        />
        <button
          type="button"
          aria-label={`Compartir ${offer.name}`}
          className="absolute right-3 top-[52px] flex size-8 items-center justify-center rounded-full bg-white shadow-card transition-colors duration-150 hover:bg-gray-100"
        >
          <img alt="" src={IMG.compartir} className="size-[18px]" />
        </button>
      </div>
      <div className="flex w-full flex-1 flex-col p-3 md:p-4">
        <div className="flex w-full flex-1 flex-col gap-3 pb-6">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold leading-4 text-text-tertiary">
              {offer.brand}
            </p>
            <h3 className="text-sm font-medium leading-5 text-text-primary">
              <Link href={pdpHref} className="transition-colors duration-150 hover:text-novey-blue">
                {offer.name}
              </Link>
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[20px] font-bold leading-7 text-novey-red">
              {offer.price}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-sm leading-5 text-text-disabled">
                {offer.oldPrice}
              </span>
              <span className="text-[11px] leading-5 text-text-tertiary">
                {offer.priceLabel}
              </span>
            </p>
          </div>
          <p className="mt-auto flex items-center gap-1.5 text-xs font-medium leading-4">
            <span
              aria-hidden="true"
              className="size-1 shrink-0 rounded-full bg-feedback-success-dark"
            />
            <span className="text-novey-blue-dark">{offer.store}</span>{' '}
            <span className="text-[#4B5563]">{offer.stock}</span>
          </p>
        </div>
        <Link
          href={pdpHref}
          className="block w-full rounded-novey bg-novey-blue px-2 py-3 text-center text-[14px] leading-5 text-white md:px-6 md:py-3.5 md:text-base md:leading-6 transition-colors duration-150 hover:bg-novey-blue-dark active:bg-novey-navy"
        >
          Agregar al carrito
        </Link>
      </div>
    </article>
  );
}

const COUNTDOWN_UNITS = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
] as const;

export default function FlashOffers() {
  const countdown = useCountdown();
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 552, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="flash-offers-title" className="w-full">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        <div className="overflow-hidden">
          {/* Arte navideño: yeti, nieve y techo rojo festoneado */}
          <div className="h-[110px] w-full overflow-hidden sm:h-auto">
            <Image
              src={IMG.decor}
              alt=""
              width={1268}
              height={238}
              className="h-full w-full object-cover object-bottom sm:h-auto"
              sizes="(min-width: 1276px) 1212px, 100vw"
            />
          </div>
          {/* Bloque rojo festivo */}
          <div className="-mt-px bg-[#9F0609] px-4 pb-10 pt-1 sm:px-8 sm:pb-[60px] lg:px-11">
            <div className="flex flex-col items-center gap-[18px]">
              <h2
                id="flash-offers-title"
                className="text-center text-[22px] font-bold leading-[29px] text-[#FFF9F2] sm:text-[24px]"
                style={{ textShadow: '0px 2px 7px rgba(0, 0, 0, 0.3)' }}
              >
                Ofertas Flash Navideñas
              </h2>
              <p className="text-center text-xs leading-[18px] text-[#FFF9F2] opacity-95">
                Aprovechá antes de que se acaben — Descuentos válidos por tiempo
                limitado
              </p>
              <div
                aria-live="off"
                className="flex w-full max-w-[462px] items-center justify-center gap-2 sm:gap-[14px]"
              >
                {COUNTDOWN_UNITS.map((unit) => (
                  <div
                    key={unit.key}
                    className="flex h-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-novey bg-white shadow-[0px_3.5px_5px_0px_rgba(0,0,0,0.15)] sm:h-[69px] sm:w-[105px] sm:flex-none"
                  >
                    <span className="text-[20px] font-bold leading-none text-novey-blue">
                      {countdown[unit.key]}
                    </span>
                    <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.43px] text-[#6B7280]">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mt-8">
              <ul
                ref={trackRef}
                className="grid grid-cols-2 gap-3 md:flex md:snap-x md:snap-mandatory md:overflow-x-auto md:gap-3 scroll-x xl:justify-center"
              >
                {OFFERS.map((offer) => (
                  <li key={offer.id} className="flex shrink-0 snap-start">
                    <FlashOfferCard offer={offer} />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="Ver ofertas anteriores"
                onClick={() => scrollByCards(-1)}
                className="absolute -left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors duration-150 hover:bg-gray-100 md:flex lg:-left-6"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 text-novey-blue"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Ver más ofertas"
                onClick={() => scrollByCards(1)}
                className="absolute -right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors duration-150 hover:bg-gray-100 md:flex lg:-right-6"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 text-novey-blue"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
