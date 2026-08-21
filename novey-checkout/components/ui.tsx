'use client';

import { ReactNode, forwardRef, useRef } from 'react';
import { Check, ChevronDown } from './icons';

/* ---------------- Button ---------------- */
type BtnVariant = 'brand' | 'secondary' | 'tertiary' | 'danger';
export function Button({
  children,
  variant = 'brand',
  size = 'base',
  disabled,
  full,
  leftIcon,
  rightIcon,
  onClick,
  className = '',
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: 'sm' | 'base';
  disabled?: boolean;
  full?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const sz = size === 'sm' ? 'px-3.5 py-2 text-sm gap-1.5' : 'px-5 py-3 text-[15px] gap-2';
  const variants: Record<BtnVariant, string> = {
    brand: disabled
      ? 'bg-[#A9C7EB] text-white cursor-not-allowed'
      : 'bg-novey-blue text-white hover:bg-novey-blue-dark',
    secondary: disabled
      ? 'border border-border-medium text-text-disabled cursor-not-allowed'
      : 'bg-white border border-novey-blue text-novey-blue hover:bg-novey-blue-bg',
    tertiary: disabled
      ? 'text-text-disabled cursor-not-allowed'
      : 'text-novey-blue hover:underline',
    danger: 'text-error-dark hover:underline',
  };
  const pad = variant === 'tertiary' || variant === 'danger' ? (size === 'sm' ? 'px-1 py-1 gap-1.5' : 'px-1.5 py-1.5 gap-2') : sz;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg font-semibold leading-none transition-colors ${pad} ${variants[variant]} ${
        full ? 'w-full' : ''
      } ${className}`}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

/* ---------------- Input ---------------- */
let inputSeq = 0;

export const Input = forwardRef<
  HTMLInputElement,
  {
    label?: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    prefix?: string;
    type?: string;
    helper?: string;
    /** Mensaje de validación; pinta el borde y se anuncia con el campo. */
    error?: string;
    required?: boolean;
  }
>(function Input(
  { label, value, onChange, placeholder, prefix, type = 'text', helper, error, required },
  ref,
) {
  const idRef = useRef<string>();
  if (!idRef.current) idRef.current = `in-${++inputSeq}`;
  const msgId = `${idRef.current}-msg`;

  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-sm text-text-secondary">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}
      <span className="flex items-stretch gap-2">
        {prefix && (
          <span className="flex items-center px-3.5 rounded-lg border border-border-medium bg-white text-text-secondary text-[15px]">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? msgId : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          className={`flex-1 min-w-0 rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 ${
            error
              ? 'border-feedback-error-dark focus:border-feedback-error-dark focus:ring-feedback-error-dark/20'
              : 'border-border-medium focus:border-novey-blue focus:ring-novey-blue/20'
          }`}
        />
      </span>
      {error ? (
        <span id={msgId} className="text-xs font-medium text-feedback-error-dark">
          {error}
        </span>
      ) : (
        helper && (
          <span id={msgId} className="text-xs text-text-tertiary">
            {helper}
          </span>
        )
      )}
    </label>
  );
});

/* ---------------- Checkbox ---------------- */
export function Checkbox({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`shrink-0 grid place-items-center w-5 h-5 rounded-md border transition-colors ${
        checked ? 'bg-novey-blue border-novey-blue text-white' : 'bg-white border-border-medium'
      }`}
    >
      {checked && <Check width={13} height={13} strokeWidth={3} />}
    </button>
  );
}

/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`shrink-0 relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-novey-blue' : 'bg-border-medium'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

/* ---------------- RadioDot ---------------- */
export function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`shrink-0 grid place-items-center w-5 h-5 rounded-full border-2 transition-colors ${
        selected ? 'border-novey-blue' : 'border-border-medium'
      }`}
    >
      {selected && <span className="w-2.5 h-2.5 rounded-full bg-novey-blue" />}
    </span>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'success' | 'neutral' | 'info' }) {
  const styles = {
    success: 'bg-feedback-success-bg text-feedback-success-dark',
    neutral: 'bg-border-light text-text-secondary',
    info: 'bg-novey-blue-light text-novey-blue-dark',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {variant === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-feedback-success-dark" />}
      {children}
    </span>
  );
}

/* ---------------- Select (styled native) ---------------- */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-border-medium bg-white px-3.5 py-2.5 pr-10 text-[15px] outline-none focus:border-novey-blue focus:ring-2 focus:ring-novey-blue/20 ${
            value ? 'text-text-primary' : 'text-text-tertiary'
          }`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      </span>
    </label>
  );
}

/* ---------------- Segmented ---------------- */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex w-full rounded-lg bg-[#F3F4F6] p-1 gap-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange?.(o.value)}
            className={`flex-1 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'bg-novey-blue text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Card + helpers ---------------- */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border-light bg-white ${className}`}>{children}</div>;
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-border-light ${className}`} />;
}

export function Link({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-novey-blue text-sm font-medium hover:underline">
      {children}
    </button>
  );
}
