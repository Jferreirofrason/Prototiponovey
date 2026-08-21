'use client';

// Rastrear mi pedido — pantalla inicial según Figma "15 · Mejoras UX"
// (desktop 4988:134885 · mobile 4988:134571): sin envíos activos, buscador
// de pedido + pedidos recientes + ayuda.

import { TrackShell, SearchOrderCard, RecentOrdersCard, HelpStrip } from './track-ui';

export default function RastrearOrdenPage() {
  return (
    <TrackShell
      status="Sin envíos activos"
      statusTone="muted"
      subtitle="Consulta el estado de cualquier pedido o revisa tu historial."
    >
      <SearchOrderCard />
      <RecentOrdersCard />
      <HelpStrip />
    </TrackShell>
  );
}
