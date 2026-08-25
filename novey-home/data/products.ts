// Cards según el board "Product Card - Variables" (6060:202075) de Figma,
// pobladas con productos distintos (foto + título coherentes por card).

export type ProductBadge =
  | 'oferta-exclusiva-cmf' // pill verde "OFERTA EXCLUSIVA" + logo CMF
  | 'oferta' // pill roja "OFERTA"
  | 'oferta-exclusiva-redpro'; // pill negra "Oferta EXCLUSIVa" + logo RedPRO

// Variantes de precio del board
export type PriceStyle =
  | 'offer' // precio rojo + precio anterior "Precio oferta"
  | 'regular' // precio negro, opcional "$xxx Precio anterior"
  | 'cmf'; // precio verde + "Precio CMF · 36 cuotas"

// Estados de disponibilidad del board
export type Availability =
  | 'in-stock' // punto verde + "Disponible en Novey <sucursal>"
  | 'low-stock' // punto verde + "<sucursal> |quedan 3 unidades"
  | 'delivery-days' // punto azul + "Disponible en 3 días"
  | 'out-of-stock'; // sin stock: no se puede agregar al carrito

export type VariantOptionState = 'selected' | 'default' | 'disabled';

// Selector de variantes (arriba de la marca): dots de color o chips
export interface VariantSelector {
  label: string;
  kind: 'color' | 'chips';
  colors?: string[];
  /** Indicador de más colores, ej. "+2" */
  more?: string;
  options?: { label: string; state: VariantOptionState }[];
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  /** Precio actual, ej. "$189.99" */
  price: string;
  /** Unidad junto al precio, ej. "/ m²" */
  priceUnit?: string;
  /** Precio anterior, ej. "$229.99" */
  oldPrice?: string;
  /** Etiqueta junto al precio anterior, ej. "Precio oferta" */
  oldPriceLabel?: string;
  badge?: ProductBadge;
  /** Variante de precio de la card (default: 'offer') */
  priceStyle?: PriceStyle;
  /** Estado de disponibilidad (default: 'low-stock') */
  availability?: Availability;
  /** Selector de variantes del producto (Color, Medida, etc.) */
  variants?: VariantSelector;
  /** Id de producto del PDP (/productos/producto/[id]) al que linkea la card */
  pdpId?: number;
  /** Sucursal con stock (link azul) */
  store: string;
  /** Nota de stock; en el diseño viene pegada al pipe: "|quedan 3 unidades" */
  stockNote: string;
  image: string;
}

const base = {
  store: 'Brisas del Golf',
  stockNote: 'quedan 3 unidades',
} as const;

// Dots de color del board (navy, blanco, azul, rojo, verde, amarillo, +2)
const COLOR_DOTS: VariantSelector = {
  label: 'Color',
  kind: 'color',
  colors: ['#16205E', '#FFFFFF', '#1D4ED8', '#DC2626', '#16A34A', '#EAB308'],
  more: '+2',
};

// 05 — Productos Destacados
export const featuredProducts: Product[] = [
  {
    id: 'destacado-1',
    pdpId: 1,
    ...base,
    brand: 'DEWALT',
    name: 'Sierra circular 7 1/4" 1800W con guía láser',
    price: '$189.99',
    oldPrice: '$229.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta-exclusiva-cmf',
    image: '/images/p-sierra.jpg',
  },
  {
    id: 'destacado-2',
    pdpId: 2,
    ...base,
    brand: 'KITCHENAID',
    name: 'Batidora de pie Artisan 4.8L',
    price: '$329.99',
    oldPrice: '$399.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta',
    availability: 'in-stock',
    variants: COLOR_DOTS,
    image: '/images/p-batidora.jpg',
  },
  {
    id: 'destacado-3',
    pdpId: 3,
    ...base,
    brand: 'TRUPER',
    name: 'Set de brocas para concreto x12 piezas',
    price: '$24.99',
    oldPrice: '$32.99',
    oldPriceLabel: 'Precio anterior',
    priceStyle: 'regular',
    variants: {
      label: 'Medida',
      kind: 'chips',
      options: [
        { label: '1/4"', state: 'selected' },
        { label: '3/8"', state: 'default' },
        { label: '1/2"', state: 'disabled' },
        { label: '3/4"', state: 'default' },
        { label: '1"', state: 'default' },
      ],
    },
    image: '/images/p-brocas.jpg',
  },
  {
    id: 'destacado-4',
    pdpId: 4,
    ...base,
    brand: 'OSTER',
    name: 'Cafetera espresso automática 15 bares',
    price: '$119.99',
    priceStyle: 'cmf',
    availability: 'delivery-days',
    image: '/images/p-cafetera.jpg',
  },
];

// 06 — Entrega rápida
export const fastDeliveryProducts: Product[] = [
  {
    id: 'entrega-1',
    pdpId: 5,
    ...base,
    brand: 'DEWALT',
    name: 'Sierra circular 6 1/2" 20V MAX inalámbrica',
    price: '$89.99',
    oldPrice: '$109.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta-exclusiva-cmf',
    image: '/images/p-lijadora.jpg',
  },
  {
    id: 'entrega-2',
    pdpId: 6,
    ...base,
    brand: 'SHERWIN-WILLIAMS',
    name: 'Pintura látex interior blanca lavable',
    price: '$32.99',
    oldPrice: '$39.99',
    oldPriceLabel: 'Precio oferta',
    variants: {
      label: 'Presentación',
      kind: 'chips',
      options: [
        { label: '1/4 gal', state: 'selected' },
        { label: '1 gal', state: 'default' },
        { label: '5 gal', state: 'disabled' },
        { label: 'Cubeta', state: 'default' },
      ],
    },
    image: '/images/p-pintura.jpg',
  },
  {
    id: 'entrega-3',
    pdpId: 7,
    ...base,
    brand: 'PHILIPS',
    name: 'Lámpara colgante moderna para comedor',
    price: '$59.99',
    priceStyle: 'regular',
    availability: 'in-stock',
    variants: {
      label: 'Estilo',
      kind: 'chips',
      options: [
        { label: 'Clásico', state: 'selected' },
        { label: 'Moderno', state: 'default' },
        { label: 'Industrial', state: 'disabled' },
      ],
    },
    image: '/images/p-lampara.jpg',
  },
  {
    id: 'entrega-4',
    pdpId: 8,
    ...base,
    brand: 'TRUPER',
    name: 'Escalera tijera de aluminio 6 peldaños',
    price: '$119.99',
    badge: 'oferta-exclusiva-redpro',
    priceStyle: 'cmf',
    image: '/images/p-escalera.jpg',
  },
];

// 06 — Outlet Muebles (3 cards junto al banner)
export const outletProducts: Product[] = [
  {
    id: 'outlet-1',
    pdpId: 9,
    ...base,
    brand: 'SAFAVIEH',
    name: 'Alfombra persa decorativa 160x230cm',
    price: '$149.99',
    oldPrice: '$219.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta-exclusiva-cmf',
    variants: {
      label: 'Dimensiones',
      kind: 'chips',
      options: [
        { label: '120x170', state: 'default' },
        { label: '160x230', state: 'selected' },
        { label: '200x290', state: 'disabled' },
        { label: '240x340', state: 'default' },
      ],
    },
    image: '/images/p-alfombra.jpg',
  },
  {
    id: 'outlet-2',
    pdpId: 10,
    ...base,
    brand: 'ASHLEY',
    name: 'Mesa de comedor extensible 6 puestos',
    price: '$499.99',
    oldPrice: '$699.99',
    oldPriceLabel: 'Precio oferta',
    availability: 'in-stock',
    variants: {
      label: 'Acabado',
      kind: 'chips',
      options: [
        { label: 'Mate', state: 'selected' },
        { label: 'Satinado', state: 'default' },
        { label: 'Brillante', state: 'disabled' },
      ],
    },
    image: '/images/p-mesa.jpg',
  },
  {
    id: 'outlet-3',
    pdpId: 11,
    ...base,
    brand: 'ASHLEY',
    name: 'Sofá modular 3 puestos gris',
    price: '$899.99',
    oldPrice: '$1,199.99',
    oldPriceLabel: 'Precio anterior',
    priceStyle: 'regular',
    variants: COLOR_DOTS,
    image: '/images/p-sofa.jpg',
  },
  {
    // 4ª card: solo visible en mobile para cerrar la grilla 2×2
    id: 'outlet-4',
    pdpId: 12,
    ...base,
    brand: 'ASHLEY',
    name: 'Butaca reclinable tapizada beige',
    price: '$299.99',
    oldPrice: '$449.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta',
    availability: 'in-stock',
    image: '/images/p-butaca.jpg',
  },
];

// 07 — Imprescindibles de Navidad
export const navidadProducts: Product[] = [
  {
    id: 'navidad-1',
    pdpId: 13,
    ...base,
    brand: 'NOMA',
    name: 'Árbol de Navidad 2.10m con luces LED',
    price: '$189.99',
    oldPrice: '$249.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta-exclusiva-cmf',
    image: '/images/p-arbol.jpg',
  },
  {
    id: 'navidad-2',
    pdpId: 14,
    ...base,
    brand: 'PHILIPS',
    name: 'Guirnalda de luces LED multicolor',
    price: '$19.99',
    oldPrice: '$24.99',
    oldPriceLabel: 'Precio oferta',
    variants: {
      label: 'Largo',
      kind: 'chips',
      options: [
        { label: '5m', state: 'default' },
        { label: '10m', state: 'selected' },
        { label: '15m', state: 'disabled' },
        { label: '20m', state: 'default' },
      ],
    },
    image: '/images/p-luces.jpg',
  },
  {
    id: 'navidad-3',
    pdpId: 15,
    ...base,
    brand: 'NOMA',
    name: 'Corona navideña con luces 60cm',
    price: '$34.99',
    oldPrice: '$44.99',
    oldPriceLabel: 'Precio oferta',
    badge: 'oferta',
    availability: 'delivery-days',
    image: '/images/p-corona.jpg',
  },
  {
    id: 'navidad-4',
    pdpId: 16,
    ...base,
    brand: 'NOMA',
    name: 'Guirnalda de pino artificial con luces 2.7m',
    price: '$29.99',
    priceStyle: 'regular',
    badge: 'oferta-exclusiva-redpro',
    variants: {
      label: 'Grosor',
      kind: 'chips',
      options: [
        { label: 'Delgado', state: 'selected' },
        { label: 'Medio', state: 'default' },
        { label: 'Grueso', state: 'disabled' },
      ],
    },
    image: '/images/p-guirnalda.jpg',
  },
];

// 06 — chips de filtro "Entrega rápida"
export const fastDeliveryFilters = [
  'Todos',
  'Herramientas',
  'Pinturas',
  'Electricidad',
  'Hogar',
  'Jardín',
] as const;

// 06 — Departamentos Novey (tiles con foto)
export interface Department {
  id: string;
  name: string;
  image: string;
}

export const departments: Department[] = [
  { id: 'linea-blanca', name: 'Línea blanca', image: '/figma/f755af8910cf2dbf5f4cbff93eedca3785566059.png' },
  { id: 'muebles', name: 'Muebles', image: '/figma/7ab8cabd67cc87a2648fa242c081fab9a1ce354b.png' },
  { id: 'iluminacion', name: 'Iluminación', image: '/figma/80067ba59975b3afed52a4a010f0ad0269fca01b.png' },
  { id: 'cocina', name: 'Cocina', image: '/figma/5f5349430232ae1c4d60472dff1f82cdb416ca7c.png' },
  { id: 'construccion', name: 'Construcción', image: '/figma/55db9e34bd597e3e133d80b49912e52dfc4e3e37.png' },
  { id: 'ferreteria', name: 'Ferretería', image: '/figma/52633368f1c82491b888c6f242646568cda4ca02.png' },
];

/**
 * Catálogo completo del prototipo. Favoritos guarda sólo ids y resuelve el
 * producto acá, así los datos nunca se duplican ni se desincronizan.
 */
export const ALL_PRODUCTS: Product[] = Array.from(
  new Map(
    [...featuredProducts, ...fastDeliveryProducts, ...outletProducts, ...navidadProducts].map(
      (p) => [p.id, p] as const,
    ),
  ).values(),
);

/**
 * Imagen de respaldo para el mini carrito: los ítems guardados por versiones
 * viejas del carrito (o por otras apps del dominio) pueden venir sin `image`;
 * si el id está en el catálogo, la miniatura se resuelve desde acá.
 */
const IMAGEN_POR_ID = new Map(ALL_PRODUCTS.map((p) => [p.id, p.image]));
export function imagenPorId(id: string): string | undefined {
  return IMAGEN_POR_ID.get(id);
}
