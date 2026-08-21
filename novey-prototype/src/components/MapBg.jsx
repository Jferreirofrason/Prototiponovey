// Ilustración de mapa (calles, avenida, parque, agua) — como en el Figma
export default function MapBg() {
  const L = "#e9ede6", WATER = "#abd4ee", PARK = "#cbe4b4", ROAD = "#fff", CASING = "#e0e2d8", ST = "#d7dad0";
  const main = [[0, 130, 520, 130], [234, 0, 234, 260], [0, 224, 374, 0]];
  const minor = [[0, 68, 520, 68], [0, 198, 374, 198], [104, 0, 104, 260], [354, 0, 354, 260], [447, 120, 447, 260]];
  return (
    <svg className="mapbg" viewBox="0 0 520 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="520" height="260" fill={L} />
      <path d="M385 0 L520 0 L520 120 L458 104 L416 47 Z" fill={WATER} />
      <rect x="31" y="156" width="125" height="83" rx="6" fill={PARK} />
      {minor.map((c, i) => <line key={"s" + i} x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]} stroke={ST} strokeWidth="2" />)}
      {main.map((c, i) => <line key={"c" + i} x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]} stroke={CASING} strokeWidth="12" strokeLinecap="round" />)}
      {main.map((c, i) => <line key={"r" + i} x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]} stroke={ROAD} strokeWidth="8" strokeLinecap="round" />)}
    </svg>
  );
}
