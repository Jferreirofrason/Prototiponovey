'use client';

import { useCheckout } from '../../lib/checkout-context';
import { ADDRESSES, STORES } from '../../lib/data';
import { Button, RadioDot, Badge, Input, Divider } from '../ui';
import { MapPin, Package, Calendar, Plus } from '../icons';
import { BackLink } from './StepShell';

function TypeCard({
  selected,
  icon,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light bg-white hover:border-border-medium'
      }`}
    >
      <span className={selected ? 'text-novey-blue' : 'text-text-secondary'}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-text-tertiary">{subtitle}</p>
      </div>
      <RadioDot selected={selected} />
    </button>
  );
}

export function DeliveryStep() {
  const { state, setDelivery, completeDelivery, editStep, openModal } = useCheckout();
  const d = state.delivery;
  const store = STORES.find((s) => s.id === d.storeId)!;
  const addr = ADDRESSES.find((a) => a.id === d.addressId)!;

  return (
    <div className="flex flex-col gap-5">
      <BackLink onClick={() => editStep(1)} />

      {/* delivery type */}
      <div className="grid sm:grid-cols-2 gap-3">
        <TypeCard
          selected={d.type === 'domicilio'}
          icon={<Package />}
          title="Entrega a domicilio"
          subtitle="Recíbelo en tu dirección"
          onClick={() => setDelivery({ type: 'domicilio' })}
        />
        <TypeCard
          selected={d.type === 'tienda'}
          icon={<MapPin />}
          title="Retiro en tienda"
          subtitle="Retíralo sin costo de envío"
          onClick={() => setDelivery({ type: 'tienda' })}
        />
      </div>

      {/* ---- domicilio ---- */}
      {d.type === 'domicilio' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {ADDRESSES.map((a) => {
              const sel = a.id === d.addressId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setDelivery({ addressId: a.id })}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    sel ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light hover:border-border-medium'
                  }`}
                >
                  <RadioDot selected={sel} />
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-semibold text-[15px]">
                      {a.label} · {a.recipient}
                    </p>
                    <p className="text-text-secondary mt-0.5">{a.line}</p>
                    <p className="text-text-tertiary">
                      {a.city} · {a.zip}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <Button variant="secondary" leftIcon={<Plus width={18} height={18} />}>
            Agregar nueva dirección
          </Button>

          <Divider />

          {/* recipient */}
          <div className="flex flex-col gap-2.5">
            <p className="font-semibold">¿Quién recibe el pedido?</p>
            {(['yo', 'otra'] as const).map((r) => {
              const sel = d.recipient === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDelivery({ recipient: r })}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    sel ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light hover:border-border-medium'
                  }`}
                >
                  <RadioDot selected={sel} />
                  <span className="font-medium">{r === 'yo' ? 'Recibo yo (comprador)' : 'Recibe otra persona'}</span>
                </button>
              );
            })}
            {d.recipient === 'otra' && (
              <div className="flex flex-col gap-3 rounded-xl border border-border-light p-4">
                <Input label="Nombre de quien recibe" value={d.other.name} onChange={(v) => setDelivery({ other: { ...d.other, name: v } })} placeholder="Nombre y apellido" />
                <Input label="Teléfono" value={d.other.phone} onChange={(v) => setDelivery({ other: { ...d.other, phone: v } })} placeholder="+507 0000-0000" />
                <Input label="Cédula / ID" value={d.other.id} onChange={(v) => setDelivery({ other: { ...d.other, id: v } })} placeholder="0-000-0000" />
              </div>
            )}
          </div>

          <DateRow label="Fecha de entrega" value={`Entrega el ${d.date}`} onChange={() => openModal('date')} />
        </div>
      )}

      {/* ---- tienda ---- */}
      {d.type === 'tienda' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border-light p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[15px]">{store.name}</span>
              {store.availableToday && <Badge variant="success">Disponible hoy</Badge>}
              <button className="ml-auto text-novey-blue text-sm font-medium hover:underline" onClick={() => openModal('store')}>
                Cambiar tienda
              </button>
            </div>
            <p className="text-sm text-text-secondary">{store.address}</p>
            <p className="text-sm text-text-tertiary">{store.hours}</p>
            <div className="mt-1">
              <p className="text-xs text-text-tertiary">Retira</p>
              <p className="text-sm font-medium">Retiro yo (comprador)</p>
            </div>
          </div>

          <DateRow label="Fecha de retiro" value={`Disponible para retiro el ${d.date}`} onChange={() => openModal('date')} />
        </div>
      )}

      <Button full onClick={completeDelivery}>
        Continuar al pago
      </Button>
    </div>
  );
}

function DateRow({ label, value, onChange }: { label: string; value: string; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-light p-4">
      <span className="text-novey-blue">
        <Calendar />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <button className="text-novey-blue text-sm font-medium hover:underline" onClick={onChange}>
        Cambiar
      </button>
    </div>
  );
}
