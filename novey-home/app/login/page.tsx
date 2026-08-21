'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveSession } from '../../lib/session';

// Login según Figma "Desktop — Login" (6185:2376): panel azul de marca +
// formulario con registro personal/empresa. Mobile: header azul compacto.
const IMG = {
  logo: '/figma/novey-white.svg',
  back: '/figma/back-arrow.svg',
  eye: '/figma/eye.svg',
  check: '/figma/check-white.svg',
  info: '/figma/info.svg',
  user: '/figma/user-blue.svg',
  building: '/figma/building-blue.svg',
};

const ACCOUNT_CARDS = [
  {
    icon: IMG.user,
    title: 'Crear cuenta personal',
    desc: 'Para compras individuales con Cédula, Pasaporte o datos fiscales (RUC / NT) y flujos de compra estándar.',
    badge: 'Acceso directo',
    badgeClass: 'bg-feedback-success-bg text-feedback-success-dark',
    dotClass: 'bg-feedback-success-dark',
    href: '/registro-personal',
  },
  {
    icon: IMG.building,
    title: 'Crear cuenta empresa',
    desc: 'Para empresas que requieren estructuras de equipo, roles de usuario, flujos de aprobación y preórdenes.',
    badge: 'Requiere aprobación',
    badgeClass: 'bg-novey-blue-bg text-novey-blue-dark',
    dotClass: 'bg-novey-blue-dark',
    href: '/registro-empresa',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Persistimos el perfil disponible. Este formulario sólo pide correo, así
    // que el nombre queda pendiente y el checkout lo va a pedir en el paso 1.
    saveSession({ email: email.trim() });
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Bloque de marca (azul) */}
      <aside className="flex flex-col gap-4 bg-novey-blue p-4 lg:h-auto lg:w-[44%] lg:max-w-[634px] lg:gap-8 lg:p-16">
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="Volver al inicio"
          className="flex h-11 w-11 items-center justify-center rounded-novey transition-colors duration-150 hover:bg-white/10 lg:-m-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.back} alt="" className="h-6 w-6" />
        </button>
        <Link href="/" aria-label="Novey — inicio" className="w-[120px] lg:w-[167px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.logo} alt="Novey" className="h-auto w-full" />
        </Link>
        <h1 className="max-w-[506px] text-[24px] font-bold leading-tight text-white lg:text-[32px]">
          Accedé a tu cuenta de Novey con tu dirección de correo electrónico y tu contraseña.
        </h1>
        <p className="hidden max-w-[432px] text-[14px] leading-5 text-white/85 lg:block">
          Crea una cuenta personal o empresarial en Novey para guardar tu carrito, revisar pedidos
          anteriores, gestionar tus direcciones de envío y disfrutar de una experiencia personalizada.
        </p>
      </aside>

      {/* Panel derecho */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-white px-4 py-10 sm:px-10 lg:px-[120px] lg:py-16">
        <form onSubmit={onSubmit} className="flex w-full max-w-[566px] flex-col gap-4 lg:px-1.5">
          <h2 className="text-[23px] font-bold leading-tight text-text-primary">
            Accede a tu cuenta de Novey con tu correo electrónico y contraseña.
          </h2>

          <label className="sr-only" htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-4 py-3 text-[14px] leading-5 text-text-primary placeholder:text-text-tertiary focus:border-novey-blue focus:outline-none"
          />

          <div className="relative">
            <label className="sr-only" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-white px-4 py-3 pr-12 text-[14px] leading-5 text-text-primary placeholder:text-text-tertiary focus:border-novey-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-novey transition-opacity hover:bg-gray-50 ${showPassword ? 'opacity-100' : 'opacity-60'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.eye} alt="" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                aria-label="Recordarme"
                onClick={() => setRemember((v) => !v)}
                className={`flex h-[18px] w-[18px] items-center justify-center rounded border transition-colors duration-150 ${
                  remember ? 'border-novey-blue bg-novey-blue' : 'border-border-medium bg-white'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {remember && <img src={IMG.check} alt="" className="h-[18px] w-[18px]" />}
              </button>
              <span className="text-[12px] leading-4 text-text-primary">
                Recordarme (tú decides cuándo cerrar sesión)
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.info}
                alt=""
                title="Mantendremos tu sesión abierta en este dispositivo"
                className="h-3.5 w-3.5"
              />
            </div>
            <a href="#recuperar-contrasena" className="text-[14px] leading-5 text-novey-blue hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-1 w-full rounded-novey px-6 py-3.5 text-[16px] leading-6 transition-colors duration-150 sm:w-[253px] ${
              canSubmit
                ? 'bg-novey-blue text-white hover:bg-novey-blue-dark active:bg-novey-navy'
                : 'cursor-not-allowed border border-border-light bg-[#f3f4f6] text-text-disabled'
            }`}
          >
            iniciar sesion
          </button>
        </form>

        <hr className="w-full max-w-[440px] border-border-light" />

        <section aria-label="Opciones de registro" className="flex w-full max-w-[566px] flex-col gap-3">
          <p className="text-[14px] font-medium leading-5 text-text-secondary">
            ¿No tienes una cuenta? Elige cómo quieres registrarte.
          </p>
          {ACCOUNT_CARDS.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="flex items-center gap-4 rounded-xl border border-border-light bg-white p-5 transition-colors duration-150 hover:border-novey-blue"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-novey-blue-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.icon} alt="" className="h-[22px] w-[22px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-5 text-text-primary">
                  {card.title}
                </span>
                <span className="mt-1 block text-[12px] leading-4 text-text-secondary">{card.desc}</span>
              </span>
              <span
                className={`hidden shrink-0 items-center gap-1 rounded-novey px-2 py-1 text-[10px] font-semibold sm:flex ${card.badgeClass}`}
              >
                <span aria-hidden="true" className={`h-[5px] w-[5px] rounded-full ${card.dotClass}`} />
                {card.badge}
              </span>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
