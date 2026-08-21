'use client';

import { useEffect, useState } from 'react';
import { CheckoutProvider, useCheckout } from '../lib/checkout-context';
import { money } from '../lib/format';
import { ChevronDown } from '../components/icons';
import { STORES, ADDRESSES, SAVED_CARDS } from '../lib/data';
import { Header } from '../components/checkout/Header';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { StepShell, StepStatus } from '../components/checkout/StepShell';
import { CustomerStep } from '../components/checkout/CustomerStep';
import { DeliveryStep } from '../components/checkout/DeliveryStep';
import { PaymentStep } from '../components/checkout/PaymentStep';
import { ReviewStep } from '../components/checkout/ReviewStep';
import { ConfirmationPage } from '../components/checkout/ConfirmationPage';
import { Modals } from '../components/checkout/Modals';

/** Mientras se resuelve la sesión no se sabe qué paso abrir. */
function StepsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-[68px] animate-pulse rounded-xl bg-white" />
      <div className="h-[260px] animate-pulse rounded-xl bg-white" />
      <div className="h-[68px] animate-pulse rounded-xl bg-white" />
      <div className="h-[68px] animate-pulse rounded-xl bg-white" />
    </div>
  );
}

function Steps() {
  const { state, editStep } = useCheckout();
  const s = state.step;
  if (!state.sesionLista) return <StepsSkeleton />;
  const status = (n: number): StepStatus => {
    if (s === n) return 'active';
    if (n === 1 && state.customerDone) return 'done';
    if (n === 2 && state.deliveryDone) return 'done';
    if (n === 3 && state.paymentDone) return 'done';
    return 'pending';
  };

  const d = state.delivery;
  const store = STORES.find((x) => x.id === d.storeId)!;
  const addr = ADDRESSES.find((x) => x.id === d.addressId)!;
  const p = state.payment;
  const methodLabel =
    p.method === 'cmf' ? 'CMF •••• 9999' : p.method === 'yappy' ? 'Yappy' : SAVED_CARDS.find((c) => c.id === p.cardId)?.label || 'Tarjeta';
  const deliverySummary = d.type === 'tienda' ? `Retiro en tienda · ${store.name}` : `Entrega a domicilio · ${addr.line}`;

  return (
    <>
      <StepShell
        index={1}
        title="Datos del cliente"
        status={status(1)}
        summary={[state.customer.name, state.customer.email, state.customer.phone]
          .filter(Boolean)
          .join(' · ')}
        note={state.perfilActualizado ? 'Datos actualizados' : undefined}
        onEdit={() => editStep(1)}
      >
        {s === 1 && <CustomerStep />}
      </StepShell>

      <StepShell index={2} title="Tipo de entrega" status={status(2)} summary={deliverySummary} onEdit={() => editStep(2)}>
        {s === 2 && <DeliveryStep />}
      </StepShell>

      <StepShell index={3} title="Pago" status={status(3)} summary={methodLabel} onEdit={() => editStep(3)}>
        {s === 3 && <PaymentStep />}
      </StepShell>

      <StepShell index={4} title="Revisa y confirma tu pedido" status={status(4)}>
        {s === 4 && <ReviewStep />}
      </StepShell>
    </>
  );
}

function ResumenMobile() {
  const { totals, items } = useCheckout();
  const [abierto, setAbierto] = useState(false);
  const unidades = items.reduce((n, p) => n + p.qty, 0);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="resumen-mobile"
        className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border-light bg-white px-4 py-3 text-left"
      >
        <span className="flex-1 text-sm font-medium text-text-secondary">
          {abierto ? 'Ocultar detalle' : 'Ver detalle'} del pedido ({unidades})
        </span>
        <span className="text-lg font-bold text-novey-blue">{money(totals.total)}</span>
        <ChevronDown className={`shrink-0 text-text-secondary transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div id="resumen-mobile" className="step-in mt-3">
          <OrderSummary />
        </div>
      )}
    </div>
  );
}

/** Carrito vacío: pantalla con salida, en vez de un pedido inventado. */
function CarritoVacio() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Agrega productos para poder completar tu compra.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="/productos"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-novey-blue px-5 text-[15px] font-semibold text-white transition-colors hover:bg-novey-blue-dark"
          >
            Ver productos
          </a>
          <a
            href="/carrito"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-novey-blue bg-white px-5 text-[15px] font-semibold text-novey-blue transition-colors hover:bg-novey-blue-bg"
          >
            Ir al carrito
          </a>
        </div>
      </main>
    </div>
  );
}

function CheckoutInner() {
  const { state, editStep, carritoVacio } = useCheckout();
  // Botón atrás desde la confirmación: vuelve al paso de revisión
  useEffect(() => {
    const onPop = () => {
      if (!window.location.pathname.endsWith('/confirmacion')) editStep(4);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [editStep]);
  if (state.step === 5) return <ConfirmationPage />;
  if (carritoVacio) return <CarritoVacio />;
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          {/* Mobile: el total siempre a la vista, el detalle se abre a pedido,
              para no tapar el paso activo con el resumen entero. */}
          <ResumenMobile />
          <Steps />
        </div>
        <div className="hidden lg:sticky lg:top-6 lg:block">
          <OrderSummary />
        </div>
      </main>
      <Modals />
    </div>
  );
}

export default function Page() {
  return (
    <CheckoutProvider>
      <CheckoutInner />
    </CheckoutProvider>
  );
}
