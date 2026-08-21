'use client';

import { ReactNode, useState } from 'react';
import { useCheckout, GIFT_BALANCE, POINTS_BALANCE, POINTS_QTY } from '../../lib/checkout-context';
import type { CardArt } from '../../lib/data';
import { SAVED_CARDS, CMF_CARD, CMF_CARD_ART, CMF_INSTALLMENT_OPTIONS, ADDRESSES } from '../../lib/data';
import { money } from '../../lib/format';
import { Button, RadioDot, Badge, Input, Segmented, Toggle, Divider } from '../ui';
import { CreditCard, Plus, Gift, Star, Check } from '../icons';
import { BackLink } from './StepShell';

export function PaymentStep() {
  const { state, setPayment, completePayment, editStep, openModal } = useCheckout();
  const p = state.payment;
  const billing = ADDRESSES[0];
  // Sólo aplica a CMF: no se puede continuar sin elegir cuotas.
  const [cmfError, setCmfError] = useState(false);
  const missingCmfInstallment = p.method === 'cmf' && !p.installment;

  const handleContinue = () => {
    if (missingCmfInstallment) {
      setCmfError(true);
      document.getElementById('cmf-cuotas')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setCmfError(false);
    completePayment();
  };

  return (
    <div className="flex flex-col gap-5">
      <BackLink onClick={() => editStep(2)} />

      <div>
        <p className="font-semibold mb-2.5">Método de pago</p>
        <Segmented
          value={p.method}
          onChange={(v) => {
            const method = v as typeof p.method;
            // Las cuotas son exclusivas de CMF: al salir de CMF se descarta el valor.
            setPayment(method === 'cmf' ? { method } : { method, installment: '' });
            setCmfError(false);
          }}
          options={[
            { value: 'tarjeta', label: 'Tarjeta' },
            { value: 'yappy', label: 'Yappy' },
            { value: 'cmf', label: 'CMF' },
          ]}
        />
      </div>

      {/* Tarjeta */}
      {p.method === 'tarjeta' && (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">Selecciona tu tarjeta</p>
          {SAVED_CARDS.map((c) => {
            const sel = p.cardId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setPayment({ cardId: c.id })}
                className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3.5 text-left transition-colors ${
                  sel ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light hover:border-border-medium'
                }`}
              >
                <RadioDot selected={sel} />
                <CardThumb
                  art={c.art}
                  fallback={<CreditCard width={18} height={18} />}
                  fallbackClass="bg-[#F3F4F6] text-text-tertiary"
                />
                <span className="font-medium flex-1 min-w-[7rem]">{c.label}</span>
                {c.isDefault && <Badge>Predeterminada</Badge>}
              </button>
            );
          })}
          <Button variant="secondary" leftIcon={<Plus width={18} height={18} />} onClick={() => openModal('addCard')}>
            Agregar nueva tarjeta
          </Button>
        </div>
      )}

      {/* Yappy */}
      {p.method === 'yappy' && (
        <div className="flex items-center gap-3 rounded-xl border border-border-light p-4">
          <span className="w-10 h-10 rounded-lg bg-[#00A4B4] text-white grid place-items-center font-bold">Y</span>
          <p className="text-sm text-text-secondary">
            Serás redirigido a <span className="font-semibold text-text-primary">Yappy</span> para completar el pago de forma segura.
          </p>
        </div>
      )}

      {/* CMF */}
      {p.method === 'cmf' && (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">Tu tarjeta CMF</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border-light p-3.5">
            <CmfCardArt />
            <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="font-medium whitespace-nowrap">{CMF_CARD.label}</span>
              {CMF_CARD.isDefault && <Badge>Predeterminada</Badge>}
            </div>
            <button className="ml-auto shrink-0 text-novey-blue text-sm font-medium hover:underline">Cambiar tarjeta</button>
          </div>
          <CmfInstallments
            value={p.installment}
            onChange={(v) => {
              setPayment({ installment: v });
              setCmfError(false);
            }}
            invalid={cmfError && !p.installment}
          />
        </div>
      )}

      <Divider />

      {/* Saldos */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold">Usar saldo disponible</p>
          <p className="text-sm text-text-tertiary">Puedes usar tu saldo o puntos para reducir el monto a pagar</p>
        </div>
        {p.method === 'cmf' && (
          <div className="rounded-lg bg-feedback-warning-bg text-text-secondary text-sm px-3.5 py-3">
            CMF no puede combinarse con otros métodos de pago. Solo puedes aplicar saldos disponibles habilitados para esta compra.
          </div>
        )}
        <GiftBlock />
        <PointsBlock />
      </div>

      <Divider />

      {/* Billing */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Dirección de facturación</p>
        <div className="flex items-center gap-3 rounded-xl border border-border-light bg-[#FAFAFA] p-4">
          <div className="flex-1">
            <p className="text-sm font-medium">La dirección de facturación es la misma que la de envío</p>
            <p className="text-xs text-text-tertiary mt-0.5">Usaremos tu dirección de envío para la factura</p>
          </div>
          <Toggle checked={p.billingSame} onChange={(v) => setPayment({ billingSame: v })} />
        </div>
        {p.billingSame && (
          <div className="rounded-xl border border-border-light p-4 text-sm flex flex-col gap-0.5">
            <p className="font-semibold text-[15px]">{billing.recipient}</p>
            <p className="text-text-secondary">{billing.line}</p>
            <p className="text-text-tertiary">{billing.city}</p>
            <p className="text-text-tertiary">Código postal: {billing.zip}</p>
            <div className="h-px bg-border-light my-2" />
            <p className="text-text-tertiary">Teléfono: {billing.phone}</p>
          </div>
        )}
      </div>

      <Button full onClick={handleContinue}>
        Continuar a revisión
      </Button>
    </div>
  );
}

/* ---- Miniatura de tarjeta: arte real con fallback discreto ----
   88px de ancho; el alto sale del ratio nativo de cada arte, sin deformar.
   El fallback conserva la misma caja para que las filas no se muevan. */
function CardThumb({
  art,
  fallback,
  fallbackClass,
  fallbackLabel,
}: {
  art?: CardArt;
  fallback: ReactNode;
  fallbackClass: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!art || failed) {
    return (
      <span
        role={fallbackLabel ? 'img' : undefined}
        aria-label={fallbackLabel}
        aria-hidden={fallbackLabel ? undefined : true}
        className={`shrink-0 grid w-[88px] aspect-[1.586] place-items-center rounded-md ${fallbackClass}`}
      >
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={art.src}
      alt={art.alt}
      width={art.width}
      height={art.height}
      onError={() => setFailed(true)}
      className="shrink-0 w-[88px] h-auto rounded-md shadow-card ring-1 ring-black/5"
    />
  );
}

function CmfCardArt() {
  return (
    <CardThumb
      art={CMF_CARD_ART}
      fallback="CMF"
      fallbackLabel={CMF_CARD_ART.alt}
      fallbackClass="bg-novey-blue-light text-novey-blue text-xs font-bold"
    />
  );
}

/* ---- CMF: cuotas como bloques (grupo de radios nativo) ---- */
function CmfInstallments({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
}) {
  const { totals } = useCheckout();
  return (
    <div id="cmf-cuotas" className="flex flex-col gap-2">
      <p className="text-sm text-text-secondary" id="cmf-cuotas-label">
        ¿En cuántas cuotas deseas pagar?
      </p>
      <div
        role="radiogroup"
        aria-labelledby="cmf-cuotas-label"
        aria-describedby={invalid ? 'cmf-cuotas-error cmf-cuotas-help' : 'cmf-cuotas-help'}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {CMF_INSTALLMENT_OPTIONS.map((o) => {
          const sel = value === o.value;
          return (
            <label key={o.value} className="block h-full cursor-pointer">
              <input
                type="radio"
                name="cmf-installment"
                value={o.value}
                checked={sel}
                onChange={() => onChange(o.value)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full flex-col gap-1.5 rounded-xl border p-3 transition-colors peer-focus-visible:border-novey-blue peer-focus-visible:ring-2 peer-focus-visible:ring-novey-blue/20 ${
                  sel
                    ? 'border-novey-blue bg-novey-blue-bg'
                    : invalid
                      ? 'border-feedback-error-dark/40 hover:border-feedback-error-dark'
                      : 'border-border-light hover:border-border-medium'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RadioDot selected={sel} />
                  <span className="font-semibold text-[15px] leading-none">
                    {o.count} {o.count === 1 ? 'cuota' : 'cuotas'}
                  </span>
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {money(totals.total / o.count)}
                  <span className="text-xs font-normal text-text-tertiary"> c/u</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {invalid && (
        <p id="cmf-cuotas-error" role="alert" className="text-sm font-medium text-feedback-error-dark">
          Selecciona en cuántas cuotas deseas pagar para continuar.
        </p>
      )}
      <p id="cmf-cuotas-help" className="text-xs text-text-tertiary">
        Monto de referencia: el total de tu compra ({money(totals.total)}) dividido por la cantidad de cuotas.
      </p>
    </div>
  );
}

/* ---- saldo block wrapper ---- */
function SaldoCard({
  title,
  icon,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  icon: ReactNode;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-light p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="font-semibold flex-1">{title}</span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && children}
    </div>
  );
}

function SuccessLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-feedback-success-bg px-3 py-2">
      <span className="w-4 h-4 shrink-0 rounded-full bg-feedback-success-dark text-white grid place-items-center">
        <Check width={11} height={11} strokeWidth={3} />
      </span>
      <span className="text-sm font-semibold text-feedback-success-dark">{text}</span>
    </div>
  );
}

function GiftBlock() {
  const { state, setGift } = useCheckout();
  const g = state.payment.gift;
  return (
    <SaldoCard
      title="Usar tarjeta de regalo"
      icon={<Gift />}
      enabled={g.enabled}
      onToggle={(v) => setGift(v ? { enabled: true } : { enabled: false, consulted: false, applied: false, amount: 0 })}
    >
      {!g.consulted ? (
        <>
          <p className="text-sm text-text-secondary">Código de tarjeta de regalo</p>
          <div className="flex gap-2">
            <Input value={g.code} onChange={(v) => setGift({ code: v })} placeholder="Ingresa el código" />
            <Button variant="secondary" onClick={() => setGift({ consulted: true })}>
              Consultar
            </Button>
          </div>
        </>
      ) : (
        <>
          <SuccessLine text={`Saldo disponible: ${money(GIFT_BALANCE)}`} />
          {!g.applied ? (
            <>
              <p className="text-sm text-text-secondary">Monto a usar</p>
              <div className="flex gap-2">
                <Input prefix="$" value={g.amount ? String(g.amount) : ''} onChange={(v) => setGift({ amount: Math.min(parseFloat(v) || 0, GIFT_BALANCE) })} placeholder="0,00" />
                <Button onClick={() => setGift({ applied: true, amount: g.amount || GIFT_BALANCE })}>Aplicar</Button>
              </div>
              <button className="self-start text-novey-blue text-sm font-medium hover:underline" onClick={() => setGift({ applied: true, amount: GIFT_BALANCE })}>
                Usar todo el saldo
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <SuccessLine text={`Saldo aplicado: -${money(g.amount)}`} />
              <button className="shrink-0 text-error-dark text-sm font-medium hover:underline" onClick={() => setGift({ applied: false, amount: 0 })}>
                Quitar
              </button>
            </div>
          )}
        </>
      )}
    </SaldoCard>
  );
}

function PointsBlock() {
  const { state, setPoints } = useCheckout();
  const pt = state.payment.points;
  return (
    <SaldoCard
      title="Puntos Gordos"
      icon={<Star />}
      enabled={pt.enabled}
      onToggle={(v) => setPoints(v ? { enabled: true } : { enabled: false, applied: false, amount: 0 })}
    >
      {!pt.applied ? (
        <>
          <SuccessLine text={`Saldo disponible: ${money(POINTS_BALANCE)}`} />
          <p className="text-xs text-text-tertiary">Equivale a {POINTS_QTY} puntos</p>
          <button className="self-start text-novey-blue text-sm font-medium hover:underline" onClick={() => setPoints({ applied: true, amount: POINTS_BALANCE })}>
            Usar todo el saldo
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-feedback-success-dark">
            Puntos aplicados: -{money(pt.amount)} ({POINTS_QTY} puntos)
          </span>
          <button className="shrink-0 text-error-dark text-sm font-medium hover:underline" onClick={() => setPoints({ applied: false, amount: 0 })}>
            Eliminar puntos
          </button>
        </div>
      )}
    </SaldoCard>
  );
}
