'use client';

import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, type Department } from '../data/departments-menu';
import { ROUTES } from '../lib/routes';

// Mega-menú "Departamentos" (Figma: Menu - Departamentos Desktop, página Revision).
// Renderiza el pill disparador + el panel anclado bajo la barra de pills del navbar.
// Desktop: rail de departamentos + panel con toggle Visual/Lista.
// Mobile: panel full-width de dos niveles (departamentos → subcategorías).

type ViewMode = 'visual' | 'lista';

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

/* ---------- piezas compartidas ---------- */

function FeaturedCircles({ dept, dense = false }: { dept: Department; dense?: boolean }) {
  return (
    <div className={dense ? 'scroll-x flex gap-4' : 'flex flex-wrap gap-x-8 gap-y-4'}>
      {dept.featured.map((f) => (
        <a
          key={f.name}
          href={ROUTES.categoria}
          className={`group flex shrink-0 flex-col items-center gap-2 ${dense ? 'w-[76px]' : 'w-[92px]'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={f.image}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full border border-border-light object-cover transition-transform duration-150 group-hover:scale-105"
          />
          <span className="text-center text-[13px] leading-snug text-text-ink group-hover:text-novey-blue">
            {f.name}
          </span>
        </a>
      ))}
    </div>
  );
}

function SubcategoryColumn({
  column,
  underlined,
}: {
  column: Department['columns'][number];
  underlined: boolean;
}) {
  return (
    <div>
      <h4
        className={`text-[15px] font-semibold text-text-ink ${
          underlined ? 'border-b-2 border-novey-blue pb-2' : ''
        }`}
      >
        {column.title}
      </h4>
      <ul className={`space-y-2.5 ${underlined ? 'mt-3' : 'mt-2.5'}`}>
        {column.items.map((item) => (
          <li key={item}>
            <a href={ROUTES.categoria} className="text-[13px] text-text-secondary transition-colors duration-150 hover:text-novey-blue">
              {item}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-border-light pt-3">
        <a href={ROUTES.categoria} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-novey-blue hover:underline">
          {underlined ? column.viewAll : 'Ver todo'}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const base = 'flex h-[34px] items-center gap-1.5 rounded-novey px-3 text-[13px] transition-colors duration-150';
  const active = 'border border-border-light bg-white font-medium text-novey-blue shadow-card';
  const inactive = 'text-text-tertiary hover:text-text-ink';
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-novey bg-[#f3f4f6] p-1" role="group" aria-label="Modo de vista">
      <button type="button" aria-pressed={mode === 'visual'} onClick={() => onChange('visual')} className={`${base} ${mode === 'visual' ? active : inactive}`}>
        <GridIcon className="h-4 w-4" />
        Visual
      </button>
      <button type="button" aria-pressed={mode === 'lista'} onClick={() => onChange('lista')} className={`${base} ${mode === 'lista' ? active : inactive}`}>
        <ListIcon className="h-4 w-4" />
        Lista
      </button>
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function DepartmentsMenu() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>('visual');
  const [activeSlug, setActiveSlug] = useState(DEPARTMENTS[0].slug);
  // Nivel mobile: null = lista de departamentos, slug = detalle de uno.
  const [mobileDept, setMobileDept] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeDept = DEPARTMENTS.find((d) => d.slug === activeSlug) ?? DEPARTMENTS[0];
  const mobileActive = mobileDept ? DEPARTMENTS.find((d) => d.slug === mobileDept) ?? null : null;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    setOpen((v) => {
      if (!v) setMobileDept(null); // al abrir en mobile, arrancar en la lista
      return !v;
    });
  };

  return (
    <div ref={rootRef} className="contents">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="departments-menu"
        onClick={toggle}
        className={`flex h-[33px] shrink-0 items-center gap-2 whitespace-nowrap rounded-novey px-3 text-[12px] transition-colors duration-150 ${
          open ? 'bg-novey-blue text-white' : 'bg-white text-novey-navy hover:bg-novey-blue hover:text-white'
        }`}
      >
        Departamentos
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id="departments-menu" className="absolute inset-x-0 top-full z-50">
          {/* ---------- Desktop ---------- */}
          <div className="hidden px-6 pt-2 lg:block">
            <div className="flex max-h-[calc(100vh-190px)] max-w-page items-stretch overflow-hidden rounded-novey border border-border-light bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              {/* Rail de departamentos */}
              <div className="flex w-[272px] shrink-0 flex-col border-r border-border-light bg-[#fafbfc]">
                <p className="border-b border-border-light px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Departamentos
                </p>
                <ul className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
                  {DEPARTMENTS.map((d) => {
                    const isActive = d.slug === activeDept.slug;
                    return (
                      <li key={d.slug}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveSlug(d.slug)}
                          onFocus={() => setActiveSlug(d.slug)}
                          onClick={() => setActiveSlug(d.slug)}
                          aria-current={isActive ? 'true' : undefined}
                          className={`flex w-full items-center justify-between gap-2 rounded-novey border px-3 py-[9px] text-left text-[13px] transition-colors duration-150 ${
                            isActive
                              ? 'border-novey-blue bg-novey-blue-bg font-medium text-novey-blue'
                              : 'border-transparent text-text-ink hover:bg-gray-100'
                          }`}
                        >
                          {d.name}
                          <ChevronRightIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-novey-blue' : 'text-text-disabled'}`} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Panel de contenido */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4 border-b border-border-light px-8 pb-5 pt-6">
                  <div className="min-w-0">
                    <h3 className="text-[22px] font-bold leading-tight text-text-ink">{activeDept.name}</h3>
                    <p className="mt-1 text-[14px] text-text-tertiary">{activeDept.subtitle}</p>
                  </div>
                  <ViewToggle mode={mode} onChange={setMode} />
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
                  {mode === 'visual' ? (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                        Categorías destacadas
                      </p>
                      <div className="mt-4">
                        <FeaturedCircles dept={activeDept} />
                      </div>
                      <div className="mt-9 grid grid-cols-3 gap-x-10 gap-y-9">
                        {activeDept.columns.map((col) => (
                          <SubcategoryColumn key={col.title} column={col} underlined />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-4 gap-x-8 gap-y-8">
                      {activeDept.columns.map((col) => (
                        <SubcategoryColumn key={col.title} column={col} underlined={false} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Mobile (dos niveles) ---------- */}
          <div className="max-h-[calc(100vh-160px)] overflow-y-auto border-b border-border-light bg-white shadow-lg lg:hidden">
            {!mobileActive ? (
              <nav aria-label="Departamentos" className="px-4 py-2">
                <p className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Departamentos
                </p>
                <ul>
                  {DEPARTMENTS.map((d) => (
                    <li key={d.slug}>
                      <button
                        type="button"
                        onClick={() => setMobileDept(d.slug)}
                        className="flex min-h-11 w-full items-center justify-between gap-2 border-b border-border-light px-1 py-3 text-left text-[15px] text-text-ink"
                      >
                        {d.name}
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled" />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileDept(null)}
                  className="flex min-h-11 items-center gap-2 text-[14px] font-medium text-novey-blue"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Departamentos
                </button>
                <h3 className="mt-1 text-[20px] font-bold leading-tight text-text-ink">{mobileActive.name}</h3>
                <p className="mt-0.5 text-[13px] text-text-tertiary">{mobileActive.subtitle}</p>

                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Categorías destacadas
                </p>
                <div className="mt-3">
                  <FeaturedCircles dept={mobileActive} dense />
                </div>

                <div className="mt-6 space-y-7 pb-4">
                  {mobileActive.columns.map((col) => (
                    <SubcategoryColumn key={col.title} column={col} underlined />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
