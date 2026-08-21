// Iconos SVG inline (sin dependencias externas)
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const Ic = {
  search: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>,
  user: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} fill={p?.fill || "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  cart: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.5 12.5h11L21 7H6" /></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>,
  chevD: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><polyline points="6 9 12 15 18 9" /></svg>,
  chevL: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><polyline points="15 18 9 12 15 6" /></svg>,
  chevR: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><polyline points="9 18 15 12 9 6" /></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width={p?.s || 14} height={p?.s || 14} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>,
  store: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><path d="M3 9l1-4h16l1 4" /><path d="M4 9v11h16V9" /><rect x="9" y="13" width="6" height="7" /></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><rect x="1" y="6" width="13" height="11" /><path d="M14 9h4l3 3v5h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>,
  bolt: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><polyline points="9 12 11 14 15 9" /></svg>,
  washer: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="4.5" y="3.5" width="15" height="17" rx="2.6" /><line x1="4.5" y1="8" x2="19.5" y2="8" /><circle cx="7.3" cy="5.7" r=".75" fill="currentColor" stroke="none" /><circle cx="16.3" cy="5.7" r=".75" fill="currentColor" stroke="none" /><circle cx="12" cy="14.4" r="4.3" fill="#d7e6fd" /><circle cx="12" cy="14.4" r="1.7" /></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><rect x="7" y="3" width="10" height="18" rx="2" /><line x1="11" y1="6" x2="13" y2="6" /></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><path d="M3 12a9 9 0 109-9" /><polyline points="3 4 3 9 8 9" /></svg>,
  wrench: (p) => <svg viewBox="0 0 24 24" width={p?.s || 18} height={p?.s || 18} {...s}><path d="M14 7l3 3-7 7-3-3z" /><path d="M17 10l3-3-3-3-3 3" /></svg>,
  share: (p) => <svg viewBox="0 0 24 24" width={p?.s || 16} height={p?.s || 16} {...s}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><line x1="8.2" y1="10.8" x2="15.8" y2="6.2" /><line x1="8.2" y1="13.2" x2="15.8" y2="17.8" /></svg>,
  info: (p) => <svg viewBox="0 0 24 24" width={p?.s || 16} height={p?.s || 16} fill="currentColor"><circle cx="12" cy="12" r="10" /><rect x="11" y="10.5" width="2" height="6" rx="1" fill="#fff" /><circle cx="12" cy="7.5" r="1.2" fill="#fff" /></svg>,
  card: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="2" y="5" width="20" height="14" rx="2.5" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="15" x2="10" y2="15" /></svg>,
  tag: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a1.4 1.4 0 0 1 0 2z" /><circle cx="7.5" cy="8.5" r="1.4" fill="currentColor" /></svg>,
  cart2: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.5 12.5h11L21 7H6" /></svg>,
  topload: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="4.5" y="3.5" width="15" height="17" rx="2.6" /><line x1="4.5" y1="8" x2="19.5" y2="8" /><rect x="9" y="4.9" width="6" height="1.7" rx=".85" fill="currentColor" stroke="none" /><circle cx="12" cy="14.4" r="4.3" fill="#d7e6fd" /><circle cx="12" cy="14.4" r=".9" fill="currentColor" stroke="none" /></svg>,
  dryer: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="4.5" y="3.5" width="15" height="17" rx="2.6" /><line x1="4.5" y1="8" x2="19.5" y2="8" /><circle cx="7.3" cy="5.7" r=".75" fill="currentColor" stroke="none" /><circle cx="16.3" cy="5.7" r=".75" fill="currentColor" stroke="none" /><circle cx="12" cy="14.4" r="4.3" fill="#d7e6fd" /><path d="M11 12.9c1 .6 1 1.4 0 2M13 12.9c1 .6 1 1.4 0 2" strokeWidth="1.4" /></svg>,
  tower: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="5.5" y="2.5" width="13" height="9" rx="2" /><rect x="5.5" y="12.5" width="13" height="9" rx="2" /><line x1="8" y1="4.5" x2="10.2" y2="4.5" /><line x1="8" y1="14.5" x2="10.2" y2="14.5" /><circle cx="14" cy="7" r="2.2" fill="#d7e6fd" /><circle cx="14" cy="17" r="2.2" fill="#d7e6fd" /></svg>,
  washdry: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><rect x="4.5" y="3.5" width="15" height="17" rx="2.6" /><line x1="4.5" y1="8" x2="19.5" y2="8" /><circle cx="7.3" cy="5.7" r=".75" fill="currentColor" stroke="none" /><circle cx="12" cy="14.4" r="4.3" fill="#d7e6fd" /><path d="M12 12.3c-1.2 1-1.2 2.1 0 3.1 1.2-1 1.2-2.1 0-3.1z" fill="currentColor" stroke="none" /></svg>,
  basket: (p) => <svg viewBox="0 0 24 24" width={p?.s || 22} height={p?.s || 22} {...s}><path d="M4.5 9.2h15l-1.15 9.5a2.2 2.2 0 0 1-2.19 1.95H7.84A2.2 2.2 0 0 1 5.65 18.7z" fill="#d7e6fd" /><path d="M8.3 9.2l1.5-3.9h4.4l1.5 3.9" /><line x1="9" y1="12.4" x2="8.7" y2="17.6" /><line x1="12" y1="12.4" x2="12" y2="17.6" /><line x1="15" y1="12.4" x2="15.3" y2="17.6" /></svg>,
  arrowR: (p) => <svg viewBox="0 0 24 24" width={p?.s || 20} height={p?.s || 20} {...s}><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>,
};

export const Stars = ({ n = 5, s = 14 }) => (
  <span className="stars">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 24 24" width={s} height={s} className={i < Math.round(n) ? "" : "s-off"} fill="currentColor">
        <polygon points="12 2 15 9 22 9.5 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.5 9 9" />
      </svg>
    ))}
  </span>
);
