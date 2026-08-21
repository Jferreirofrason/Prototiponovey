'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartItem, readCart, writeCart } from '../lib/cart';
import { CART_OPEN_EVENT } from './CartDrawer';

// Buscador con resultados sugeridos — Figma 5806:23781 ("Resultados sugeridos"):
// término tipeado resaltado en amarillo, precio (oferta roja + tachado), botón
// Agregar y "Ver todos los resultados →".

interface Suggestion {
  id: string;
  pdpId: number;
  /** Prefijo que matchea la búsqueda (ej. "Lavadora") + resto del nombre */
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    pdpId: 3,
    name: 'Lavadora Automática 15kg Carga Frontal con Tecnología Inverter',
    price: '$499.99',
    oldPrice: '$549.99',
    image: '/images/search-lavadora-1.jpg',
  },
  {
    id: 's2',
    pdpId: 8,
    name: 'Lavadora Digital 18kg con 12 Programas de Lavado y Secado Rápido',
    price: '$649.99',
    image: '/images/search-lavadora-2.jpg',
  },
  {
    id: 's3',
    pdpId: 12,
    name: 'Lavadora Inteligente 20kg con Control por App y Eficiencia Energética A+++',
    price: '$699.99',
    oldPrice: '$799.99',
    image: '/images/search-lavadora-3.jpg',
  },
];

/**
 * Términos que llevan al listado. El PLP del prototipo es "Lavadoras y
 * Secadoras", así que sólo esos términos navegan solos; el resto sigue
 * mostrando sugerencias y navega con Enter.
 */
const TERMINOS_PLP = ['lavadora', 'lavadoras', 'secadora', 'secadoras', 'lavarropas'];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function Highlight({ text, query }: { text: string; query: string }) {
  const idx = normalize(text).indexOf(normalize(query));
  if (idx < 0 || !query) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[3px] bg-[#FDE68A] px-0.5 text-inherit">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function pdpHref(s: Suggestion) {
  const q = new URLSearchParams({
    nombre: s.name,
    marca: 'NOVEY',
    precio: s.price,
    img: s.image,
    ...(s.oldPrice ? { oldprecio: s.oldPrice } : {}),
  });
  return `/productos/producto/${s.pdpId}?${q.toString()}`;
}

function addToCart(s: Suggestion) {
  const parse = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
  const nuevo: CartItem = {
    id: s.id,
    name: s.name,
    brand: 'NOVEY',
    sku: 'NV-SEARCH',
    price: parse(s.price),
    oldPrice: s.oldPrice ? parse(s.oldPrice) : undefined,
    qty: 1,
    image: s.image,
  };
  // Suma al carrito en vez de reemplazarlo: si el producto ya estaba, sube la
  // cantidad. Después se muestra el carrito para que se vea qué quedó adentro.
  const actual = readCart() ?? [];
  const existente = actual.find((it) => it.id === nuevo.id);
  writeCart(
    existente
      ? actual.map((it) => (it.id === nuevo.id ? { ...it, qty: it.qty + 1 } : it))
      : [...actual, nuevo],
  );
  // Se abre el mini carrito en vez de sacar al usuario de la página.
  window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
}

function plpHref(termino: string) {
  return `/productos?q=${encodeURIComponent(termino.trim())}`;
}

export default function SearchBox({ id, compact = false }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const results = q.length >= 3 ? SUGGESTIONS.filter((s) => normalize(s.name).includes(normalize(q))) : [];
  const showPanel = open && results.length > 0;

  // Al tipear un término del listado, se va solo al PLP. El retraso deja
  // terminar de escribir y evita saltar en "lav" o "lava".
  useEffect(() => {
    if (!TERMINOS_PLP.includes(normalize(q))) return;
    const t = window.setTimeout(() => {
      setOpen(false);
      router.push(plpHref(q));
    }, 700);
    return () => window.clearTimeout(t);
  }, [q, router]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Buscar productos, marcas y más
      </label>
      <div
        className={`flex items-center gap-3 rounded-novey border border-border-light bg-white px-4 focus-within:border-novey-blue ${
          compact ? 'h-11' : 'h-[50px]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/search.svg" alt="" className="h-5 w-5 shrink-0" />
        <input
          id={id}
          type="search"
          placeholder="Buscar productos, marcas y más..."
          value={query}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${id}-results`}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setOpen(false);
              router.push(plpHref(query));
            }
          }}
          className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-text-ink placeholder:text-[#1e1e1e]/80 focus:outline-none"
        />
      </div>

      {showPanel && (
        <div
          id={`${id}-results`}
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-novey border border-border-light bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
        >
          <p className="border-b border-border-light px-4 py-3 text-[13px] font-semibold text-text-primary">
            Resultados sugeridos
          </p>
          <ul>
            {results.map((s) => (
              <li key={s.id} className="border-b border-border-light last:border-b-0">
                <div className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[#fafbfc]">
                  <a href={pdpHref(s)} className="block shrink-0" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt=""
                      className="h-16 w-16 rounded-novey border border-border-light object-cover"
                    />
                  </a>
                  <div className="min-w-0 flex-1">
                    <a
                      href={pdpHref(s)}
                      className="block text-[14px] leading-5 text-text-primary hover:text-novey-blue"
                    >
                      <Highlight text={s.name} query={q} />
                    </a>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span
                        className={`text-[15px] font-bold leading-5 ${
                          s.oldPrice ? 'text-novey-red' : 'text-text-primary'
                        }`}
                      >
                        {s.price}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(s)}
                      className="mt-2 flex h-8 items-center gap-1.5 rounded-novey border border-novey-blue px-3 text-[12px] font-medium text-novey-blue transition-colors duration-150 hover:bg-novey-blue hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 3h2l2 13h13l2-9H6" />
                        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                        <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                      </svg>
                      Agregar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <a
            href={plpHref(query)}
            className="flex items-center justify-center gap-1.5 border-t border-border-light px-4 py-3 text-[13px] font-medium text-novey-blue transition-colors duration-150 hover:bg-novey-blue-pale"
          >
            Ver todos los resultados
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
