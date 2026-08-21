'use client';

// UI compartida del flujo "Rastrear mi orden" según Figma "15 · Mejoras UX"
// (desktop 4988:134885 / 4988:133260 · mobile 4988:134571 / 4988:133639).
// Shell: breadcrumb + sidebar de cuenta (desktop) + kicker/título; cards de
// búsqueda, pedidos recientes y strip de ayuda reutilizadas en ambas pantallas.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

/* ── Íconos línea (mismo estilo que MobileMenu) ─────────────────────────── */

export function Icon({ path, className = 'h-5 w-5' }: { path: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export const IC = {
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
  list: <><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  pin: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  card: <><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  truck: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 10v3l2 2" /><path d="M9 2h6" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92" />,
  whatsapp: <><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></>,
  chevronR: <path d="m9 18 6-6-6-6" />,
};

/* ── Datos del flujo ────────────────────────────────────────────────────── */

export const DEFAULT_PEDIDO = 'NW-000104847';

export const RECENT_ORDERS = [
  { nro: 'NW-000101295', status: 'Entregado', date: '17 abr', year: '2026', items: '2 productos', price: '$129.99' },
  { nro: 'NW-000101292', status: 'Entregado', date: '17 abr', year: '2026', items: '5 productos', price: '$54.32' },
  { nro: 'NW-000101289', status: 'Entregado', date: '17 abr', year: '2026', items: '1 producto', price: '$22.10' },
  { nro: 'NW-000099825', status: 'Entregado', date: '08 abr', year: '2026', items: '8 productos', price: '$215.50' },
  { nro: 'NW-000099142', status: 'Cancelado', date: '02 abr', year: '2026', items: '3 productos', price: '$48.20' },
] as const;

// Acepta "NW-000104847", "nw000104847" o solo dígitos; devuelve el número
// canónico o null si el formato no sirve.
export function normalizePedido(raw: string): string | null {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '');
  const m = clean.match(/^(?:NW-?)?(\d{4,12})$/);
  return m ? `NW-${m[1]}` : null;
}

/* ── Sidebar de cuenta (solo desktop) ───────────────────────────────────── */

const ACCOUNT_MENU = [
  { label: 'Mi cuenta', icon: IC.user, href: '#' },
  { label: 'Mis facturas', icon: IC.file, href: '#' },
  { label: 'Mis pedidos web', icon: IC.box, href: '/rastrear-orden', active: true, badge: 5 },
  { label: 'Mis listas de reposición', icon: IC.list, href: '#' },
  { label: 'Favoritos', icon: IC.heart, href: '#' },
  { label: 'Mis direcciones', icon: IC.pin, href: '#' },
  { label: 'Información de la cuenta', icon: IC.info, href: '#' },
  { label: 'Métodos de pago almacenados', icon: IC.card, href: '#' },
  { label: 'Tarjeta de regalo', icon: IC.gift, href: '#' },
];

function AccountSidebar() {
  return (
    <aside className="hidden lg:block" aria-label="Mi cuenta">
      {/* Card azul de saludo + Puntos Gordos */}
      <div className="rounded-xl bg-novey-blue-dark p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[18px] font-bold text-novey-blue-dark">
            FC
          </span>
          <span>
            <span className="block text-[12px] leading-4 text-[#B3D9FF]">Hola,</span>
            <span className="block text-[15px] font-bold leading-5 text-white">Francisco Cedeño</span>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[10px] bg-novey-navy px-4 py-3">
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-[#FFD94D]">
              Puntos Gordos
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-white">$6.30</span>
              <span className="text-[11px] text-[#B3D9FF]">· 52 pts</span>
            </span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/puntos-gordos.png" alt="" className="h-11 w-auto shrink-0" />
        </div>
      </div>

      {/* Menú de cuenta */}
      <nav className="mt-4 rounded-xl border border-border-light bg-white py-2" aria-label="Secciones de mi cuenta">
        <ul>
          {ACCOUNT_MENU.map((item) => (
            <li key={item.label} className="relative">
              {item.active && <span aria-hidden="true" className="absolute inset-y-1 left-0 w-[3px] rounded-r bg-novey-blue-dark" />}
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`flex min-h-10 items-center gap-3 px-4 py-2 text-[12px] transition-colors duration-150 ${
                  item.active
                    ? 'bg-novey-blue-bg font-semibold text-novey-blue-dark'
                    : 'font-medium text-[#0F121A] hover:bg-[#F7F8FA]'
                }`}
              >
                <Icon path={item.icon} className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-novey-red text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li>
            <a href="#" className="flex min-h-10 items-center gap-3 px-4 py-2 text-[12px] font-medium text-novey-red hover:bg-feedback-error-bg">
              <Icon path={IC.logout} className="h-[18px] w-[18px]" />
              Cerrar sesión
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

/* ── Shell de la página ─────────────────────────────────────────────────── */

export function TrackShell({
  status,
  statusTone,
  subtitle,
  children,
}: {
  status: string;
  statusTone: 'muted' | 'success';
  subtitle: string;
  children: React.ReactNode;
}) {
  const statusColor = statusTone === 'success' ? 'text-[#21A657]' : 'text-[#5C6373]';
  const dotColor = statusTone === 'success' ? 'bg-[#21A657]' : 'bg-[#8C94A1]';

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F8FA]">
        {/* Header mobile: "Mi cuenta" + título (frames 390) */}
        <div className="border-b border-border-light bg-white px-4 pb-3 pt-2.5 lg:hidden">
          <p className="text-[11px] leading-4 text-[#5C6373]">Mi cuenta</p>
          <h1 className="text-[16px] font-bold leading-6 text-[#0F121A]">Rastrear mi pedido</h1>
        </div>

        <div className="mx-auto max-w-page px-4 pb-10 pt-4 md:px-6 lg:pb-14">
          {/* Breadcrumb (desktop) */}
          <nav aria-label="Ruta de navegación" className="hidden items-center gap-2 pb-5 pt-1 text-[13px] text-[#5C6373] lg:flex">
            <Link href="/" className="transition-colors duration-150 hover:text-novey-blue">Inicio</Link>
            <Icon path={IC.chevronR} className="h-3.5 w-3.5 text-[#8C94A1]" />
            <a href="#" className="transition-colors duration-150 hover:text-novey-blue">Mi cuenta</a>
            <Icon path={IC.chevronR} className="h-3.5 w-3.5 text-[#8C94A1]" />
            <span aria-current="page" className="font-semibold text-[#0F121A]">Rastrear mi pedido</span>
          </nav>

          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
            <AccountSidebar />

            <div className="min-w-0">
              {/* Kicker de estado */}
              <p className="flex items-center gap-2 text-[11px]">
                <span className="hidden font-bold uppercase tracking-[0.08em] text-novey-blue-dark lg:inline">
                  Estado de envío
                </span>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <span className={`font-semibold ${statusColor}`}>{status}</span>
              </p>

              <h1 className="hidden pt-1 text-[32px] font-bold leading-tight text-[#0F121A] lg:block">
                Rastrear mi pedido
              </h1>
              <p className="pt-2 text-[13px] leading-5 text-[#5C6373] lg:pt-1.5 lg:text-[14px]">{subtitle}</p>

              <div className="flex flex-col gap-4 pt-4 lg:gap-6 lg:pt-6">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Card: Buscar otro pedido ───────────────────────────────────────────── */

export function SearchOrderCard() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === '') {
      setError('Ingresa el número de tu pedido.');
      return;
    }
    const pedido = normalizePedido(value);
    if (!pedido) {
      setError('Revisa el formato del número. Debe verse como NW-000104847.');
      return;
    }
    setError(null);
    router.push(`/rastrear-orden/seguimiento?pedido=${encodeURIComponent(pedido)}`);
  };

  return (
    <section className="rounded-xl border border-border-light bg-white p-4 shadow-card lg:p-6" aria-labelledby="buscar-pedido-titulo">
      <h2 id="buscar-pedido-titulo" className="text-[14px] font-bold text-[#0F121A] lg:text-[16px]">
        Buscar otro pedido
      </h2>
      <p className="pt-0.5 text-[11px] text-[#5C6373] lg:text-[13px]">
        Escribe el número y mira el estado del envío.
      </p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2.5 pt-3.5 sm:flex-row lg:gap-3">
        <div className="min-w-0 flex-1">
          <div className="relative">
            <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-feedback-error-dark' : 'text-[#8C94A1]'}`}>
              <Icon path={IC.box} className="h-[18px] w-[18px]" />
            </span>
            <label htmlFor="numero-pedido" className="sr-only">
              Número de pedido
            </label>
            <input
              id="numero-pedido"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="Ej. NW-000104847"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'numero-pedido-error' : undefined}
              className={`h-[48px] w-full rounded-novey border bg-white pl-11 pr-4 text-[13px] text-[#0F121A] placeholder:text-[#8C94A1] focus:outline-none focus:ring-2 lg:h-[52px] lg:text-[14px] ${
                error
                  ? 'border-feedback-error-dark focus:ring-feedback-error-dark/30'
                  : 'border-border-light focus:border-novey-blue focus:ring-novey-blue/25'
              }`}
            />
          </div>
          {error && (
            <p id="numero-pedido-error" role="alert" className="pt-1.5 text-[12px] leading-4 text-feedback-error-dark">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-novey bg-novey-blue-dark px-8 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-novey-navy lg:h-[52px] lg:text-[14px]"
        >
          <Icon path={IC.timer} className="h-[18px] w-[18px]" />
          Rastrear
        </button>
      </form>
    </section>
  );
}

/* ── Card: Tus pedidos recientes ────────────────────────────────────────── */

function StatusBadge({ status }: { status: 'Entregado' | 'Cancelado' }) {
  const ok = status === 'Entregado';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold lg:text-[10px] ${
        ok ? 'bg-feedback-success-bg text-[#21A657]' : 'bg-feedback-error-bg text-novey-red'
      }`}
    >
      {status}
    </span>
  );
}

export function RecentOrdersCard() {
  return (
    <section className="rounded-xl border border-border-light bg-white p-4 shadow-card lg:p-6" aria-labelledby="pedidos-recientes-titulo">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="pedidos-recientes-titulo" className="text-[14px] font-bold text-[#0F121A] lg:text-[16px]">
            Tus pedidos recientes
          </h2>
          <p className="pt-0.5 text-[11px] text-[#5C6373] lg:text-[13px]">
            <span className="lg:hidden">Los últimos 5 pedidos.</span>
            <span className="hidden lg:inline">Los últimos 5 pedidos que has hecho.</span>
          </p>
        </div>
        <a href="#" className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-novey-blue-dark transition-colors duration-150 hover:text-novey-blue lg:text-[13px]">
          Ver todos
          <Icon path={IC.chevronR} className="h-3.5 w-3.5" />
        </a>
      </div>

      <ul className="pt-3">
        {RECENT_ORDERS.map((o) => (
          <li key={o.nro} className="flex min-h-[68px] items-center gap-3 border-t border-border-light py-3 first:border-t-0 lg:min-h-[76px] lg:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-novey bg-[#F3F4F6] text-[#0F121A] lg:h-12 lg:w-12">
              <Icon path={IC.box} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#0F121A] lg:text-[14px]">{o.nro}</span>
                <StatusBadge status={o.status} />
              </p>
              <p className="truncate pt-0.5 text-[10px] text-[#5C6373] lg:text-[12px]">
                {o.date} · <span className="hidden lg:inline">{o.year} · </span>
                {o.items} · {o.price}
              </p>
            </div>
            {/* Desktop: botón outline · Mobile: chevron (fila completa igual altura) */}
            <Link
              href={`/rastrear-orden/seguimiento?pedido=${o.nro}`}
              className="hidden h-10 shrink-0 items-center gap-2 rounded-novey border border-border-light bg-white px-4 text-[12px] font-semibold text-[#0F121A] transition-colors duration-150 hover:border-novey-blue hover:text-novey-blue lg:flex"
            >
              Ver seguimiento
              <Icon path={IC.chevronR} className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/rastrear-orden/seguimiento?pedido=${o.nro}`}
              aria-label={`Ver seguimiento del pedido ${o.nro}`}
              className="flex h-10 w-8 shrink-0 items-center justify-center text-[#8C94A1] lg:hidden"
            >
              <Icon path={IC.chevronR} className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Strip de ayuda ─────────────────────────────────────────────────────── */

export function HelpStrip() {
  return (
    <section className="rounded-xl bg-novey-blue-bg p-4 lg:flex lg:items-center lg:gap-4 lg:px-6 lg:py-5" aria-labelledby="ayuda-titulo">
      <div className="flex items-center gap-3 lg:flex-1">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-novey-blue sm:flex">
          <Icon path={IC.help} className="h-6 w-6" />
        </span>
        <div>
          <h2 id="ayuda-titulo" className="text-[13px] font-bold text-[#0F121A] lg:text-[14px]">
            ¿No encuentras tu pedido?
          </h2>
          <p className="pt-0.5 text-[11px] text-[#5C6373] lg:text-[12px]">
            <span className="lg:hidden">Te ayudamos enseguida.</span>
            <span className="hidden lg:inline">Escríbenos por WhatsApp y te ayudamos enseguida.</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-3 sm:flex-row lg:shrink-0 lg:pt-0">
        <a
          href="https://wa.me/50764336170"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-center gap-2 rounded-novey bg-[#22C55E] px-5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-[#16A34A] lg:text-[13px]"
        >
          <Icon path={IC.whatsapp} className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </section>
  );
}
