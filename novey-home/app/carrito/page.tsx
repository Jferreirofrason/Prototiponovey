'use client';

// Carrito — paso previo al checkout. Antes el ícono del navbar saltaba directo
// a /checkout y no se podía ver ni ajustar lo que había adentro.

import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductThumb from '../../components/ProductThumb';
import { ROUTES } from '../../lib/routes';
import {
  CartItem,
  DEMO_CART,
  countUnits,
  readCart,
  savings,
  subtotal,
  writeCart,
} from '../../lib/cart';

const money = (n: number) => `$${n.toFixed(2)}`;

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[] | null>(null); // null = todavía no leyó
  const cargado = useRef(false);

  useEffect(() => {
    const guardado = readCart();
    // Nunca hubo carrito: se siembra el mismo pedido de muestra del checkout.
    setItems(guardado === null ? DEMO_CART : guardado);
    cargado.current = true;
  }, []);

  // Persistir aparte de mutar deja los handlers como updates funcionales, así
  // dos clics seguidos en "+" no se pisan leyendo un estado viejo.
  useEffect(() => {
    if (!cargado.current || items === null) return;
    writeCart(items);
  }, [items]);

  const cambiarQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev ? prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it)) : prev,
    );

  const quitar = (id: string) => setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1276px] px-4 pb-12 pt-6 sm:px-6 lg:px-6">
        <h1 className="text-2xl font-bold leading-8 text-gray-900">Tu carrito</h1>

        {items === null ? (
          <p className="mt-6 text-sm text-gray-500">Cargando tu carrito…</p>
        ) : items.length === 0 ? (
          <VacioState />
        ) : (
          <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_360px]">
            <section aria-label="Productos en el carrito" className="rounded-novey border border-border-light bg-white">
              <h2 className="border-b border-border-light px-5 py-4 text-base font-semibold">
                {countUnits(items)} {countUnits(items) === 1 ? 'artículo' : 'artículos'}
              </h2>
              <ul className="divide-y divide-border-light">
                {items.map((it) => (
                  <Fila key={it.id} item={it} onQty={cambiarQty} onQuitar={quitar} />
                ))}
              </ul>
            </section>

            <Resumen items={items} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Fila({
  item,
  onQty,
  onQuitar,
}: {
  item: CartItem;
  onQty: (id: string, delta: number) => void;
  onQuitar: (id: string) => void;
}) {
  const linea = item.price * item.qty;
  return (
    <li className="flex flex-wrap items-start gap-4 p-5">
      <ProductThumb src={item.image} alt={item.name} className="h-20 w-20" />

      <div className="min-w-[180px] flex-1">
        <p className="font-medium leading-snug text-gray-900">{item.name}</p>
        {(item.brand || item.sku) && (
          <p className="mt-0.5 text-xs text-gray-500">{[item.brand, item.sku].filter(Boolean).join(' · ')}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{money(item.price)} c/u</p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-novey border border-border-medium">
            <button
              type="button"
              onClick={() => onQty(item.id, -1)}
              disabled={item.qty <= 1}
              aria-label={`Quitar una unidad de ${item.name}`}
              className="grid h-9 w-9 place-items-center text-lg leading-none text-text-secondary transition-colors hover:text-novey-blue disabled:cursor-not-allowed disabled:text-text-disabled"
            >
              −
            </button>
            <span aria-live="polite" className="min-w-[2.5rem] text-center text-sm font-semibold">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => onQty(item.id, 1)}
              aria-label={`Agregar una unidad de ${item.name}`}
              className="grid h-9 w-9 place-items-center text-lg leading-none text-text-secondary transition-colors hover:text-novey-blue"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => onQuitar(item.id)}
            className="text-sm font-medium text-feedback-error-dark hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>

      <p className="ml-auto whitespace-nowrap text-base font-semibold text-gray-900">{money(linea)}</p>
    </li>
  );
}

function Resumen({ items }: { items: CartItem[] }) {
  const sub = subtotal(items);
  const ahorro = savings(items);
  return (
    <aside className="rounded-novey border border-border-light bg-white p-5 lg:sticky lg:top-5">
      <h2 className="text-base font-semibold">Resumen</h2>
      <dl className="mt-4 flex flex-col gap-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-text-secondary">Subtotal ({countUnits(items)})</dt>
          <dd className="font-semibold">{money(sub)}</dd>
        </div>
        {ahorro > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-text-secondary">Ahorro por ofertas</dt>
            <dd className="font-semibold text-feedback-success-dark">-{money(ahorro)}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-xs text-gray-500">
        El envío y los impuestos se calculan en el siguiente paso.
      </p>

      <a
        href={ROUTES.carritoCheckout}
        className="mt-4 flex h-11 w-full items-center justify-center rounded-novey bg-novey-blue text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
      >
        Continuar al pago
      </a>
      <a
        href={ROUTES.home}
        className="mt-2.5 flex h-11 w-full items-center justify-center rounded-novey border border-novey-blue bg-white text-sm font-semibold text-novey-blue transition-colors hover:bg-novey-blue-bg"
      >
        Seguir comprando
      </a>
    </aside>
  );
}

function VacioState() {
  return (
    <div className="mt-6 rounded-novey border border-border-light bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-gray-900">Tu carrito está vacío</p>
      <p className="mx-auto mt-1.5 max-w-[420px] text-sm text-gray-500">
        Agrega productos desde el catálogo y vuelve para completar tu compra.
      </p>
      <a
        href={ROUTES.home}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-novey bg-novey-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-novey-blue-dark"
      >
        Seguir comprando
      </a>
    </div>
  );
}
