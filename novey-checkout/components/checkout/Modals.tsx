'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useCheckout } from '../../lib/checkout-context';
import { DELIVERY_DATES, STORES } from '../../lib/data';
import { Button, RadioDot, Badge, Input } from '../ui';
import { X } from '../icons';

function ModalShell({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const antesRef = useRef<HTMLElement | null>(null);

  // Escape para cerrar, foco atrapado adentro y devuelto al salir: sin esto se
  // podía tabular por detrás del modal y quedar navegando a ciegas.
  useEffect(() => {
    antesRef.current = document.activeElement as HTMLElement;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const primero = f[0];
      const ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      antesRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[88vh] flex flex-col animate-[fadeIn_.15s_ease]"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light">
          <h2 className="text-lg font-semibold flex-1">{title}</h2>
          <button ref={cerrarRef} type="button" onClick={onClose} className="min-h-11 min-w-11 grid place-items-center text-text-secondary hover:text-text-primary" aria-label="Cerrar">
            <X />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border-light flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export function Modals() {
  const { state, closeModal } = useCheckout();
  if (!state.modal) return null;
  if (state.modal === 'date') return <ChangeDateModal />;
  if (state.modal === 'store') return <ChangeStoreModal />;
  if (state.modal === 'addCard') return <AddCardModal />;
  return null;
}

function ChangeDateModal() {
  const { state, setDelivery, closeModal } = useCheckout();
  const isStore = state.delivery.type === 'tienda';
  return (
    <ModalShell
      title={isStore ? 'Cambiar fecha de retiro' : 'Cambiar fecha de entrega'}
      onClose={closeModal}
      footer={
        <>
          <Button variant="tertiary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={closeModal}>Confirmar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        {DELIVERY_DATES.map((date) => {
          const sel = state.delivery.date === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setDelivery({ date })}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                sel ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light hover:border-border-medium'
              }`}
            >
              <RadioDot selected={sel} />
              <div>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-text-tertiary">{isStore ? 'Disponible para retiro' : 'Entre 9:00 AM y 6:00 PM'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

function ChangeStoreModal() {
  const { state, setDelivery, closeModal } = useCheckout();
  return (
    <ModalShell
      title="Cambiar tienda"
      onClose={closeModal}
      footer={
        <>
          <Button variant="tertiary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={closeModal}>Confirmar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        {STORES.map((s) => {
          const sel = state.delivery.storeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setDelivery({ storeId: s.id })}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                sel ? 'border-novey-blue bg-novey-blue-bg/50' : 'border-border-light hover:border-border-medium'
              }`}
            >
              <RadioDot selected={sel} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{s.name}</span>
                  {s.availableToday && <Badge variant="success">Disponible hoy</Badge>}
                  <span className="text-xs text-text-tertiary">· {s.distance}</span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{s.address}</p>
                <p className="text-sm text-text-tertiary">{s.hours}</p>
              </div>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

function AddCardModal() {
  const { closeModal } = useCheckout();
  const [num, setNum] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  return (
    <ModalShell
      title="Agregar nueva tarjeta"
      onClose={closeModal}
      footer={
        <>
          <Button variant="tertiary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={closeModal}>Agregar tarjeta</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Número de tarjeta" value={num} onChange={setNum} placeholder="0000 0000 0000 0000" />
        <div className="flex gap-3">
          <Input label="Vencimiento" value={exp} onChange={setExp} placeholder="MM/AA" />
          <Input label="CVV" value={cvv} onChange={setCvv} placeholder="123" />
        </div>
        <Input label="Nombre en la tarjeta" value={name} onChange={setName} placeholder="Como aparece en la tarjeta" />
      </div>
    </ModalShell>
  );
}
