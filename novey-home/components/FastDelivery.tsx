'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductCard from './ProductCard';
import {
  fastDeliveryProducts,
  outletProducts,
  departments,
  fastDeliveryFilters,
} from '../data/products';
import { ROUTES } from '../lib/routes';

const ICON_CHEVRON_DOWN = '/figma/97f4e237bf72ad27242f0093963c0c224f4f3c76.svg';
const ICON_ARROW_BLUE = '/figma/c78b48387f18bbf60a4572b011f6291fd0556168.svg';
const ICON_ARROW_WHITE = '/figma/e77106d4be3c435c09e369d9cd786c1e6edc56b2.svg';
const IMG_OUTLET_BANNER = '/images/outlet-muebles.jpg';
const IMG_NAVIDAD_BANNER = '/images/navidad-banner.jpg';

// 06 — Section: Entrega Rápida (Figma 4338:73228)
// Incluye: header + chips, grilla de productos, Departamentos Novey,
// botón "Ver más departamentos", Outlet Muebles y banner de Navidad.
export default function FastDelivery() {
  const [activeFilter, setActiveFilter] = useState<string>(fastDeliveryFilters[0]);

  return (
    <section aria-labelledby="fast-delivery-title">
      <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 sm:px-6 lg:px-6">
        {/* Header + chips de filtro */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2
                id="fast-delivery-title"
                className="text-[20px] font-bold leading-[29px] text-[#1E1E1E]"
              >
                Entrega rápida
              </h2>
              <a
                href={ROUTES.ofertas}
                className="shrink-0 text-[16px] font-medium leading-[22px] text-novey-blue transition-colors duration-150 hover:text-novey-blue-dark"
              >
                Ver todo
              </a>
            </div>
            <p className="mt-2 text-[15px] leading-5 text-[#4A4A4A]">
              Productos disponibles para entrega hoy
            </p>
          </div>
          <div className="scroll-x -mx-4 flex gap-2 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" role="group" aria-label="Filtrar productos por categoría">
            {fastDeliveryFilters.map((filter) => {
              const active = filter === activeFilter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 whitespace-nowrap rounded-novey px-4 py-2 text-[14px] font-medium leading-[20px] transition-colors duration-150 ${
                    active
                      ? 'bg-novey-blue text-white'
                      : 'border border-[#D9D9D9] bg-white text-[#364153] hover:border-novey-blue hover:text-novey-blue'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grilla de productos de entrega rápida */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {fastDeliveryProducts.map((product) => (
            <li
              key={product.id}
              className="min-w-0"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {/* Departamentos Novey */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[20px] font-bold leading-[29px] text-[#101828]">
              Departamentos Novey
            </h3>
            <p className="mt-1.5 text-[15px] leading-5 text-[#6A7282]">
              Explorá todas nuestras categorías de productos
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {departments.map((department) => (
              <li key={department.id}>
                <a
                  href={ROUTES.departamentos}
                  className="flex flex-col overflow-hidden rounded-novey border border-border-light bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] transition-shadow duration-150 hover:shadow-card-hover"
                >
                  <div className="relative h-[130px] w-full lg:h-[139px]">
                    <Image
                      src={department.image}
                      alt={department.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 186px, 50vw"
                    />
                  </div>
                  <span className="flex h-[52px] items-center justify-center px-2 text-center text-[17px] font-medium leading-[25px] text-[#1A1A1A]">
                    {department.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón Ver más departamentos */}
        <div className="flex justify-center">
          <a
            href={ROUTES.departamentos}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-novey px-6 py-2.5 text-[17px] font-medium leading-[28px] text-novey-blue transition-colors duration-150 hover:bg-novey-blue-bg"
          >
            Ver más departamentos
            <img alt="" src={ICON_CHEVRON_DOWN} className="h-[23px] w-[23px]" />
          </a>
        </div>

        {/* Outlet Muebles */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[20px] font-bold leading-[31px] text-[#101828]">
                Outlet Muebles
              </h3>
              <a
                href={ROUTES.ofertas}
                className="shrink-0 text-[16px] font-medium leading-[22px] text-novey-blue transition-colors duration-150 hover:text-novey-blue-dark"
              >
                Ver todo
              </a>
            </div>
            <p className="mt-2 text-[15px] leading-5 text-[#6A7282]">
              Renueva tu hogar con hasta 50% OFF
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-4 lg:gap-6">
            {/* Banner de colección Outlet */}
            <a
              href={ROUTES.ofertas}
              className="relative block min-h-[320px] overflow-hidden rounded-novey lg:min-h-0 lg:h-auto"
              aria-label="Outlet Muebles: ver colección"
            >
              <Image
                src={IMG_OUTLET_BANNER}
                alt="Living moderno con sofá seccional y mesa de centro"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 295px, 100vw"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
              <span className="absolute left-5 top-5 flex flex-col items-start">
                <span className="rounded-novey bg-novey-blue px-2.5 py-1 text-[20px] font-extrabold italic leading-none text-white">
                  OUTLET
                </span>
                <span className="mt-1 rounded-novey bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-novey-navy">
                  Muebles
                </span>
              </span>
              <span className="absolute bottom-14 left-1/2 flex h-9 w-[175px] -translate-x-1/2 items-center justify-center gap-2 rounded-novey bg-white text-[12px] font-semibold leading-[17px] text-novey-blue transition-colors duration-150 hover:bg-novey-blue-pale">
                Ver colección
                <img alt="" src={ICON_ARROW_BLUE} className="h-[13px] w-[13px]" />
              </span>
            </a>
            {/* Cards de productos Outlet: carrusel en mobile, columnas en desktop */}
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-3 lg:grid-cols-3 lg:gap-6">
              {outletProducts.map((product, i) => (
                <li
                  key={product.id}
                  className={i === 3 ? 'min-w-0 lg:hidden' : 'min-w-0'}
                >
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Banner Navidad */}
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-novey px-6 py-16 shadow-[0px_7px_19px_-6px_rgba(58,77,233,0.15)] sm:px-16">
          <Image
            src={IMG_NAVIDAD_BANNER}
            alt="Árbol de Navidad decorado con regalos junto a la ventana"
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 1212px, 100vw"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-novey-navy/80 via-black/45 to-novey-navy/60" />
          <div className="relative flex w-full max-w-[566px] flex-col items-center gap-4 text-center">
            <h3 className="text-[26px] font-bold leading-[32px] text-white sm:text-[33px] sm:leading-[40px]">
              Celebrá la Navidad con nosotros
            </h3>
            <p className="text-[13px] leading-5 text-white">
              Descubrí regalos, ofertas y decoración para tu hogar.
            </p>
            <a
              href={ROUTES.navidad}
              className="flex h-10 items-center justify-center gap-2 rounded-novey bg-novey-blue px-6 text-[13px] font-semibold leading-5 text-white shadow-[0px_2px_3px_rgba(0,0,0,0.2)] transition-colors duration-150 hover:bg-novey-blue-dark"
            >
              Ver todo
              <img alt="" src={ICON_ARROW_WHITE} className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
