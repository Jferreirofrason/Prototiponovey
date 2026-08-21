'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NoveyLogo from './NoveyLogo';
import SearchBox from './SearchBox';
import MobileMenu from './MobileMenu';
import DepartmentsMenu from './DepartmentsMenu';
import { ROUTES } from '../lib/routes';
import { BRAND_SITES } from '../lib/brands';
import { countUnits, readCart } from '../lib/cart';
import { FAV_CHANGE_EVENT, readFavorites } from '../lib/favorites';
import { SESSION_CHANGE_EVENT, readSession } from '../lib/session';
import { CART_ICON_ATTR } from './AddToCartButton';
import CartDrawer, { CART_OPEN_EVENT } from './CartDrawer';

/**
 * Unidades reales del carrito. Arranca en null para que el servidor y el
 * cliente rendericen lo mismo; el número aparece después de montar.
 */
function useCartCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const leer = () => {
      const items = readCart();
      setCount(items ? countUnits(items) : 0);
    };
    leer();
    window.addEventListener('novey-cart-change', leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener('novey-cart-change', leer);
      window.removeEventListener('storage', leer);
    };
  }, []);
  return count;
}



/** Favoritos guardados. Mismo patrón que el contador del carrito. */
function useFavCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const leer = () => setCount(readFavorites().length);
    leer();
    window.addEventListener(FAV_CHANGE_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(FAV_CHANGE_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, []);
  return count;
}

/** Nombre de pila de la sesión, para no ofrecer "Iniciar sesión" ya logueada. */
function useNombreSesion() {
  const [nombre, setNombre] = useState<string | null>(null);
  useEffect(() => {
    const leer = () => {
      const s = readSession();
      setNombre(s?.name ? s.name.split(' ')[0] : null);
    };
    leer();
    window.addEventListener(SESSION_CHANGE_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(SESSION_CHANGE_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, []);
  return nombre;
}

const CATEGORY_PILLS = [
  { label: 'Ofertas', href: ROUTES.ofertas },
  { label: 'Tarjeta de regalo', href: ROUTES.tarjetaRegalo },
  { label: '🎄 Navidad', href: ROUTES.navidad },
  { label: 'Noveydades', href: ROUTES.novedades },
  { label: 'Catálogos', href: ROUTES.catalogos },
  { label: 'Rastrear mi orden', href: ROUTES.rastrearOrden },
];

function MapPinIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const favCount = useFavCount();
  const nombreSesion = useNombreSesion();
  const [cartOpen, setCartOpen] = useState(false);
  const cerrarCarrito = useCallback(() => setCartOpen(false), []);

  // Agregar un producto desde el buscador abre el mini carrito.
  useEffect(() => {
    const abrir = () => setCartOpen(true);
    window.addEventListener(CART_OPEN_EVENT, abrir);
    return () => window.removeEventListener(CART_OPEN_EVENT, abrir);
  }, []);

  return (
    <header className="relative z-50 bg-white">
      {/* Franja de envío gratis */}
      <div className="flex h-8 items-center justify-center gap-3 border-b border-border-light bg-novey-blue-light px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/truck.svg" alt="" className="h-[22px] w-[22px] shrink-0" />
        <p className="truncate text-[13px] leading-tight text-novey-blue">
          Envío gratis en pedidos mayores a $50
        </p>
      </div>

      {/* Links de marcas hermanas + Empresas (solo desktop) */}
      <div className="hidden h-[46px] items-center justify-between border-b border-border-soft bg-white px-6 lg:flex">
        <nav aria-label="Sitios del grupo" className="flex items-center gap-2 text-[13px]">
          {BRAND_SITES.map((b, i) => (
            <span key={b.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="font-extrabold text-border-soft">|</span>}
              <a
                href={b.url}
                className={
                  b.current
                    ? 'font-extrabold italic text-novey-blue hover:underline'
                    : `text-text-tertiary transition-colors duration-150 hover:text-novey-blue ${b.italic ? 'italic font-medium text-[14px]' : ''}`
                }
              >
                {b.label}
              </a>
            </span>
          ))}
        </nav>
        <a
          href={ROUTES.empresas}
          className="flex h-[31px] items-center gap-2 rounded-novey bg-novey-blue px-4 text-[14px] text-white transition-colors duration-150 hover:bg-novey-blue-dark"
        >
          Empresas
          <ChevronDownIcon className="h-[11px] w-[11px]" />
        </a>
      </div>

      {/* Logo + buscador + tienda + acciones */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 md:gap-6 md:px-6 lg:h-[98px] lg:py-0">
        {/* Hamburguesa mobile */}
        <button
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-novey text-text-ink transition-colors hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>

        <Link href={ROUTES.home} aria-label="Novey — inicio" className="shrink-0">
          <NoveyLogo className="h-9 w-auto md:h-[50px]" />
        </Link>

        {/* Buscador (desktop) con resultados sugeridos */}
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBox id="search-desktop" />
        </div>

        {/* Selector de tienda (desktop) */}
        <button
          type="button"
          className="hidden h-[50px] shrink-0 items-center gap-2 rounded-novey border border-border-light bg-[#f9fafb] px-5 transition-colors duration-150 hover:border-border-medium lg:flex"
        >
          <MapPinIcon className="h-4 w-4 text-text-ink" />
          <span className="text-[15px] text-text-ink">Coronado</span>
          <ChevronDownIcon className="h-4 w-4 text-text-ink" />
        </button>

        {/* Acciones */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-5 lg:ml-0">
          <a
            href={ROUTES.favoritos}
            className="hidden min-h-11 flex-col items-center justify-center gap-1 px-1 text-text-ink transition-colors duration-150 hover:text-novey-blue lg:flex"
          >
            <span className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/heart.svg" alt="" className="h-6 w-6" />
              {favCount !== null && favCount > 0 && (
                <span
                  aria-label={`${favCount} ${favCount === 1 ? 'producto' : 'productos'} en favoritos`}
                  className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-novey-red px-1 text-[11px] font-medium italic text-white"
                >
                  {favCount}
                </span>
              )}
            </span>
            <span className="text-[13px] leading-none">Favoritos</span>
          </a>
          <a
            href={ROUTES.login}
            className="hidden min-h-11 flex-col items-center justify-center gap-1 px-1 text-text-ink transition-colors duration-150 hover:text-novey-blue lg:flex"
          >
            <UserIcon className="h-6 w-6" />
            <span className="max-w-[92px] truncate text-[13px] leading-none">
              {nombreSesion ? `Hola, ${nombreSesion}` : 'Iniciar sesión'}
            </span>
          </a>
          {/* Abre el mini carrito; la página completa vive en ROUTES.carrito */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={cartOpen}
            className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 text-text-ink transition-colors duration-150 hover:text-novey-blue"
          >
            <span className="relative" {...{ [CART_ICON_ATTR]: '' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/cart.svg" alt="" className="h-6 w-6" />
              {cartCount !== null && cartCount > 0 && (
                <span
                  aria-label={`${cartCount} ${cartCount === 1 ? 'producto' : 'productos'} en el carrito`}
                  className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-novey-red px-1 text-[11px] font-medium italic text-white"
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden text-[13px] leading-none md:block">Carrito</span>
          </button>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={cerrarCarrito} />

      {/* Buscador mobile con resultados sugeridos */}
      <div className="border-b border-border-light bg-white px-4 pb-3 md:hidden">
        <SearchBox id="search-mobile" compact />
      </div>

      {/* Pills de navegación por categorías */}
      <nav aria-label="Categorías destacadas" className="bg-novey-blue-pale">
        <div className="scroll-x flex h-[55px] items-center gap-3 px-4 md:px-6">
          <DepartmentsMenu />
          {CATEGORY_PILLS.map((pill) => (
            <a
              key={pill.label}
              href={pill.href}
              className="flex h-[33px] shrink-0 items-center whitespace-nowrap rounded-novey bg-white px-3 text-[12px] text-novey-navy transition-colors duration-150 hover:bg-novey-blue hover:text-white"
            >
              {pill.label}
            </a>
          ))}
          <button
            type="button"
            className="flex h-[33px] shrink-0 items-center gap-2 whitespace-nowrap rounded-novey bg-white px-3 text-[12px] text-novey-navy transition-colors duration-150 hover:bg-novey-blue hover:text-white"
          >
            Más
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        </div>
      </nav>

      {/* Menú mobile (Figma "Mobile Menu Design" 5806:21371) */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
