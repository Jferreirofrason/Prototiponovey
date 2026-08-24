'use client';

import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, type Category, type Department } from '../data/departments-menu';
import {
  MAX_DESTACADAS,
  categoriasVisibles,
  etiquetaVerOpciones,
  etiquetaVerTodo,
  necesitaVerOpciones,
  necesitaVerTodo,
  subcatsVisibles,
} from '../lib/menu-reglas.mjs';
import { ROUTES } from '../lib/routes';

// Mega-menú "Departamentos".
//
// Desktop: rail de departamentos (izquierda, fijo) + panel de categorías
// (derecha, con su propio scroll). El panel ocupa el mismo contenedor de
// 1276px que el resto de la página, así su borde derecho termina donde
// termina "Copiar cupón".
//
// Jerarquía: departamento → categorías principales → subcategorías.
// Reglas de visibilidad en lib/menu-reglas.mjs: 6 categorías + "Ver todo (N)",
// 5 subcategorías + "Ver todas las opciones (N)".
//
// Mobile y tablet: navegación por niveles (departamentos → categorías →
// subcategorías) con "← Volver", nada de megamenú achicado.

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

/* ---------- piezas ---------- */

/**
 * Miniatura de una categoría. Sin imagen (o si la imagen falla) muestra la
 * inicial sobre un fondo neutro: nunca un hueco roto.
 */
function CategoryThumb({ cat, size }: { cat: Category; size: number }) {
  const [failed, setFailed] = useState(false);
  const px = { width: size, height: size };
  if (!cat.image || failed) {
    return (
      <span
        style={px}
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-full border border-border-light bg-novey-blue-pale text-lg font-semibold text-novey-blue"
      >
        {cat.name.charAt(0)}
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

/** Fila de hasta 6 categorías destacadas: foto redonda + nombre, todo clickeable. */
function FeaturedRow({ categories }: { categories: Category[] }) {
  const destacadas = categories.slice(0, MAX_DESTACADAS);
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-5 md:grid-cols-4 xl:grid-cols-6">
      {destacadas.map((cat) => (
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
 * Una categoría principal con sus subcategorías: título enlazado, hasta 5
 * subcategorías y su propio "Ver todas las opciones (N)" cuando hay más.
 */
function CategoryBlock({
  cat,
  expanded,
  onToggle,
}: {
  cat: Category;
  expanded: boolean;
  onToggle: () => void;
}) {
  const visibles = subcatsVisibles(cat.items.length, expanded);
  return (
    <section aria-label={cat.name}>
      <h4 className="border-b-2 border-novey-blue pb-2">
        <a href={ROUTES.categoria} className="text-[15px] font-semibold text-text-ink hover:text-novey-blue">
          {cat.name}
        </a>
      </h4>
      {cat.items.length > 0 && (
        <ul className="mt-3 space-y-1">
          {cat.items.slice(0, visibles).map((item) => (
            <li key={item}>
              <a
                href={ROUTES.categoria}
                className="flex min-h-8 items-center text-[13px] text-text-secondary transition-colors duration-150 hover:text-novey-blue hover:underline"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      )}
      {necesitaVerOpciones(cat.items.length) && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-1 flex min-h-8 items-center text-[13px] font-medium text-novey-blue hover:underline"
        >
          {etiquetaVerOpciones(cat.items.length, expanded)}
        </button>
      )}
    </section>
  );
}

/* ---------- componente principal ---------- */

export default function DepartmentsMenu() {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(DEPARTMENTS[0]?.slug ?? '');
  // "Ver todo (N)" del departamento activo.
  const [deptExpanded, setDeptExpanded] = useState(false);
  // "Ver todas las opciones (N)" por categoría del departamento activo.
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  // Niveles mobile: lista de departamentos → categorías → subcategorías.
  const [mobileDept, setMobileDept] = useState<string | null>(null);
  const [mobileCat, setMobileCat] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  // Tolerancia al movimiento del mouse entre columnas: el cambio de
  // departamento espera un instante y se cancela si el puntero siguió de largo.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDept = DEPARTMENTS.find((d) => d.slug === activeSlug) ?? DEPARTMENTS[0];
  const mobileActiveDept = mobileDept ? DEPARTMENTS.find((d) => d.slug === mobileDept) ?? null : null;
  const mobileActiveCat = mobileActiveDept && mobileCat
    ? mobileActiveDept.categories.find((c) => c.name === mobileCat) ?? null
    : null;

  const selectDept = (slug: string) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    // Cada departamento arranca contraído: menos decisiones simultáneas.
    setDeptExpanded(false);
    setOpenCats(new Set());
  };

  const hoverDept = (slug: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => selectDept(slug), 120);
  };
  const cancelHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const toggleCat = (name: string) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

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

  const visibles = activeDept ? categoriasVisibles(activeDept.categories.length, deptExpanded) : 0;

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
            <div className="flex max-h-[min(720px,calc(100vh-190px))] items-stretch overflow-hidden rounded-novey border border-border-light bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
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

              {/* Panel de contenido: usa todo el ancho restante */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-border-light px-8 pb-4 pt-5">
                  <h3 className="text-[22px] font-bold leading-tight text-text-ink">{activeDept?.name}</h3>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
                  {!activeDept || activeDept.categories.length === 0 ? (
                    <p className="py-10 text-center text-[14px] text-text-tertiary">
                      Este departamento todavía no tiene categorías para mostrar.
                    </p>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                        Categorías destacadas
                      </p>
                      <div className="mt-4">
                        <FeaturedRow categories={activeDept.categories} />
                      </div>

                      <div className="mt-9 grid grid-cols-2 gap-x-10 gap-y-9 xl:grid-cols-3">
                        {activeDept.categories.slice(0, visibles).map((cat) => (
                          <CategoryBlock
                            key={cat.name}
                            cat={cat}
                            expanded={openCats.has(cat.name)}
                            onToggle={() => toggleCat(cat.name)}
                          />
                        ))}
                      </div>

                      {necesitaVerTodo(activeDept.categories.length) && (
                        <div className="mt-8 border-t border-border-light pt-4">
                          <button
                            type="button"
                            onClick={() => setDeptExpanded((v) => !v)}
                            aria-expanded={deptExpanded}
                            className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-novey-blue hover:underline"
                          >
                            {etiquetaVerTodo(activeDept.categories.length, deptExpanded)}
                            <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${deptExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Mobile / tablet: navegación por niveles ---------- */}
          <div className="max-h-[calc(100vh-160px)] overflow-y-auto border-b border-border-light bg-white shadow-lg lg:hidden">
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
                <button
                  type="button"
                  onClick={() => setMobileDept(null)}
                  className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-novey-blue"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver
                </button>
                <h3 className="mt-1 text-[20px] font-bold leading-tight text-text-ink">{mobileActiveDept.name}</h3>
                {mobileActiveDept.categories.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-text-tertiary">
                    Este departamento todavía no tiene categorías para mostrar.
                  </p>
                ) : (
                  <ul className="mt-3 pb-4">
                    {mobileActiveDept.categories.map((cat) => (
                      <li key={cat.name}>
                        <button
                          type="button"
                          onClick={() => (cat.items.length > 0 ? setMobileCat(cat.name) : undefined)}
                          {...(cat.items.length === 0 ? { 'aria-label': `${cat.name} (sin subcategorías)` } : {})}
                          className="flex min-h-14 w-full items-center gap-3 border-b border-border-light px-1 py-2 text-left"
                        >
                          <CategoryThumb cat={cat} size={44} />
                          <span className="flex-1 text-[16px] text-text-ink">{cat.name}</span>
                          {cat.items.length > 0 && <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Nivel 3 — subcategorías de la categoría */}
            {mobileActiveDept && mobileActiveCat && (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileCat(null)}
                  className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-novey-blue"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver
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
