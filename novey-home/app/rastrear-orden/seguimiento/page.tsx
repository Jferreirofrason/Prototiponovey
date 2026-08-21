'use client';

// Seguimiento del pedido — paso 2 según Figma "15 · Mejoras UX"
// (desktop 4988:133260 · mobile 4988:133639): card de estado con progreso
// 4 pasos + buscador y pedidos recientes reutilizados.

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrackShell,
  SearchOrderCard,
  RecentOrdersCard,
  HelpStrip,
  Icon,
  IC,
  DEFAULT_PEDIDO,
  normalizePedido,
} from '../track-ui';

type StepState = 'done' | 'active' | 'pending';

const STEPS: {
  title: string;
  icon: React.ReactNode;
  state: StepState;
  tag: string;
  date: string;
  desc: string;
  descMobile?: string;
}[] = [
  { title: 'Confirmado', icon: IC.check, state: 'done', tag: 'Listo', date: '06 may · 10:24 am', desc: 'Pedido recibido' },
  { title: 'Preparando', icon: IC.box, state: 'done', tag: 'Listo', date: '07 may · 09:10 am', desc: 'En almacén Tocumen' },
  {
    title: 'En camino',
    icon: IC.truck,
    state: 'active',
    tag: 'EN VIVO',
    date: 'Hoy · 11:30 am',
    desc: 'Pedro va a tu casa',
    descMobile: 'Pedro va a tu casa · Entre 3:00 y 6:00 pm',
  },
  {
    title: 'Entregado',
    icon: IC.home,
    state: 'pending',
    tag: 'Pendiente',
    date: 'Estimado hoy',
    desc: 'Entre 3:00 y 6:00 pm',
    descMobile: 'Confirmaremos por correo',
  },
];

function StepTag({ state, tag }: { state: StepState; tag: string }) {
  if (state === 'active') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-novey-blue-dark px-2 py-0.5 text-[8px] font-bold text-white lg:text-[9px]">
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white" />
        {tag}
      </span>
    );
  }
  return (
    <span
      className={`rounded bg-white px-1.5 py-0.5 text-[8px] font-bold lg:text-[9px] ${
        state === 'done' ? 'text-[#21A657]' : 'text-[#8C94A1]'
      }`}
    >
      {tag}
    </span>
  );
}

function StepIcon({ state, icon, size = 'h-11 w-11' }: { state: StepState; icon: React.ReactNode; size?: string }) {
  const styles =
    state === 'done'
      ? 'bg-[#21A657] text-white'
      : state === 'active'
        ? 'bg-novey-blue-dark text-white'
        : 'border border-border-medium bg-white text-[#8C94A1]';
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full ${size} ${styles}`}>
      <Icon path={icon} className="h-5 w-5" />
    </span>
  );
}

function StatusCard({ pedido }: { pedido: string }) {
  return (
    <section className="rounded-xl border border-border-light bg-white p-4 shadow-card lg:p-6" aria-labelledby="estado-pedido-titulo">
      {/* Encabezado: badge + nro + chip de llegada */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-feedback-success-bg px-2.5 py-1 text-[10px] font-semibold text-[#21A657] lg:text-[11px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#21A657]" />
              En camino
            </span>
            {/* Chip corto (mobile) */}
            <span className="rounded-full bg-novey-blue-bg px-2.5 py-1 text-[10px] font-semibold text-novey-blue-dark lg:hidden">
              Llega hoy 3-6 pm
            </span>
          </div>
          <h2 id="estado-pedido-titulo" className="pt-2 text-[16px] font-bold text-[#0F121A] lg:text-[20px]">
            Pedido {pedido}
          </h2>
          <p className="pt-0.5 text-[11px] text-[#5C6373] lg:text-[13px]">
            Hecho el 06 may · $87.50 · 4 productos
          </p>
        </div>
        {/* Chip de llegada (desktop) */}
        <div className="hidden shrink-0 rounded-novey bg-novey-blue-bg px-4 py-2.5 text-right lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-novey-blue-dark">Llega hoy</p>
          <p className="text-[14px] font-semibold text-novey-blue-dark">Entre 3:00 y 6:00 pm</p>
        </div>
      </div>

      {/* Progreso */}
      <div className="pt-5 lg:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-[#0F121A] lg:text-[13px]">Progreso del envío</p>
            <p className="hidden pt-0.5 text-[11px] text-[#5C6373] lg:block">Paso 3 de 4 · Tu pedido va en camino</p>
          </div>
          <span className="rounded-full bg-feedback-success-bg px-2.5 py-1 text-[10px] font-bold text-[#21A657] lg:text-[11px]">
            <span className="lg:hidden">75%</span>
            <span className="hidden lg:inline">75% completado</span>
          </span>
        </div>
        <div
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border-light"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del envío: 75% completado"
        >
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#21A657] to-novey-blue-dark" />
        </div>
      </div>

      {/* Pasos — desktop: 4 cards */}
      <ol className="hidden gap-3 pt-5 lg:grid lg:grid-cols-4">
        {STEPS.map((s) => (
          <li
            key={s.title}
            aria-current={s.state === 'active' ? 'step' : undefined}
            className={`rounded-[10px] p-4 ${
              s.state === 'done'
                ? 'border border-[#D3F1DF] bg-feedback-success-bg'
                : s.state === 'active'
                  ? 'border-2 border-novey-blue-dark bg-novey-blue-bg'
                  : 'border border-border-light bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-start justify-between">
              <StepIcon state={s.state} icon={s.icon} />
              <StepTag state={s.state} tag={s.tag} />
            </div>
            <p className={`pt-3 text-[15px] font-bold ${s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#0F121A]'}`}>
              {s.title}
            </p>
            <p
              className={`pt-1 text-[11px] font-medium ${
                s.state === 'active' ? 'text-novey-blue-dark' : s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#5C6373]'
              }`}
            >
              {s.date}
            </p>
            <p className={`pt-0.5 text-[11px] ${s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#5C6373]'}`}>{s.desc}</p>
          </li>
        ))}
      </ol>

      {/* Pasos — mobile: timeline vertical */}
      <ol className="pt-4 lg:hidden">
        {STEPS.map((s, i) => (
          <li key={s.title} aria-current={s.state === 'active' ? 'step' : undefined} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepIcon state={s.state} icon={s.icon} size="h-10 w-10" />
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`w-[3px] flex-1 rounded-full ${s.state === 'done' ? 'bg-[#21A657]' : 'bg-border-light'}`}
                />
              )}
            </div>
            {s.state === 'active' ? (
              <div className="mb-4 flex-1 rounded-[10px] border-2 border-novey-blue-dark bg-novey-blue-bg p-3">
                <p className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#0F121A]">{s.title}</span>
                  <StepTag state={s.state} tag={s.tag} />
                </p>
                <p className="pt-1 text-[11px] font-semibold text-novey-blue-dark">{s.date}</p>
                <p className="pt-0.5 text-[11px] text-[#0F121A]">{s.descMobile ?? s.desc}</p>
              </div>
            ) : (
              <div className={`flex-1 ${i < STEPS.length - 1 ? 'pb-5' : ''}`}>
                <p className="flex items-center gap-2 pt-1">
                  <span className={`text-[13px] font-semibold ${s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#0F121A]'}`}>
                    {s.title}
                  </span>
                  <StepTag state={s.state} tag={s.tag} />
                </p>
                <p className={`flex items-center gap-1 pt-0.5 text-[11px] ${s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#5C6373]'}`}>
                  {s.state === 'pending' && <Icon path={IC.clock} className="h-3 w-3" />}
                  {s.date}
                </p>
                <p className={`pt-0.5 text-[10px] ${s.state === 'pending' ? 'text-[#8C94A1]' : 'text-[#5C6373]'}`}>
                  {s.descMobile ?? s.desc}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Entrega + acciones */}
      <div className="pt-4 lg:pt-5">
        <div className="flex items-center gap-3 rounded-[10px] bg-[#F7F8FA] p-3.5 lg:p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-novey-blue-dark">
            <Icon path={IC.pin} className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#5C6373] lg:text-[10px]">Entrega en</p>
            <p className="truncate text-[11px] font-semibold text-[#0F121A] lg:text-[13px]">
              Vía Porras, Bethania · Casa #87B-AWW
            </p>
          </div>
          {/* Botones desktop dentro de la fila */}
          <div className="hidden shrink-0 gap-2 lg:flex">
            <a
              href="#"
              className="flex h-10 items-center gap-2 rounded-novey bg-novey-blue-dark px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-novey-navy"
            >
              <Icon path={IC.pin} className="h-4 w-4" />
              Ver mapa
            </a>
            <a
              href="#"
              className="flex h-10 items-center rounded-novey border border-border-light bg-white px-4 text-[13px] font-semibold text-[#0F121A] transition-colors duration-150 hover:border-novey-blue hover:text-novey-blue"
            >
              Ver pedido
            </a>
          </div>
        </div>
        {/* Botones mobile debajo, a lo ancho */}
        <div className="grid grid-cols-2 gap-2 pt-3 lg:hidden">
          <a
            href="#"
            className="flex h-11 items-center justify-center gap-2 rounded-novey bg-novey-blue-dark text-[13px] font-semibold text-white"
          >
            <Icon path={IC.pin} className="h-4 w-4" />
            Ver mapa
          </a>
          <a
            href="#"
            className="flex h-11 items-center justify-center rounded-novey border border-border-light bg-white text-[13px] font-semibold text-[#0F121A]"
          >
            Ver pedido
          </a>
        </div>
      </div>
    </section>
  );
}

function SeguimientoContent() {
  const params = useSearchParams();
  const raw = params.get('pedido');
  const pedido = (raw && normalizePedido(raw)) || DEFAULT_PEDIDO;

  return (
    <TrackShell
      status="1 pedido en camino"
      statusTone="success"
      subtitle="Mira en qué paso está tu pedido o consulta el estado de uno anterior."
    >
      <StatusCard pedido={pedido} />
      <SearchOrderCard />
      <RecentOrdersCard />
      <HelpStrip />
    </TrackShell>
  );
}

export default function SeguimientoPage() {
  return (
    <Suspense fallback={null}>
      <SeguimientoContent />
    </Suspense>
  );
}
