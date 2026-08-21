'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Shell compartido de las pantallas de registro (Figma "Desktop - cuenta
// particular" 5579:2759 y "Desktop - Cuenta empresa" 5579:3613): panel azul
// con mini-login + panel derecho con tabs Cuenta personal / Cuenta empresa.

const IMG = {
  logo: '/figma/novey-white.svg',
  back: '/figma/back-arrow.svg',
  eye: '/figma/eye.svg',
  info: '/figma/info.svg',
};

export function InfoIcon({ tip }: { tip: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={IMG.info} alt="" title={tip} className="h-3.5 w-3.5 shrink-0" />
  );
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  className = '',
}: {
  label?: string;
  placeholder: string;
  type?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-[13px] font-semibold leading-4 text-text-primary">{label}</span>}
      <span className="relative block">
        <input
          type={isPassword && show ? 'text' : type}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border-light bg-white px-4 py-3 text-[14px] leading-5 text-text-primary placeholder:text-text-tertiary focus:border-novey-blue focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-novey hover:bg-gray-50 ${show ? 'opacity-100' : 'opacity-60'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.eye} alt="" className="h-5 w-5" />
          </button>
        )}
      </span>
    </label>
  );
}

export function SelectField({
  label,
  placeholder,
  options,
  className = '',
}: {
  label?: string;
  placeholder: string;
  options: string[];
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-[13px] font-semibold leading-4 text-text-primary">{label}</span>}
      <span className="relative block">
        <select
          defaultValue=""
          className="w-full appearance-none rounded-lg border border-border-light bg-white px-4 py-3 text-[14px] leading-5 text-text-tertiary focus:border-novey-blue focus:outline-none [&:has(option:checked:not([value='']))]:text-text-primary"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}

export function RadioGroup({
  name,
  options,
  defaultValue,
  tip,
}: {
  name: string;
  options: string[];
  defaultValue: string;
  tip?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex flex-wrap items-center gap-4" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => setValue(o)}
          className="flex min-h-8 items-center gap-2"
        >
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors ${
              value === o ? 'border-novey-blue' : 'border-border-medium'
            }`}
          >
            {value === o && <span className="h-2.5 w-2.5 rounded-full bg-novey-blue" />}
          </span>
          <span className="text-[13px] leading-4 text-text-primary">{o}</span>
        </button>
      ))}
      {tip && <InfoIcon tip={tip} />}
    </div>
  );
}

function MiniLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) router.push('/');
      }}
      className="hidden w-full max-w-[320px] flex-col gap-3 lg:flex"
    >
      <h2 className="text-[18px] font-bold leading-6 text-white">Inicia sesión en tu cuenta</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        aria-label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-[13px] leading-5 text-text-primary placeholder:text-text-tertiary focus:outline-none"
      />
      <span className="relative block">
        <input
          type={show ? 'text' : 'password'}
          placeholder="Contraseña"
          aria-label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 pr-11 text-[13px] leading-5 text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center opacity-60 hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.eye} alt="" className="h-4 w-4" />
        </button>
      </span>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={remember}
          onClick={() => setRemember((v) => !v)}
          className="flex items-center gap-2"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              remember ? 'border-white bg-white' : 'border-white/60 bg-transparent'
            }`}
          >
            {remember && (
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-novey-blue" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 13 4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-[11px] leading-4 text-white">
            Recordarme (o &lsquo;Mantener sesión iniciada&rsquo;)
          </span>
        </button>
        <Link href="#recuperar-contrasena" className="text-[11px] leading-4 text-white underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full rounded-novey px-6 py-2.5 text-[14px] leading-5 transition-colors duration-150 ${
          canSubmit
            ? 'bg-white text-novey-blue hover:bg-novey-blue-light'
            : 'cursor-not-allowed bg-[#f3f4f6] text-text-disabled'
        }`}
      >
        Iniciar Sesión
      </button>
    </form>
  );
}

export function AccountTypeTabs({ active }: { active: 'personal' | 'empresa' }) {
  const tabs = [
    { key: 'personal', label: 'Cuenta personal', href: '/registro-personal' },
    { key: 'empresa', label: 'Cuenta empresa', href: '/registro-empresa' },
  ] as const;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] leading-4 text-text-secondary">¿Qué tipo de cuenta querés crear?</p>
      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-border-light bg-[#f3f4f6]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active === t.key ? 'page' : undefined}
            className={`flex h-11 items-center justify-center text-[13px] font-semibold transition-colors duration-150 ${
              active === t.key
                ? 'rounded-lg border border-border-light bg-white text-novey-blue shadow-card'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AuthShell({
  active,
  children,
}: {
  active: 'personal' | 'empresa';
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel azul de marca + mini login (solo desktop) */}
      <aside className="flex flex-col gap-4 bg-novey-blue p-4 lg:w-[30%] lg:min-w-[340px] lg:max-w-[420px] lg:gap-7 lg:p-10">
        <button
          type="button"
          onClick={() => router.push('/login')}
          aria-label="Volver al inicio de sesión"
          className="flex h-11 w-11 items-center justify-center rounded-novey transition-colors duration-150 hover:bg-white/10 lg:-m-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.back} alt="" className="h-6 w-6" />
        </button>
        <Link href="/" aria-label="Novey — inicio" className="w-[110px] lg:w-[140px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.logo} alt="Novey" className="h-auto w-full" />
        </Link>
        <h1 className="text-[20px] font-bold leading-tight text-white lg:text-[26px]">
          Accedé a tu cuenta de Novey con tu dirección de correo electrónico y tu contraseña.
        </h1>
        <p className="hidden text-[13px] leading-5 text-white/85 lg:block">
          Crea una cuenta personal o empresarial en Novey para guardar tu carrito, revisar pedidos
          anteriores, gestionar tus direcciones de envío y disfrutar de una experiencia personalizada.
        </p>
        <MiniLogin />
      </aside>

      {/* Panel derecho: tabs + formulario */}
      <main className="flex flex-1 justify-center bg-white px-4 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="flex w-full max-w-[720px] flex-col gap-6">
          <AccountTypeTabs active={active} />
          {children}
        </div>
      </main>
    </div>
  );
}
