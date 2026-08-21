'use client';

import { useState } from 'react';
import { useCheckout } from '../../lib/checkout-context';
import { money } from '../../lib/format';
import { Card, Divider, Button } from '../ui';
import { ImageIcon, Shield } from '../icons';

/**
 * Miniatura de producto del resumen. Mismo encuadre en todas las vistas:
 * `object-contain` para no recortar ni deformar, y si la imagen falla o no
 * existe, cae a un ícono en lugar de dejar el hueco roto.
 */
export function ProductThumb({ src, alt }: { src?: string; alt: string }) {
  const [falla, setFalla] = useState(false);
  if (!src || falla) return <ImageIcon width={22} height={22} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFalla(true)}
      className="w-full h-full object-contain"
    />
  );
}

function Row({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-semibold whitespace-nowrap ${discount ? 'text-feedback-success-dark' : 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );
}

export function OrderSummary() {
  const { items, totals } = useCheckout();
  const t = totals;
  return (
    <Card className="p-5 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Resumen de la orden ({items.length})</h2>

      <div className="flex flex-col gap-4">
        {items.map((p) => (
          <div key={p.id} className="flex gap-3">
            <div className="relative w-16 h-16 shrink-0 rounded-lg border border-border-light bg-white grid place-items-center text-text-tertiary overflow-hidden">
              <ProductThumb src={p.image} alt={p.name} />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-novey-blue text-white text-[11px] font-semibold grid place-items-center">
                {p.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] leading-snug">{p.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                {p.brand} | {p.sku}
              </p>
              <p className="font-semibold text-[15px] mt-1">{money(p.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <div className="flex gap-2">
        <input
          placeholder="Código promocional"
          className="flex-1 min-w-0 rounded-lg border border-border-medium bg-white px-3 py-2 text-sm placeholder:text-text-tertiary outline-none focus:border-novey-blue"
        />
        <Button variant="secondary" size="sm" disabled>
          Aplicar
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 text-sm">
        <Row label="Subtotal" value={money(t.subtotal)} />
        <Row label="Descuento por ofertas" value={`-${money(t.offers)}`} discount />
        {t.giftDiscount > 0 && <Row label="Tarjeta de regalo" value={`-${money(t.giftDiscount)}`} discount />}
        {t.pointsDiscount > 0 && <Row label="Puntos Gordos" value={`-${money(t.pointsDiscount)}`} discount />}
        <Row label="Envío" value={t.shippingCalculated ? money(t.shipping) : 'Calculado en el siguiente paso'} />
        <Row label="Impuestos estimados" value={money(t.taxes)} />
      </div>

      <Divider />

      <div className="flex items-end justify-between">
        <span className="text-lg font-semibold">Total</span>
        <div className="text-right leading-tight">
          <p className="text-2xl font-bold text-novey-blue">{money(t.total)}</p>
        </div>
      </div>

      <div className="rounded-lg bg-feedback-success-bg text-feedback-success-dark text-sm font-semibold px-3 py-2.5 text-center">
        ¡Estás ahorrando {money(t.savings)} en este pedido!
      </div>

      <div className="flex gap-3 rounded-lg bg-novey-blue-bg p-3">
        <Shield className="text-novey-blue shrink-0" />
        <div>
          <p className="font-semibold text-sm">Garantía de protección al comprador</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Recibe un reembolso completo si el artículo no coincide con la descripción o no llega.
          </p>
        </div>
      </div>
    </Card>
  );
}
