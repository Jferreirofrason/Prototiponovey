// Data ficticia local — Novey PLP/PDP prototype
const I = [
  "0c912bc3a941c0aee44503fdc9f2c5fa.jpg","1f952496ff95a28e0a483b0239628e6c.jpg",
  "2dc6956d6b39a45ffb224c71254f2d0b.jpg","30b17d06a277dbe6ba3b5b7a9f2b44c8.jpg",
  "39fe865b23dd34e2caae5ca13dd1d05e.jpg","3de7ddc774c4e27418e9f6dff20bedcd.jpg",
  "4687a4bcffadc7b2647340b803b8583d.jpg","590bd8e90dddc23541a1f89f017ccfd7.jpg",
  "89dc2c306e518cac1ff4819821e8c91b.jpg","8ab75710211289afe5eaeae93718539a.jpg",
  "8f678280c55742c26d0e3bdd7b93595d.jpg","915435d9aec5123beb3d234055eb6974.jpg",
  "ab930c37ed01e8005bcd232a08c1bcf8.jpg","bfdb239133ff5d503ca1fc58a1481dd4.jpg",
  "ce8d93de53e724783fa0d00430be4eb1.jpg","d429adac49b66715895893be051c46f3.jpg",
  "eea7a43686f485685af2ef1741ab1eaf.jpg","f2f8361dea74ad2b649765f9169ddd5d.jpg",
  "f56743a65179c167ee7588de9ce5829f.jpg","f6185775e86eb659265b9388d25fb12f.jpg",
].map((f) => `/img/${f}`);

export const IMG = I;

const RED = "red", BLUE = "new", ORANGE = "best";

// precios de oferta (rojo) y precios normales (negro)
const OFFER_PRICES = ["$369.00", "$229.97", "$139.98", "$257.97", "$169.97", "$519.00"];
const REGULAR_PRICES = ["$429.99", "$259.99", "$169.99", "$379.99", "$258.99", "$309.99"];
let _oi = 0, _ri = 0;

export const products = [
  ["Whirlpool", "Lavadora carga frontal 17 kg - Blanco", "$749", 4.7, 183, ORANGE, "Retira hoy · Novey Los Ángeles", "Desde $62/mes"],
  ["Samsung", "Lavadora automática 19 kg - Inverter", "$899", 4.5, 96, RED, "Envío a domicilio · 24-48h", "Desde $75/mes"],
  ["LG", "Lavasecadora carga frontal 14 kg - Acero", "$1,200", 4.8, 212, BLUE, "Costa del Este · Retira hoy", "Desde $100/mes"],
  ["Mabe", "Lavadora semiautomática 12 kg - Gris", "$399", 4.3, 54, null, "Costa del Este · Retira hoy", "Desde $33/mes"],
  ["Frigidaire", "Secadora eléctrica 16 kg - Blanco", "$649", 4.6, 128, RED, "Envío a domicilio", "Desde $54/mes"],
  ["Hisense", "Lavadora automática 15 kg - Blanco", "$500", 4.4, 77, null, "Albrook · Retira hoy", "Desde $42/mes"],
  ["Whirlpool", "Centro de lavado 14 kg - Blanco", "$1,050", 4.9, 341, ORANGE, "Albrook · Retira hoy", "Desde $87/mes"],
  ["Samsung", "Secadora a gas 18 kg - Negro", "$829", 4.2, 39, null, "Envío a domicilio · 24-48h", "Desde $69/mes"],
  ["LG", "Lavadora carga frontal 16 kg - Negro", "$799", 4.6, 150, RED, "Albrook · Retira hoy", "Desde $66/mes"],
  ["Mabe", "Lavadora automática 14 kg - Blanco", "$459", 4.5, 88, null, "Costa del Este · Retira hoy", "Desde $38/mes"],
  ["Frigidaire", "Lavasecadora 12 kg - Blanco", "$999", 4.7, 205, BLUE, "Envío a domicilio", "Desde $83/mes"],
  ["Hisense", "Secadora eléctrica 14 kg - Blanco", "$549", 4.4, 61, null, "Retira hoy", "Desde $45/mes"],
  ["Whirlpool", "Lavadora automática 18 kg - Inverter", "$720", 4.8, 167, null, "Brisas del Golf · Retira hoy", "Desde $60/mes"],
  ["Samsung", "Lavadora carga frontal 20 kg - Acero", "$1,150", 4.3, 45, ORANGE, "Envío a domicilio · 24-48h", "Desde $95/mes"],
  ["LG", "Secadora bomba de calor 16 kg - Acero", "$1,090", 4.6, 119, BLUE, "Retira hoy", "Desde $90/mes"],
  ["Mabe", "Centro de lavado 16 kg - Gris", "$889", 4.5, 93, null, "Albrook · Retira hoy", "Desde $74/mes"],
  ["Frigidaire", "Lavadora semiautomática 11 kg - Blanco", "$349", 4.4, 72, RED, "Albrook · Retira hoy", "Desde $29/mes"],
  ["Hisense", "Lavadora automática 17 kg - Inverter", "$639", 4.7, 198, null, "Envío a domicilio", "Desde $53/mes"],
  ["Whirlpool", "Secadora eléctrica 15 kg - Blanco", "$599", 4.9, 276, null, "Brisas del Golf · Retira hoy", "Desde $50/mes"],
  ["Samsung", "Lavasecadora 14 kg - Inverter", "$1,290", 4.2, 33, BLUE, "Retira hoy", "Desde $107/mes"],
  ["LG", "Lavadora automática 13 kg - Blanco", "$479", 4.6, 141, null, "Retira hoy", "Desde $40/mes"],
  ["Mabe", "Secadora a gas 16 kg - Blanco", "$579", 4.5, 84, RED, "Envío a domicilio", "Desde $48/mes"],
  ["Frigidaire", "Centro de lavado 15 kg - Blanco", "$929", 4.8, 159, null, "Costa del Este · Retira hoy", "Desde $77/mes"],
  ["Hisense", "Lavasecadora 12 kg - Gris", "$869", 4.3, 48, ORANGE, "Retira hoy", "Desde $72/mes"],
].map((p, i) => {
  const offer = p[5] === RED;
  const price = offer
    ? OFFER_PRICES[_oi++ % OFFER_PRICES.length]
    : REGULAR_PRICES[_ri++ % REGULAR_PRICES.length];
  return {
    id: i + 1, brand: p[0], name: p[1], price, offer, rating: p[3],
    reviews: p[4], badge: p[5], avail: p[6], fin: p[7], img: IMG[i % IMG.length],
  };
});

export const BADGE_LABEL = { red: "Oferta", new: "Nuevo", best: "Más vendido" };

export const subcategories = [
  "Lavadoras automáticas", "Lavadoras semiautomáticas", "Secadoras",
  "Centros de lavado", "Lavasecadoras", "Accesorios",
];

export const filters = [
  { title: "Pickup & Delivery", opts: [["Envío a domicilio", 24], ["Retiro en tienda", 20], ["Envío gratis", 9], ["Listo hoy", 12]] },
  { title: "Marca", opts: [["Whirlpool", 18], ["Samsung", 14], ["LG", 12], ["Mabe", 9], ["Frigidaire", 7], ["Hisense", 5]] },
  { title: "Tipo de carga", opts: [["Carga superior", 13], ["Carga frontal", 11]] },
  { title: "Capacidad de lavado", opts: [["10 a 14 kg", 10], ["15 a 18 kg", 9], ["19 kg o más", 5]] },
];

export const departments = ["Departamentos", "Construcción", "Hogar", "Electrodomésticos", "Herramientas", "Jardín", "Ofertas"];

// ---------- PDP ----------
export const pdp = {
  brand: "LG",
  name: "Lavadora LG Carga Frontal 4.5 cu ft Inverter Black Steel",
  sku: "Item #2514199  ·  Modelo #WM4000HBA",
  price: "$878",
  fin: "Desde $74/mes",
  rating: 4.5,
  reviews: 4416,
  gallery: [IMG[10], IMG[0], IMG[1], IMG[2], IMG[4], IMG[8], IMG[9]],
  colors: [
    { img: IMG[10], price: "$878", name: "Black Steel" },
    { img: IMG[1], price: "$879", name: "Blanco" },
    { img: IMG[0], price: "$878", name: "Grafito" },
  ],
  services: [
    { name: "Instalación", price: "$45", on: true, info: "Un técnico conecta y deja funcionando tu lavadora en tu domicilio." },
    { name: "Garantía Extendida", price: "$89", on: false, info: "Suma hasta 2 años de cobertura adicional sobre la garantía del fabricante, ante fallas o desperfectos." },
    { name: "Retiro de equipo anterior", price: "Gratis", on: false, free: true, info: "Nos llevamos tu lavadora anterior sin cargo, el mismo día de la entrega o instalación." },
  ],
  atGlance: ["Carga frontal", "Motor inverter", "Compatible con app", "Alta eficiencia"],
  specs: [
    ["Marca", "LG"], ["Modelo", "WM4000HBA"], ["Tipo", "Lavadora carga frontal"],
    ["Capacidad", "4.5 cu ft"], ["Color", "Black Steel"], ["Voltaje", "120 V"],
    ["Dimensiones", "27 x 39 x 30 in"], ["Eficiencia", "Alta eficiencia"],
    ["Conectividad", "Wi-Fi"], ["Garantía", "1 año"],
  ],
  beneficios: [
    "Lavado rápido y eficiente", "Motor inverter silencioso", "Ahorro de agua y energía",
    "Tambor de acero inoxidable", "Programas para ropa delicada", "Conectividad inteligente",
  ],
  garantia: [
    ["Garantía del fabricante: 1 año", "Cubre defectos de fabricación desde la fecha de compra."],
    ["Garantía extendida disponible", "Sumá hasta 2 años más de cobertura con Garantía Extendida."],
    ["Cambios y devoluciones", "Sujetos a las políticas de Novey vigentes."],
    ["Requisitos para devolución", "El producto debe conservar factura, empaque y accesorios."],
  ],
  servicios: [
    ["Instalación de lavadora", "Conexión y puesta en marcha por técnico.", "Desde $49"],
    ["Retiro de equipo anterior", "Nos llevamos tu lavadora vieja.", "Gratis"],
    ["Garantía Extendida", "Hasta 2 años más de cobertura.", "Desde $99"],
    ["Servicio técnico autorizado", "Mantenimiento con repuestos originales.", "Incluido"],
  ],
  accesorios: [
    [IMG[11], "Manguera de entrada para lavadora", "$12"],
    [IMG[12], "Kit de instalación", "$35"],
    [IMG[4], "Pedestal para lavadora", "$249"],
    [IMG[8], "Protector de voltaje", "$45"],
    [IMG[15], "Detergente HE", "$18"],
  ],
  opiniones: [
    ["María G.", "12 jun 2026", 5, "Excelente lavadora, lava muy bien y es súper silenciosa. La instalación fue rápida."],
    ["Carlos R.", "5 jun 2026", 4, "Buena capacidad y la app funciona bien. El ciclo de vapor es lo mejor."],
    ["Ana P.", "28 may 2026", 5, "La recomiendo totalmente. Ahorra agua y la ropa queda impecable."],
  ],
  dist: [[5, 72], [4, 18], [3, 6], [2, 2], [1, 2]],
};

export const TABS = [
  "Especificaciones", "Beneficios", "Garantía y devolución",
  "Instalación y servicios", "Accesorios compatibles", "Opiniones",
];
