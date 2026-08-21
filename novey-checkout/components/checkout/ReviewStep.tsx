'use client';

import { ReactNode } from 'react';
import { useCheckout } from '../../lib/checkout-context';
import { STORES, ADDRESSES, SAVED_CARDS } from '../../lib/data';
import { money } from '../../lib/format';
import { Button, Checkbox, Badge, Divider } from '../ui';
import { MapPin, Package, Calendar, CreditCard } from '../icons';
import { BackLink } from './StepShell';

function Section({ icon, title, action, children }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-novey-blue">{icon}</span>
        <h3 className="text-base font-semibold flex-1">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
function ActionLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-novey-blue text-sm font-medium hover:underline">
      {children}
    </button>
  );
}

export function ReviewStep() {
  const { state, items, editStep, confirmOrder, update } = useCheckout();
  const d = state.delivery;
  const p = state.payment;
  const store = STORES.find((s) => s.id === d.storeId)!;
  const addr = ADDRESSES.find((a) => a.id === d.addressId)!;
  const methodLabel =
    p.method === 'cmf' ? 'CMF •••• 9999' : p.method === 'yappy' ? 'Yappy' : SAVED_CARDS.find((c) => c.id === p.cardId)?.label || 'Tarjeta';
  const recibe = d.recipient === 'otra' ? d.other.name || 'Otra persona' : d.type === 'tienda' ? 'Retiro yo (comprador)' : 'Recibo yo (comprador)';

  return (
    <div className="flex flex-col gap-5">
      <BackLink onClick={() => editStep(3)} />

      <Section icon={<MapPin />} title={d.type === 'tienda' ? 'Retiro en tienda' : 'Entrega a domicilio'} action={<ActionLink onClick={() => editStep(2)}>Cambiar</ActionLink>}>
        {d.type === 'tienda' ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{store.name}</span>
              {store.availableToday && <Badge variant="success">Disponible hoy</Badge>}
            </div>
            <p className="text-sm text-text-secondary">{store.address}</p>
            <p className="text-sm text-text-tertiary">{store.hours}</p>
          </>
        ) : (
          <>
            <p className="font-medium">{addr.recipient}</p>
            <p className="text-sm text-text-secondary">{addr.line}</p>
            <p className="text-sm text-text-tertiary">
              {addr.city} · {addr.zip}
            </p>
          </>
        )}
        <div>
          <p className="text-xs text-text-tertiary">{d.type === 'tienda' ? 'Retira' : 'Recibe'}</p>
          <p className="text-sm font-medium">{recibe}</p>
        </div>
      </Section>

      <Divider />

      <Section icon={<Package />} title={`Productos (${items.length})`} action={<ActionLink>Modificar</ActionLink>}>
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-[15px]">{it.name}</p>
              <p className="text-xs text-text-tertiary">Cantidad: {it.qty}</p>
            </div>
            <span className="font-medium whitespace-nowrap">{money(it.price)}</span>
          </div>
        ))}
      </Section>

      <Divider />

      <Section icon={<Calendar />} title={d.type === 'tienda' ? 'Fecha de retiro' : 'Fecha de entrega'} action={<ActionLink onClick={() => editStep(2)}>Cambiar</ActionLink>}>
        <p className="text-sm">{d.type === 'tienda' ? `Disponible para retiro el ${d.date}` : `Entrega el ${d.date}`}</p>
      </Section>

      <Divider />

      <Section icon={<CreditCard />} title="Método de pago" action={<ActionLink onClick={() => editStep(3)}>Cambiar</ActionLink>}>
        <p className="font-medium">{methodLabel}</p>
        {/* Las cuotas son exclusivas de CMF */}
        {p.method === 'cmf' && p.installment && (
          <p className="text-sm text-text-tertiary">{p.installment}</p>
        )}
      </Section>

      <Divider />

      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={state.terms} onChange={(v) => update({ terms: v })} />
        <span className="text-sm">
          Acepto los <span className="text-novey-blue font-medium">términos y condiciones</span> de compra
        </span>
      </label>

      <Button full disabled={!state.terms} onClick={confirmOrder}>
        Confirmar pedido
      </Button>
    </div>
  );
}
