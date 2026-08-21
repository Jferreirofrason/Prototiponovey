'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useCheckout } from '../../lib/checkout-context';
import { STORES, ADDRESSES, SAVED_CARDS, CMF_CARD } from '../../lib/data';
import { money } from '../../lib/format';
import { Header } from './Header';
import { Button, Card, Divider } from '../ui';
import BrandsCarousel from '../shared/BrandsCarousel';
import { Check, Wrench, MapPin, Clock, User, CreditCard, Package } from '../icons';
import { ProductThumb } from './OrderSummary';

export function ConfirmationPage() {
  const { state, items, totals, reset } = useCheckout();
  const d = state.delivery;
  const p = state.payment;
  const t = totals;
  const store = STORES.find((s) => s.id === d.storeId)!;
  const addr = ADDRESSES.find((a) => a.id === d.addressId)!;
  const isStore = d.type === 'tienda';

  // Quién retira/recibe: dato real del paso de entrega.
  const quienRetira =
    d.recipient === 'otra'
      ? d.other.name || 'Otra persona autorizada'
      : `${state.customer.name} (comprador)`;

  const metodoPago =
    p.method === 'cmf'
      ? CMF_CARD.label
      : p.method === 'yappy'
        ? 'Yappy'
        : SAVED_CARDS.find((c) => c.id === p.cardId)?.label || 'Tarjeta';

  const unidades = items.reduce((n, it) => n + it.qty, 0);

  // "Rastrear mi pedido" existe en la home (/rastrear-orden). Bajo el dominio
  // unificado es relativo; en el dominio suelto del checkout, absoluto.
  const [trackHref, setTrackHref] = useState('https://prototiponovey.vercel.app/rastrear-orden');
  useEffect(() => {
    if (!window.location.hostname.startsWith('novey-checkout')) setTrackHref('/rastrear-orden');
  }, []);

  const continuarComprando = () => {
    try {
      window.localStorage.removeItem('novey-cart');
    } catch {}
    if (window.location.hostname.startsWith('novey-checkout')) {
      window.history.pushState({}, '', '/checkout');
      reset();
    } else {
      window.location.assign('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-5 md:py-8 flex flex-col gap-4 md:gap-5">
        <ConfirmStrip orderNumber={state.orderNumber} email={state.customer.email} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 md:gap-5 items-start">
          {/* Columna principal: primero la logística, después el detalle */}
          <div className="flex flex-col gap-4 md:gap-5">
            {isStore ? (
              <PickupHero store={store} fecha={d.date} quienRetira={quienRetira} />
            ) : (
              <DeliveryHero addr={addr} fecha={d.date} quienRecibe={quienRetira} />
            )}

            <ItemsCard items={items} unidades={unidades} />
            <NextSteps isStore={isStore} />
            <InstallOffer />
          </div>

          {/* Rail: el resumen de plata, igual que en el checkout */}
          <div className="lg:sticky lg:top-5 flex flex-col gap-4">
            <MoneyCard
              totals={t}
              unidades={unidades}
              metodoPago={metodoPago}
              installment={p.method === 'cmf' ? p.installment : ''}
              email={state.customer.email}
              orderNumber={state.orderNumber}
            />
            <div className="flex flex-col gap-2.5">
              <Button full onClick={continuarComprando}>
                Continuar comprando
              </Button>
              <a
                href={trackHref}
                className="inline-flex w-full items-center justify-center rounded-lg border border-novey-blue bg-white px-5 py-3 text-[15px] font-semibold leading-none text-novey-blue transition-colors hover:bg-novey-blue-bg"
              >
                Rastrear mi pedido
              </a>
            </div>
          </div>
        </div>

        {/* Mismo componente que "Nuestras marcas exclusivas" del home */}
        <BrandsCarousel
          title="Sigue tus marcas favoritas"
          subtitle="Recibe novedades sobre nuevos productos y ofertas especiales"
          headingId="marcas-favoritas"
          assetBase="/checkout"
        />
      </main>
    </div>
  );
}

/* ------------------------------------------------- confirmación (sobria) --
   Franja compacta: confirma sin festejar y deja el número a mano. El peso
   visual de la página se lo lleva la fecha de retiro, no este bloque.        */
function ConfirmStrip({ orderNumber, email }: { orderNumber: string; email: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin permiso de portapapeles: el número sigue visible para copiarlo a mano */
    }
  };

  return (
    <section
      aria-labelledby="confirmacion-titulo"
      className="rounded-xl border border-feedback-success-dark/25 bg-white p-4 md:px-6 md:py-5 flex flex-wrap items-center gap-x-5 gap-y-3"
    >
      <span className="check-pop shrink-0 w-10 h-10 rounded-full bg-feedback-success-dark text-white grid place-items-center">
        <Check width={22} height={22} strokeWidth={3} />
      </span>

      <div className="flex-1 min-w-[210px]">
        <h1 id="confirmacion-titulo" className="text-lg md:text-xl font-bold">
          ¡Listo! Tu compra fue confirmada
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Enviamos el comprobante a{' '}
          <span className="font-semibold text-text-primary break-words">{email}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-[#F3F4F6] px-3.5 py-2.5">
        <div>
          <p className="text-[11px] text-text-tertiary leading-none">N.º de pedido</p>
          <p className="text-[15px] font-bold tracking-wide mt-1">{orderNumber}</p>
        </div>
        <button
          type="button"
          onClick={copiar}
          className="rounded-lg bg-white border border-border-medium px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-novey-blue hover:text-novey-blue"
        >
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        <span aria-live="polite" className="sr-only">
          {copiado ? 'Número de pedido copiado' : ''}
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- logística --
   La fecha es el titular: es lo que el usuario vino a buscar.                */
function HeroShell({
  etiqueta,
  fecha,
  nota,
  children,
}: {
  etiqueta: string;
  fecha: string;
  nota: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-novey-blue-bg border-b border-novey-blue/15 px-5 md:px-6 py-4 md:py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-novey-blue flex items-center gap-1.5">
          <MapPin width={14} height={14} aria-hidden="true" />
          {etiqueta}
        </p>
        <p className="text-2xl md:text-[28px] font-bold leading-tight mt-1.5">{fecha}</p>
        <p className="text-sm text-text-secondary mt-1">{nota}</p>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </Card>
  );
}

function PickupHero({
  store,
  fecha,
  quienRetira,
}: {
  store: (typeof STORES)[number];
  fecha: string;
  quienRetira: string;
}) {
  return (
    <HeroShell
      etiqueta="Retiro en tienda"
      fecha={fecha}
      nota="Todavía lo estamos preparando. Te avisamos por correo cuando esté listo."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Dato icon={<MapPin width={16} height={16} />} titulo="Sucursal">
          <p className="font-medium">{store.name}</p>
          <p className="text-sm text-text-secondary">{store.address}</p>
        </Dato>
        <Dato icon={<Clock width={16} height={16} />} titulo="Horario de atención">
          <p className="text-sm text-text-secondary">{store.hours}</p>
        </Dato>
        <Dato icon={<User width={16} height={16} />} titulo="Retira">
          <p className="font-medium">{quienRetira}</p>
        </Dato>
      </div>
    </HeroShell>
  );
}

function DeliveryHero({
  addr,
  fecha,
  quienRecibe,
}: {
  addr: (typeof ADDRESSES)[number];
  fecha: string;
  quienRecibe: string;
}) {
  return (
    <HeroShell
      etiqueta="Entrega a domicilio"
      fecha={fecha}
      nota="Todavía lo estamos preparando. Te avisamos por correo cuando salga."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Dato icon={<MapPin width={16} height={16} />} titulo="Dirección">
          <p className="font-medium">{addr.line}</p>
          <p className="text-sm text-text-secondary">
            {addr.city} · {addr.zip}
          </p>
        </Dato>
        <Dato icon={<User width={16} height={16} />} titulo="Recibe">
          <p className="font-medium">{quienRecibe}</p>
        </Dato>
      </div>
    </HeroShell>
  );
}

function Dato({ icon, titulo, children }: { icon: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-text-tertiary shrink-0 mt-0.5" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-text-tertiary">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- productos --*/
function ItemsCard({
  items,
  unidades,
}: {
  items: ReturnType<typeof useCheckout>['items'];
  unidades: number;
}) {
  return (
    <Card className="p-5 md:p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold">
        Tus productos{' '}
        <span className="font-normal text-text-tertiary">
          ({unidades} {unidades === 1 ? 'artículo' : 'artículos'})
        </span>
      </h2>
      <ul className="flex flex-col divide-y divide-border-light">
        {items.map((it, i) => (
          <li key={it.id} className={`flex gap-3.5 ${i === 0 ? 'pb-4' : 'py-4'} last:pb-0`}>
            <div className="relative w-[68px] h-[68px] shrink-0 rounded-lg border border-border-light bg-white grid place-items-center text-text-tertiary overflow-hidden">
              <ProductThumb src={it.image} alt={it.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[15px] leading-snug">{it.name}</p>
              {(it.brand || it.sku) && (
                <p className="text-xs text-text-tertiary mt-0.5">
                  {[it.brand, it.sku].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="text-xs text-text-tertiary mt-1">
                Cantidad: {it.qty} · {money(it.price)} c/u
              </p>
            </div>
            <span className="font-semibold whitespace-nowrap">{money(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------- rail plata --*/
function MoneyCard({
  totals: t,
  unidades,
  metodoPago,
  installment,
  email,
  orderNumber,
}: {
  totals: ReturnType<typeof useCheckout>['totals'];
  unidades: number;
  metodoPago: string;
  installment: string;
  email: string;
  orderNumber: string;
}) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <h2 className="text-base font-semibold">Resumen de tu compra</h2>

      <dl className="flex flex-col gap-2.5 text-sm">
        <Linea label={`Subtotal (${unidades})`} value={money(t.subtotal)} />
        {t.offers > 0 && <Linea label="Descuento por ofertas" value={`-${money(t.offers)}`} descuento />}
        {t.giftDiscount > 0 && <Linea label="Tarjeta de regalo" value={`-${money(t.giftDiscount)}`} descuento />}
        {t.pointsDiscount > 0 && <Linea label="Puntos Gordos" value={`-${money(t.pointsDiscount)}`} descuento />}
        <Linea label="Envío" value={money(t.shipping)} />
        <Linea label="Impuestos estimados" value={money(t.taxes)} />
      </dl>

      <Divider />

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold">Total pagado</span>
        <span className="text-2xl font-bold whitespace-nowrap">{money(t.total)}</span>
      </div>

      {t.savings > 0 && (
        <p className="rounded-lg bg-feedback-success-bg text-feedback-success-dark text-sm font-semibold px-3 py-2 text-center">
          Ahorraste {money(t.savings)} en este pedido
        </p>
      )}

      <Divider />

      <dl className="flex flex-col gap-2.5 text-sm">
        <Linea
          label="Método de pago"
          value={installment ? `${metodoPago} · ${installment}` : metodoPago}
          icon={<CreditCard width={16} height={16} />}
        />
        <Linea label="Comprobante" value={email} quiebra />
        <Linea label="N.º de pedido" value={orderNumber} />
      </dl>
    </Card>
  );
}

function Linea({
  label,
  value,
  descuento,
  quiebra,
  icon,
}: {
  label: string;
  value: string;
  descuento?: boolean;
  quiebra?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-text-secondary flex items-center gap-1.5 shrink-0">
        {icon && <span className="text-text-tertiary">{icon}</span>}
        {label}
      </dt>
      <dd
        className={`font-semibold text-right ${quiebra ? 'break-words min-w-0' : 'whitespace-nowrap'} ${
          descuento ? 'text-feedback-success-dark' : 'text-text-primary'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------ qué sigue --*/
function NextSteps({ isStore }: { isStore: boolean }) {
  const pasos = isStore
    ? [
        'Te avisaremos por correo cuando tu pedido esté listo.',
        'Acércate a la sucursal dentro del horario de atención.',
        'Presenta tu número de pedido y tu cédula o ID.',
      ]
    : [
        'Te avisaremos por correo cuando tu pedido esté en camino.',
        'Asegúrate de que haya alguien en la dirección de entrega.',
        'Presenta tu número de pedido y tu cédula o ID al recibirlo.',
      ];

  return (
    <Card className="p-5 md:p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <span className="text-novey-blue">
          <Package width={18} height={18} aria-hidden="true" />
        </span>
        ¿Qué sigue ahora?
      </h2>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {pasos.map((paso, i) => (
          <li key={paso} className="flex sm:flex-col gap-3 sm:gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-novey-blue text-white text-xs font-bold grid place-items-center">
              {i + 1}
            </span>
            <p className="text-sm text-text-secondary leading-snug">{paso}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* --------------------------------------------------------------- servicio --*/
function InstallOffer() {
  return (
    <aside
      aria-labelledby="instalacion-titulo"
      className="rounded-xl border border-border-light bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <span className="shrink-0 w-11 h-11 rounded-full bg-feedback-warning-bg text-feedback-warning-dark grid place-items-center">
        <Wrench width={20} height={20} aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Servicio opcional</p>
        <p id="instalacion-titulo" className="font-semibold mt-0.5">
          ¿Quieres que instalemos tu producto por ti?
        </p>
        <p className="text-sm text-text-secondary mt-0.5">
          Nuestro equipo puede ayudarte con la instalación en tu hogar. Servicio adicional con costo.
        </p>
      </div>
      <Button variant="secondary" className="shrink-0 sm:w-auto w-full">
        Agregar instalación
      </Button>
    </aside>
  );
}
