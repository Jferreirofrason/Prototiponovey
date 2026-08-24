'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEPARTMENTS } from '../data/departments-menu';
import { BRAND_SITES } from '../lib/brands';

// Menú mobile según Figma "Mobile Menu Design" (5806:21371), variante sin
// sesión: header "Iniciar Sesión / o crear cuenta" desplegable, tienda,
// accesos, y navegación de departamentos en 3 niveles (menú → lista → detalle).

type Level = { view: 'main' } | { view: 'departments' } | { view: 'dept'; slug: string };

function Icon({ path, className = 'h-5 w-5' }: { path: React.ReactNode; className?: string }) {
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

const IC = {
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  pin: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  tag: <><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" /></>,
  grid: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></>,
  help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92" /></>,
  whatsapp: <><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></>,
  login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>,
  chevronR: <path d="m9 18 6-6-6-6" />,
  chevronD: <path d="m6 9 6 6 6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
};

function LevelHeader({ title, onBack, onClose }: { title: string; onBack: () => void; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
      <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 text-[15px] font-bold text-text-primary">
        <Icon path={IC.back} className="h-5 w-5" />
        {title}
      </button>
      <button type="button" onClick={onClose} aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center">
        <Icon path={IC.close} className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<Level>({ view: 'main' });
  const [accountOpen, setAccountOpen] = useState(false);

  const dept = level.view === 'dept' ? DEPARTMENTS.find((d) => d.slug === level.slug) : undefined;

  return (
    <div
      id="mobile-menu"
      className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-100%)] overflow-y-auto border-b border-border-light bg-white shadow-lg lg:hidden"
    >
      {level.view === 'main' && (
        <nav aria-label="Menú principal" className="flex flex-col">
          {/* Iniciar sesión / crear cuenta (desplegable) */}
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            className="flex items-center gap-3 border-b border-border-light px-4 py-3.5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-novey-blue-bg text-novey-blue">
              <Icon path={IC.user} />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold leading-5 text-text-primary">Iniciar Sesión</span>
              <span className="block text-[12px] leading-4 text-text-tertiary">o crear cuenta</span>
            </span>
            <Icon path={accountOpen ? IC.chevronD : IC.chevronR} className="h-4 w-4 text-text-tertiary" />
          </button>
          {accountOpen && (
            <div className="border-b border-border-light">
              <Link href="/login" onClick={onClose} className="flex items-center gap-3 px-4 py-3">
                <span className="text-novey-blue"><Icon path={IC.login} /></span>
                <span>
                  <span className="block text-[14px] font-semibold leading-5 text-text-primary">Iniciar sesión</span>
                  <span className="block text-[12px] leading-4 text-text-tertiary">Accede a tu cuenta</span>
                </span>
              </Link>
              <Link href="/registro-personal" onClick={onClose} className="flex items-center gap-3 px-4 py-3">
                <span className="text-novey-blue"><Icon path={IC.user} /></span>
                <span>
                  <span className="block text-[14px] font-semibold leading-5 text-text-primary">Crear cuenta nueva</span>
                  <span className="block text-[12px] leading-4 text-text-tertiary">Regístrate gratis</span>
                </span>
              </Link>
            </div>
          )}

          {/* Tu tienda */}
          <div className="flex items-center gap-3 border-b border-border-light bg-novey-blue-bg px-4 py-3">
            <span className="text-novey-blue"><Icon path={IC.pin} /></span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Tu tienda</span>
              <span className="block text-[14px] font-bold leading-5 text-text-primary">Novey Coronado</span>
            </span>
          </div>

          {/* Accesos */}
          <ul className="flex flex-col py-1">
            <li>
              <Link href="/productos" onClick={onClose} className="flex min-h-11 items-center gap-3 px-4 py-2.5">
                <span className="text-[#F97316]"><Icon path={IC.tag} /></span>
                <span className="text-[14px] font-semibold text-text-primary">Ver ofertas</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setLevel({ view: 'departments' })}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left"
              >
                <span className="text-text-secondary"><Icon path={IC.grid} /></span>
                <span className="flex-1 text-[14px] text-text-primary">Ver todos los productos</span>
                <Icon path={IC.chevronR} className="h-4 w-4 text-text-tertiary" />
              </button>
            </li>
            <li>
              <Link href="/rastrear-orden" onClick={onClose} className="flex min-h-11 items-center gap-3 px-4 py-2.5">
                <span className="text-text-secondary"><Icon path={IC.search} /></span>
                <span className="text-[14px] text-text-primary">¿Dónde está mi pedido?</span>
              </Link>
            </li>
            <li>
              <a href="#puntos-gordos" className="flex min-h-11 items-center gap-3 px-4 py-2.5">
                <span className="text-text-secondary"><Icon path={IC.user} /></span>
                <span className="text-[14px] text-text-primary">Mis Puntos Gordos</span>
              </a>
            </li>
            <li>
              <a href="#catalogos" className="flex min-h-11 items-center gap-3 px-4 py-2.5">
                <span className="text-text-secondary"><Icon path={IC.book} /></span>
                <span className="text-[14px] text-text-primary">Ver catálogos</span>
              </a>
            </li>
            <li>
              <a href="#ayuda" className="flex min-h-11 items-center gap-3 px-4 py-2.5">
                <span className="text-text-secondary"><Icon path={IC.help} /></span>
                <span className="text-[14px] text-text-primary">Ayuda y soporte</span>
              </a>
            </li>
          </ul>

          {/* Sitios del grupo (selector global de marcas) */}
          <div className="border-t border-border-light px-4 py-3">
            <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Sitios del grupo
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {BRAND_SITES.map((b) => (
                <a
                  key={b.label}
                  href={b.url}
                  className={`min-h-8 py-1 text-[14px] ${
                    b.current ? 'font-extrabold italic text-novey-blue' : 'text-text-secondary'
                  } ${b.italic ? 'italic' : ''}`}
                >
                  {b.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-2.5 border-t border-border-light p-4">
            <a
              href="tel:3009200"
              className="flex h-11 items-center justify-center gap-2 rounded-novey border border-border-medium text-[14px] font-semibold text-text-primary transition-colors duration-150 hover:border-novey-blue"
            >
              <Icon path={IC.phone} className="h-4 w-4" />
              300-9200
            </a>
            <a
              href="https://wa.me/50764336170"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-novey bg-[#22C55E] text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#16A34A]"
            >
              <Icon path={IC.whatsapp} className="h-4 w-4" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </nav>
      )}

      {level.view === 'departments' && (
        <nav aria-label="Departamentos">
          <LevelHeader title="Departamentos" onBack={() => setLevel({ view: 'main' })} onClose={onClose} />
          <p className="px-4 pb-1 pt-3 text-[12px] leading-4 text-text-tertiary">
            {DEPARTMENTS.length} departamentos disponibles — desliza para ver más
          </p>
          <ul className="flex flex-col pb-2">
            {DEPARTMENTS.map((d) => (
              <li key={d.slug}>
                <button
                  type="button"
                  onClick={() => setLevel({ view: 'dept', slug: d.slug })}
                  className="flex min-h-11 w-full items-center justify-between px-4 py-2.5 text-left text-[14px] text-text-primary transition-colors duration-150 hover:bg-novey-blue-bg"
                >
                  {d.name}
                  <Icon path={IC.chevronR} className="h-4 w-4 text-text-tertiary" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {level.view === 'dept' && dept && (
        <nav aria-label={dept.name}>
          <LevelHeader title={dept.name} onBack={() => setLevel({ view: 'departments' })} onClose={onClose} />
          <ul className="flex flex-col py-2">
            <li>
              <Link
                href="/productos"
                onClick={onClose}
                className="flex min-h-11 items-center bg-novey-blue px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Ver todo en {dept.name}
              </Link>
            </li>
            {dept.categories.map((c) => (
              <li key={c.name}>
                <Link
                  href="/productos"
                  onClick={onClose}
                  className="flex min-h-11 items-center border-b border-border-light px-4 py-2.5 text-[14px] text-text-primary last:border-b-0"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
