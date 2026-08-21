'use client';

import { useEffect, useState } from 'react';
import NoveyLogo from '../NoveyLogo';
import { readSession } from '../../lib/session';
import { CartIcon, Heart } from '../icons';

/** Unidades del carrito compartido, para que el header no quede mudo acá. */
function useCartCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const leer = () => {
      try {
        const raw = window.localStorage.getItem('novey-cart');
        const items = raw ? JSON.parse(raw).items : [];
        setCount(Array.isArray(items) ? items.reduce((n: number, it: { qty?: number }) => n + (Number(it.qty) || 0), 0) : 0);
      } catch {
        setCount(0);
      }
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

// Selector global de marcas: desde cualquier ruta (incluido el checkout),
// Novey/Cochez/Kohler llevan SIEMPRE a su landing principal.
const BRAND_SITES = [
  { label: 'Novey', url: 'https://prototiponovey.vercel.app/', current: true },
  { label: 'Cochez', url: 'https://cochez-web-mauve.vercel.app/' },
  { label: 'Kohler by Cochez', url: 'https://kohler-panama.vercel.app/' },
  { label: 'Punto Cochez', url: undefined },
  { label: 'CMF', url: undefined, italic: true },
];

export function Header() {
  const cartCount = useCartCount();
  const [nombre, setNombre] = useState('');
  useEffect(() => {
    const s = readSession();
    setNombre(s?.name ? s.name.split(' ')[0] : '');
  }, []);
  return (
    <header className="w-full bg-white border-b border-border-light">
      <nav
        aria-label="Sitios del grupo"
        className="border-b border-border-light overflow-x-auto"
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-9 flex items-center gap-2 whitespace-nowrap text-[13px]">
          {BRAND_SITES.map((b, i) => (
            <span key={b.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="font-extrabold text-border-light">|</span>}
              {b.url ? (
                <a
                  href={b.url}
                  className={
                    b.current
                      ? 'font-extrabold italic text-novey-blue hover:underline'
                      : 'text-text-tertiary hover:text-novey-blue transition-colors'
                  }
                >
                  {b.label}
                </a>
              ) : (
                <span className={`text-text-tertiary ${b.italic ? 'italic font-medium' : ''}`}>{b.label}</span>
              )}
            </span>
          ))}
        </div>
      </nav>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-16 flex items-center gap-4">
        <a href="/" aria-label="Novey — inicio">
          <NoveyLogo className="h-9 w-auto md:h-[50px]" />
        </a>
        <div className="ml-auto flex items-center gap-4">
          {nombre && <span className="hidden text-[13px] text-text-secondary sm:block">Hola, {nombre}</span>}
          <a
            href="/favoritos"
            className="flex min-h-11 items-center gap-1.5 px-1 text-[13px] text-text-secondary transition-colors hover:text-novey-blue"
          >
            <Heart width={20} height={20} />
            <span className="hidden sm:block">Favoritos</span>
          </a>
          <a
            href="/carrito"
            className="flex min-h-11 items-center gap-1.5 px-1 text-[13px] text-text-secondary transition-colors hover:text-novey-blue"
          >
            <span className="relative">
              <CartIcon width={20} height={20} />
              {cartCount !== null && cartCount > 0 && (
                <span
                  aria-label={`${cartCount} ${cartCount === 1 ? 'producto' : 'productos'} en el carrito`}
                  className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-novey-red px-1 text-[11px] font-medium italic text-white"
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:block">Carrito</span>
          </a>
        </div>
      </div>
    </header>
  );
}
