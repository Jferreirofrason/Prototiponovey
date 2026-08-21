'use client';

// Mis favoritos. Lista única: el proyecto no tiene listas múltiples, así que no
// se pintan pestañas ni "mover/copiar a otra lista" que no harían nada real.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FavoriteButton from '../../components/FavoriteButton';
import AddToCartButton, { addItemsToCart, flyToCart } from '../../components/AddToCartButton';
import { showToast } from '../../components/ToastHost';
import { ROUTES } from '../../lib/routes';
import {
  FAV_CHANGE_EVENT,
  LISTA_UNICA,
  addFavorites,
  readFavorites,
  removeFavorites,
} from '../../lib/favorites';
import { ALL_PRODUCTS, type Product } from '../../data/products';
import type { CartItem } from '../../lib/cart';

const parsePrice = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) || 0;

/** El catálogo no tiene estado agotado hoy; el soporte queda listo por si lo suma. */
const estaAgotado = (p: Product) => p.availability === 'out-of-stock';

const aCartItem = (p: Product): CartItem => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: parsePrice(p.price),
  oldPrice: p.oldPrice ? parsePrice(p.oldPrice) : undefined,
  qty: 1,
  image: p.image,
});

export default function FavoritosPage() {
  const [ids, setIds] = useState<string[] | null>(null); // null = todavía no leyó
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(() => {
    const leer = () => setIds(readFavorites());
    leer();
    window.addEventListener(FAV_CHANGE_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(FAV_CHANGE_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, []);

  // Los datos salen del catálogo real; el storage sólo guarda ids.
  const productos = useMemo(
    () => (ids === null ? [] : ids.map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p)),
    [ids],
  );

  // Si un favorito se quita, deja de estar seleccionado.
  useEffect(() => {
    setSel((prev) => {
      const vivos = new Set(productos.map((p) => p.id));
      const next = new Set([...prev].filter((id) => vivos.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [productos]);

  const alternarSel = useCallback((id: string) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const todosSeleccionados = productos.length > 0 && sel.size === productos.length;
  const seleccionados = productos.filter((p) => sel.has(p.id));

  const agregarSeleccionados = () => {
    const disponibles = seleccionados.filter((p) => !estaAgotado(p));
    const agotados = seleccionados.length - disponibles.length;
    if (disponibles.length === 0) {
      showToast({ kind: 'carrito', message: 'Ninguno de los productos seleccionados está disponible' });
      return;
    }
    addItemsToCart(disponibles.map(aCartItem));
    flyToCart(document.querySelector<HTMLElement>('[data-fav-grid] img'), disponibles[0].image);
    showToast({
      kind: 'carrito',
      message:
        agotados > 0
          ? `${disponibles.length} agregados. ${agotados} sin stock no se agregaron.`
          : `${disponibles.length} ${disponibles.length === 1 ? 'producto agregado' : 'productos agregados'} al carrito`,
      action: { label: 'Ver carrito', href: ROUTES.carrito },
    });
    setSel(new Set());
  };

  const eliminarSeleccionados = () => {
    const cuantos = sel.size;
    if (cuantos === 0) return;
    const ok = window.confirm(
      `¿Eliminar ${cuantos} ${cuantos === 1 ? 'producto' : 'productos'} de tus favoritos?`,
    );
    if (!ok) return;
    const eliminados = [...sel];
    removeFavorites(eliminados);
    setSel(new Set());
    showToast({
      kind: 'favorito',
      message: `${cuantos} ${cuantos === 1 ? 'producto eliminado' : 'productos eliminados'} de tus favoritos`,
      // Se reponen sobre lo que haya en ese momento, sin pisar cambios nuevos.
      action: { label: 'Deshacer', onClick: () => addFavorites(eliminados) },
    });
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1276px] px-4 pb-12 pt-6 sm:px-6 lg:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-8 text-gray-900">Mis favoritos</h1>
            <p className="mt-2 max-w-[560px] text-sm leading-[21px] text-gray-500">
              Guarda los productos que te gustan y encuéntralos fácilmente cuando quieras.
            </p>
          </div>
          {ids !== null && productos.length > 0 && (
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{LISTA_UNICA}</span> ·{' '}
              {productos.length} {productos.length === 1 ? 'producto guardado' : 'productos guardados'}
            </p>
          )}
        </header>

        {ids === null ? (
          <SkeletonGrid />
        ) : productos.length === 0 ? (
          <EstadoVacio />
        ) : (
          <>
            <BarraSeleccion
              total={productos.length}
              seleccion={sel.size}
              todos={todosSeleccionados}
              onTodos={() => setSel(todosSeleccionados ? new Set() : new Set(productos.map((p) => p.id)))}
              onAgregar={agregarSeleccionados}
              onEliminar={eliminarSeleccionados}
            />

            <ul
              data-fav-grid
              className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {productos.map((p) => (
                <CardFavorito
                  key={p.id}
                  product={p}
                  seleccionado={sel.has(p.id)}
                  onSeleccionar={() => alternarSel(p.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------- acciones masivas */
function BarraSeleccion({
  total,
  seleccion,
  todos,
  onTodos,
  onAgregar,
  onEliminar,
}: {
  total: number;
  seleccion: number;
  todos: boolean;
  onTodos: () => void;
  onAgregar: () => void;
  onEliminar: () => void;
}) {
  const hay = seleccion > 0;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-novey border border-border-light bg-white px-4 py-3">
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={todos}
          onChange={onTodos}
          className="h-[18px] w-[18px] cursor-pointer accent-novey-blue"
        />
        <span className="text-sm font-medium">Seleccionar todos ({total})</span>
      </label>

      <span aria-live="polite" className="text-sm text-text-secondary">
        {hay ? `${seleccion} ${seleccion === 1 ? 'seleccionado' : 'seleccionados'}` : 'Ninguno seleccionado'}
      </span>

      {/* Deshabilitadas hasta que haya selección */}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAgregar}
          disabled={!hay}
          className="inline-flex min-h-11 items-center justify-center rounded-novey bg-novey-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-disabled"
        >
          Agregar seleccionados al carrito
        </button>
        <button
          type="button"
          onClick={onEliminar}
          disabled={!hay}
          className="inline-flex min-h-11 items-center justify-center rounded-novey border border-border-medium px-4 text-sm font-semibold text-feedback-error-dark transition-colors hover:border-feedback-error-dark disabled:cursor-not-allowed disabled:border-border-light disabled:text-text-disabled"
        >
          Eliminar de favoritos
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- la card */
function CardFavorito({
  product,
  seleccionado,
  onSeleccionar,
}: {
  product: Product;
  seleccionado: boolean;
  onSeleccionar: () => void;
}) {
  const agotado = estaAgotado(product);
  const href = product.pdpId ? `/productos/producto/${product.pdpId}` : ROUTES.producto;

  return (
    <li
      className={`group flex flex-col overflow-hidden rounded-novey border bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-novey-blue/40 hover:shadow-[0_12px_24px_-8px_rgba(0,85,184,0.22)] ${
        seleccionado ? 'border-novey-blue' : 'border-border-light'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        <label className="absolute left-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] sm:h-8 sm:w-8">
          <input
            type="checkbox"
            checked={seleccionado}
            onChange={onSeleccionar}
            aria-label={`Seleccionar ${product.name}`}
            className="h-[18px] w-[18px] cursor-pointer accent-novey-blue"
          />
        </label>

        <FavoriteButton
          productId={product.id}
          productName={product.name}
          productImage={product.image}
          className="absolute right-3 top-3 h-11 w-11 sm:h-8 sm:w-8"
        />

        {agotado && (
          <span className="absolute bottom-3 left-3 rounded-novey bg-text-primary px-2 py-1 text-[11px] font-bold text-white">
            Producto agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-bold uppercase leading-4 text-text-tertiary">{product.brand}</p>
        <h2 className="text-sm font-medium leading-5 text-text-primary">
          <Link href={href} className="transition-colors duration-150 hover:text-novey-blue">
            {product.name}
          </Link>
        </h2>

        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-lg font-bold text-text-primary">{product.price}</span>
          {product.oldPrice && (
            <span className="text-xs text-text-tertiary">
              {product.oldPrice} {product.oldPriceLabel ?? 'Precio anterior'}
            </span>
          )}
        </p>

        <p className="text-[11px] leading-4 text-text-tertiary">
          {agotado ? 'Sin stock disponible' : `${product.store} | ${product.stockNote}`}
        </p>

        <AddToCartButton
          item={aCartItem(product)}
          disabled={agotado}
          full
          className="mt-2 min-h-11"
        >
          {agotado ? 'No disponible' : 'Agregar al carrito'}
        </AddToCartButton>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------- estados */
function SkeletonGrid() {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-novey border border-border-light bg-white">
          <div className="aspect-square animate-pulse bg-[#F3F4F6]" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-11 w-full animate-pulse rounded-novey bg-[#F3F4F6]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EstadoVacio() {
  // Recomendados: productos reales del catálogo, no inventados.
  const recomendados = ALL_PRODUCTS.slice(0, 4);
  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="rounded-novey border border-border-light bg-white px-6 py-14 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-novey-blue-pale text-novey-blue">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20.7 3.9 12.6a5.4 5.4 0 0 1 7.6-7.6l.5.5.5-.5a5.4 5.4 0 1 1 7.6 7.6Z" />
          </svg>
        </span>
        <p className="mt-4 text-lg font-semibold text-gray-900">Todavía no guardaste productos</p>
        <p className="mx-auto mt-1.5 max-w-[440px] text-sm text-gray-500">
          Explora el catálogo y toca el corazón de los productos que quieras guardar.
        </p>
        <a
          href={ROUTES.ofertas}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-novey bg-novey-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
        >
          Explorar productos
        </a>
      </div>

      <section aria-labelledby="reco-titulo">
        <h2 id="reco-titulo" className="text-lg font-bold text-gray-900">
          Productos que te pueden interesar
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recomendados.map((p) => (
            <li
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-novey border border-border-light bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-novey-blue/40 hover:shadow-[0_12px_24px_-8px_rgba(0,85,184,0.22)]"
            >
              <div className="relative aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
                <FavoriteButton
                  productId={p.id}
                  productName={p.name}
                  productImage={p.image}
                  className="absolute right-3 top-3 h-11 w-11 sm:h-8 sm:w-8"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <p className="text-[11px] font-bold uppercase text-text-tertiary">{p.brand}</p>
                <h3 className="text-sm font-medium leading-5 text-text-primary">{p.name}</h3>
                <p className="mt-auto pt-2 text-lg font-bold text-text-primary">{p.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
