'use client';

import { ReactNode } from 'react';
import { Card, Button } from '../ui';
import { Check } from '../icons';

function StepNum({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-sm font-semibold ${
        active ? 'bg-novey-blue text-white' : 'bg-border-light text-text-tertiary'
      }`}
    >
      {n}
    </span>
  );
}

export type StepStatus = 'done' | 'active' | 'pending';

export function StepShell({
  index,
  title,
  status,
  summary,
  note,
  onEdit,
  children,
}: {
  index: number;
  title: string;
  status: StepStatus;
  summary?: string;
  /** Confirmación breve (ej. "Datos actualizados"). */
  note?: string;
  onEdit?: () => void;
  children?: ReactNode;
}) {
  if (status === 'active') {
    return (
      <Card className="step-in border-[1.5px] border-novey-blue p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <StepNum n={index} active />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {children}
      </Card>
    );
  }

  if (status === 'done') {
    return (
      <Card className="p-4 md:p-5 flex items-center gap-3">
        <span className="check-in shrink-0 w-7 h-7 rounded-full bg-feedback-success-bg text-feedback-success-dark grid place-items-center">
          <Check width={16} height={16} strokeWidth={2.6} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight">{title}</p>
          {summary && <p className="text-sm text-text-tertiary truncate">{summary}</p>}
          {note && (
            <p role="status" className="text-sm font-semibold text-feedback-success-dark">
              {note}
            </p>
          )}
        </div>
        {onEdit && (
          <Button variant="tertiary" size="sm" onClick={onEdit}>
            Editar
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-5 flex items-center gap-3">
      <StepNum n={index} />
      <p className="font-semibold text-text-tertiary">{title}</p>
    </Card>
  );
}

/** Small "‹ Volver" link used at the top of active steps. */
export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="self-start -mt-1 text-novey-blue text-sm font-medium hover:underline">
      ‹ Volver
    </button>
  );
}
