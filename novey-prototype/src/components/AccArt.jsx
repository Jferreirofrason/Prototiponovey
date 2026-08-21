// Ilustraciones SVG de accesorios/complementos (flat, sin dependencias externas)
const box = { fill: "none", stroke: "#0d2b4e", strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" };

export const AccArt = {
  // Cápsulas / pods — dos cápsulas bicolor
  pods: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g stroke="#0d2b4e" strokeWidth="2.5">
        <path d="M28 58a20 16 0 0 1 40 0 20 16 0 0 1-40 0z" fill="#eaf1fb" />
        <path d="M48 58a20 16 0 0 1 20-16 20 16 0 0 1 0 32 20 16 0 0 1-20-16z" fill="#1e73d6" />
      </g>
      <g stroke="#0d2b4e" strokeWidth="2.5">
        <path d="M56 82a17 13 0 0 1 34 0 17 13 0 0 1-34 0z" fill="#eaf1fb" />
        <path d="M73 82a17 13 0 0 1 17-13 17 13 0 0 1 0 26 17 13 0 0 1-17-13z" fill="#7c4dc4" />
      </g>
    </svg>
  ),
  // Detergente líquido — bidón con manija, tapa y etiqueta
  detergente: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="34" y="40" width="46" height="60" rx="8" fill="#1e73d6" />
      <path d="M80 52h8a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-8" fill="#1e73d6" />
      <rect x="46" y="28" width="18" height="16" rx="3" fill="#0f4ea3" />
      <path d="M64 34h10a6 6 0 0 1 0 12H64z" fill="#0f4ea3" />
      <rect x="40" y="62" width="34" height="30" rx="4" fill="#fff" />
      <line x1="46" y1="72" x2="68" y2="72" stroke="#1e73d6" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="80" x2="62" y2="80" stroke="#8fbdf0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  // Suavizante — botella con flor en la etiqueta
  suavizante: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M44 44h32v48a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8z" fill="#7c4dc4" />
      <path d="M50 44v-8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8z" fill="#5a2f9e" />
      <rect x="52" y="28" width="16" height="8" rx="2" fill="#5a2f9e" />
      <rect x="48" y="62" width="24" height="28" rx="4" fill="#fff" />
      <g fill="#7c4dc4">
        <circle cx="60" cy="74" r="4" />
        <circle cx="60" cy="66.5" r="3" /><circle cx="60" cy="81.5" r="3" />
        <circle cx="53" cy="74" r="3" /><circle cx="67" cy="74" r="3" />
      </g>
    </svg>
  ),
  // Secadora — electrodoméstico con puerta y ondas de calor
  secadora: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="24" y="20" width="72" height="80" rx="8" fill="#e8eef6" stroke="#0d2b4e" strokeWidth="3" />
      <line x1="24" y1="36" x2="96" y2="36" stroke="#0d2b4e" strokeWidth="3" />
      <circle cx="42" cy="28" r="2.5" fill="#0d2b4e" />
      <rect x="70" y="25" width="16" height="6" rx="3" fill="#1e73d6" />
      <circle cx="60" cy="68" r="24" fill="#fff" stroke="#0d2b4e" strokeWidth="3" />
      <path d="M54 62c4 3 8 3 12 0M54 74c4 3 8 3 12 0" fill="none" stroke="#1e73d6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  // Base pedestal — cajón bajo con manija
  pedestal: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="20" y="42" width="80" height="46" rx="8" fill="#e8eef6" stroke="#0d2b4e" strokeWidth="3" />
      <rect x="30" y="54" width="60" height="22" rx="4" fill="#fff" stroke="#0d2b4e" strokeWidth="3" />
      <line x1="50" y1="65" x2="70" y2="65" stroke="#1e73d6" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="88" x2="30" y2="96" {...box} />
      <line x1="90" y1="88" x2="90" y2="96" {...box} />
    </svg>
  ),
  // Kit de mangueras — manguera enroscada con conectores
  mangueras: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M30 34c26 0 26 20 0 20s-26 20 0 20 26 12 26 12" fill="none" stroke="#5b6b7d" strokeWidth="8" strokeLinecap="round" />
      <rect x="24" y="28" width="14" height="10" rx="2" fill="#9aa7b5" stroke="#0d2b4e" strokeWidth="2.5" />
      <rect x="78" y="82" width="14" height="12" rx="2" fill="#1e73d6" stroke="#0d2b4e" strokeWidth="2.5" />
    </svg>
  ),
  // Torre de apilado — dos módulos apilados con bracket
  apilado: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="34" y="20" width="52" height="38" rx="6" fill="#e8eef6" stroke="#0d2b4e" strokeWidth="3" />
      <rect x="34" y="62" width="52" height="38" rx="6" fill="#dbe6f3" stroke="#0d2b4e" strokeWidth="3" />
      <circle cx="60" cy="39" r="10" fill="#fff" stroke="#0d2b4e" strokeWidth="2.5" />
      <circle cx="60" cy="81" r="10" fill="#fff" stroke="#0d2b4e" strokeWidth="2.5" />
      <rect x="88" y="52" width="10" height="16" rx="2" fill="#1e73d6" />
      <rect x="22" y="52" width="10" height="16" rx="2" fill="#1e73d6" />
    </svg>
  ),
};
