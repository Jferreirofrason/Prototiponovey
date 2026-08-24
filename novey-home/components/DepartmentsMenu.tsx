'use client';

import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, type Category } from '../data/departments-menu';
import {
  MAX_DESTACADAS,
  etiquetaVerTodo,
  necesitaVerTodo,
  opcionesEnBloque,
  subcatsEnMenu,
} from '../lib/menu-reglas.mjs';
import { ROUTES } from '../lib/routes';

// Mega-menú "Departamentos".
//
// Jerarquía: departamento → subcategorías (bloques) → opciones.
// Las subcategorías van todas a la vista (tope 8, en filas de 4 en
// escritorio); cada bloque muestra hasta 5 opciones y una sexta línea
// "Ver todo (N)" —N = opciones ocultas— que abre la página completa de la
// subcategoría. Sin expansores dentro del menú.
//
// Dos maneras de recorrer, elegibles desde el encabezado (que queda fijo):
//   Visual — con las burbujas destacadas arriba para reconocer por foto.
//   Lista  — sin imágenes, para leer; mismos bloques y mismos conteos.
//
// El panel ocupa el mismo contenedor de 1276px que el resto de la página
// (su borde derecho termina donde termina "Copiar cupón"); solo el contenido
// derecho scrollea, el rail y el encabezado quedan fijos.
//
// Mobile y tablet: navegación por niveles (departamentos → categorías →
// opciones) con "← Volver"; en pantallas angostas la vista arranca en Lista.

type Vista = 'visual' | 'lista';
const VISTA_KEY = 'novey-menu-vista';

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

/** Ícono genérico de categoría para el placeholder (caja de producto). */
function BoxIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

/* ---------- piezas ---------- */

/**
 * Miniatura de una categoría. Sin imagen (o si la imagen falla) muestra un
 * ícono genérico de categoría sobre fondo neutro — nunca una inicial, que se
 * confunde con un avatar o un error.
 */
function CategoryThumb({ cat, size }: { cat: Category; size: number }) {
  const [failed, setFailed] = useState(false);
  const px = { width: size, height: size };
  if (!cat.image || failed) {
    return (
      <span
        style={px}
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-full border border-border-light bg-[#f3f4f6] text-text-tertiary"
      >
        <BoxIcon className="h-1/2 w-1/2" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cat.image}
      alt=""
      {...px}
      onError={() => setFailed(true)}
      style={px}
      className="shrink-0 rounded-full border border-border-light object-cover transition-transform duration-150 group-hover:scale-105"
    />
  );
}

/** Selector Visual / Lista: control segmentado de dos opciones. */
function ViewToggle({ vista, onChange }: { vista: Vista; onChange: (v: Vista) => void }) {
  const base = 'flex h-9 min-w-[84px] items-center justify-center gap-1.5 rounded-novey px-3 text-[13px] transition-colors duration-150';
  const activo = 'border border-novey-blue bg-white font-semibold text-novey-blue shadow-card';
  const inactivo = 'border border-transparent text-text-secondary hover:text-text-ink';
  return (
    <div role="tablist" aria-label="Cómo ver las categorías" className="flex shrink-0 items-center gap-1 rounded-novey bg-[#f3f4f6] p-1">
      <button type="button" role="tab" aria-selected={vista === 'visual'} onClick={() => onChange('visual')} className={`${base} ${vista === 'visual' ? activo : inactivo}`}>
        <GridIcon className="h-4 w-4" />
        Visual
      </button>
      <button type="button" role="tab" aria-selected={vista === 'lista'} onClick={() => onChange('lista')} className={`${base} ${vista === 'lista' ? activo : inactivo}`}>
        <ListIcon className="h-4 w-4" />
        Lista
      </button>
    </div>
  );
}

/** Fila de hasta 6 categorías destacadas (solo vista Visual). */
function FeaturedRow({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-5 md:grid-cols-4 xl:grid-cols-6">
      {categories.slice(0, MAX_DESTACADAS).map((cat) => (
        <li key={cat.name}>
          <a href={ROUTES.categoria} className="group flex min-h-11 flex-col items-center gap-2 text-center">
            <CategoryThumb cat={cat} size={72} />
            <span className="line-clamp-2 text-[13px] leading-snug text-text-ink group-hover:text-novey-blue group-hover:underline">
              {cat.name}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bloque de subcategoría: título, hasta 5 opciones y, SOLO si esconde
 * opciones, la sexta línea "Ver todo (N)" que abre su página completa.
 * Compacto a propósito: separador corto bajo el título, sin líneas que
 * atraviesen la columna ni relleno para igualar alturas.
 */
function CategoryBlock({ cat }: { cat: Category }) {
  const total = cat.items.length;
  return (
    <section aria-label={cat.name}>
      <h4>
        <a href={ROUTES.categoria} className="text-[14px] font-semibold text-novey-navy hover:text-novey-blue hover:underline">
          {cat.name}
        </a>
      </h4>
      <span aria-hidden="true" className="mb-1.5 mt-1 block h-px w-7 bg-border-medium" />
      {total > 0 ? (
        <ul>
          {cat.items.slice(0, opcionesEnBloque(total)).map((item) => (
            <li key={item}>
              <a
                href={ROUTES.categoria}
                className="flex min-h-[26px] items-center text-[13px] leading-tight text-novey-navy transition-colors duration-150 hover:text-novey-blue hover:underline"
              >
                {item}
              </a>
            </li>
          ))}
          {necesitaVerTodo(total) && (
            <li>
              <a
                href={ROUTES.categoria}
                aria-label={`Ver todo en ${cat.name} (${total - opcionesEnBloque(total)} opciones más)`}
                className="flex min-h-[26px] items-center text-[13px] font-medium text-novey-blue hover:underline"
              >
                {etiquetaVerTodo(total)}
              </a>
            </li>
          )}
        </ul>
      ) : (
        <p className="text-[13px] text-text-tertiary">Muy pronto vas a encontrar opciones acá.</p>
      )}
    </section>
  );
}

/* ---------- componente principal ---------- */

export default function DepartmentsMenu() {
  const [open, setOpen] = useState(false);
  const [vista, setVista] = useState<Vista>('visual');
  const [activeSlug, setActiveSlug] = useState(DEPARTMENTS[0]?.slug ?? '');
  // Niveles mobile: departamentos → subcategorías → opciones.
  const [mobileDept, setMobileDept] = useState<string | null>(null);
  const [mobileCat, setMobileCat] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Tolerancia al movimiento del mouse entre columnas: el cambio de
  // departamento espera un instante y se cancela si el puntero siguió de largo.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDept = DEPARTMENTS.find((d) => d.slug === activeSlug) ?? DEPARTMENTS[0];
  const mobileActiveDept = mobileDept ? DEPARTMENTS.find((d) => d.slug === mobileDept) ?? null : null;
  const mobileActiveCat = mobileActiveDept && mobileCat
    ? mobileActiveDept.categories.find((c) => c.name === mobileCat) ?? null
    : null;

  // La vista elegida se recuerda durante la sesión. En pantallas angostas la
  // primera vez arranca en Lista: es más fácil de recorrer en una columna.
  useEffect(() => {
    try {
      const guardada = window.sessionStorage.getItem(VISTA_KEY);
      if (guardada === 'visual' || guardada === 'lista') setVista(guardada);
      else if (window.matchMedia('(max-width: 767px)').matches) setVista('lista');
    } catch {
      /* sin storage: queda la vista por defecto */
    }
  }, []);

  const cambiarVista = (v: Vista) => {
    setVista(v);
    try {
      window.sessionStorage.setItem(VISTA_KEY, v);
    } catch {}
    // Posición predecible: el contenido vuelve al comienzo.
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const selectDept = (slug: string) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    // Cada departamento arranca desde arriba.
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const hoverDept = (slug: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => selectDept(slug), 120);
  };
  const cancelHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

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
      cancelHover();
    };
  }, [open]);

  // Flechas ↑/↓ recorren el rail sin perder el foco ni soltar el menú.
  const onRailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const botones = Array.from(railRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const i = botones.findIndex((b) => b === document.activeElement);
    const next = botones[e.key === 'ArrowDown' ? i + 1 : i - 1];
    next?.focus();
  };

  const toggle = () => {
    setOpen((v) => {
      if (!v) {
        setMobileDept(null);
        setMobileCat(null);
      }
      return !v;
    });
  };

  const totalCats = activeDept?.categories.length ?? 0;

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
          {/* Mismo contenedor de página que la barra del cupón: el borde
              derecho del panel termina donde termina "Copiar cupón". */}
          <div className="mx-auto hidden w-full max-w-page px-4 pt-2 sm:px-6 lg:block">
            <div className="flex max-h-[80vh] items-stretch overflow-hidden rounded-novey border border-border-light bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              {/* Rail de departamentos: fijo mientras el contenido scrollea */}
              <div className="flex w-[280px] shrink-0 flex-col border-r border-border-light bg-[#fafbfc]">
                <p className="border-b border-border-light px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Departamentos
                </p>
                <ul ref={railRef} onKeyDown={onRailKeyDown} className="flex-1 space-y-0.5 overflow-y-auto p-2.5" onMouseLeave={cancelHover}>
                  {DEPARTMENTS.map((d) => {
                    const isActive = d.slug === activeDept?.slug;
                    return (
                      <li key={d.slug}>
                        <button
                          type="button"
                          onMouseEnter={() => hoverDept(d.slug)}
                          onFocus={() => selectDept(d.slug)}
                          onClick={() => selectDept(d.slug)}
                          aria-current={isActive ? 'true' : undefined}
                          className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-novey border px-3 py-2 text-left text-[14px] transition-colors duration-150 ${
                            isActive
                              ? 'border-novey-blue bg-novey-blue-bg font-semibold text-novey-blue'
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

              {/* Panel derecho: encabezado fijo, contenido con scroll propio */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div aria-live="polite" className="flex shrink-0 items-center justify-between gap-4 border-b border-border-light px-8 py-4">
                  <h3 className="min-w-0 truncate text-[22px] font-bold leading-tight text-text-ink">{activeDept?.name}</h3>
                  <ViewToggle vista={vista} onChange={cambiarVista} />
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
                  {!activeDept || totalCats === 0 ? (
                    <p className="py-10 text-center text-[14px] text-text-tertiary">
                      Todavía no hay categorías en este departamento.
                    </p>
                  ) : (
                    <>
                      {vista === 'visual' && (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                            Categorías destacadas
                          </p>
                          <div className="mb-7 mt-4">
                            <FeaturedRow categories={activeDept.categories} />
                          </div>
                        </>
                      )}

                      {/* Todas las subcategorías a la vista (tope 8): filas de 4
                          en escritorio, mismos bloques y conteos en ambas vistas */}
                      <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                        {activeDept.categories.slice(0, subcatsEnMenu(totalCats)).map((cat) => (
                          <CategoryBlock key={cat.name} cat={cat} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Mobile / tablet: navegación por niveles ---------- */}
          <div className="max-h-[80vh] overflow-y-auto border-b border-border-light bg-white shadow-lg lg:hidden">
            {/* Nivel 1 — departamentos */}
            {!mobileActiveDept && (
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
                        className="flex min-h-12 w-full items-center justify-between gap-2 border-b border-border-light px-1 py-3 text-left text-[16px] text-text-ink"
                      >
                        {d.name}
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled" />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Nivel 2 — categorías del departamento */}
            {mobileActiveDept && !mobileActiveCat && (
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileDept(null)}
                    className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-novey-blue"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Volver a Departamentos
                  </button>
                  <ViewToggle vista={vista} onChange={cambiarVista} />
                </div>
                <h3 className="mt-1 text-[20px] font-bold leading-tight text-text-ink">{mobileActiveDept.name}</h3>
                {mobileActiveDept.categories.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-text-tertiary">
                    Todavía no hay categorías en este departamento.
                  </p>
                ) : (
                  <ul className="mt-3 grid grid-cols-1 gap-x-6 pb-4 md:grid-cols-2">
                    {mobileActiveDept.categories.map((cat) => (
                      <li key={cat.name}>
                        <button
                          type="button"
                          onClick={() => (cat.items.length > 0 ? setMobileCat(cat.name) : undefined)}
                          {...(cat.items.length === 0 ? { 'aria-label': `${cat.name} (sin opciones)` } : {})}
                          className={`flex w-full items-center gap-3 border-b border-border-light px-1 text-left ${
                            vista === 'visual' ? 'min-h-14 py-2' : 'min-h-12 py-3'
                          }`}
                        >
                          {vista === 'visual' && <CategoryThumb cat={cat} size={44} />}
                          <span className="flex-1 text-[16px] text-text-ink">{cat.name}</span>
                          {cat.items.length > 0 && <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Nivel 3 — opciones de la categoría */}
            {mobileActiveDept && mobileActiveCat && (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileCat(null)}
                  className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-novey-blue"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver a {mobileActiveDept.name}
                </button>
                <h3 className="mt-1 text-[20px] font-bold leading-tight text-text-ink">{mobileActiveCat.name}</h3>
                <ul className="mt-2 pb-4">
                  <li>
                    <a
                      href={ROUTES.categoria}
                      className="flex min-h-12 items-center border-b border-border-light px-1 py-3 text-[16px] font-semibold text-novey-blue"
                    >
                      Ver todo en {mobileActiveCat.name}
                    </a>
                  </li>
                  {mobileActiveCat.items.map((item) => (
                    <li key={item}>
                      <a
                        href={ROUTES.categoria}
                        className="flex min-h-12 items-center border-b border-border-light px-1 py-3 text-[16px] text-text-ink"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
