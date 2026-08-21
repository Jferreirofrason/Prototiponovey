// ---- Mock data for the Novey checkout prototype ----

export interface Product {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  qty: number;
  /** Imagen del producto (flujo integrado: viene del PDP) */
  image?: string;
  /** Precio anterior para calcular descuento por ofertas */
  oldPrice?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'destacado-1',
    name: 'Sierra circular 7 1/4" 1800W con guía láser',
    brand: 'DEWALT',
    sku: 'NV-destacado-1',
    price: 189.99,
    oldPrice: 229.99,
    qty: 1,
    image: '/images/p-sierra.jpg',
  },
  {
    id: 'destacado-3',
    name: 'Set de brocas para concreto x12 piezas',
    brand: 'TRUPER',
    sku: 'NV-destacado-3',
    price: 24.99,
    qty: 1,
    image: '/images/p-brocas.jpg',
  },
  {
    id: 'entrega-2',
    name: 'Pintura látex interior blanca lavable',
    brand: 'SHERWIN-WILLIAMS',
    sku: 'NV-entrega-2',
    price: 32.99,
    qty: 1,
    image: '/images/p-pintura.jpg',
  },
];

/** Arte real de una tarjeta. Las rutas van con el basePath /checkout. */
export interface CardArt {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface SavedCard {
  id: string;
  label: string;
  brand: string;
  isDefault?: boolean;
  /** Si no hay arte, la miniatura cae al ícono genérico de tarjeta. */
  art?: CardArt;
}

export const SAVED_CARDS: SavedCard[] = [
  {
    id: 'visa',
    label: 'Visa •••• 4242',
    brand: 'Visa',
    isDefault: true,
    art: {
      src: '/checkout/tarjeta-visa-debito.png',
      width: 352,
      height: 221,
      alt: 'Tarjeta Visa de débito con diseño naranja',
    },
  },
  {
    id: 'mc',
    label: 'Mastercard •••• 8888',
    brand: 'Mastercard',
    art: {
      src: '/checkout/tarjeta-mastercard-gold.jpg',
      width: 500,
      height: 318,
      alt: 'Tarjeta Mastercard gold con diseño dorado',
    },
  },
];

export const CMF_CARD: SavedCard = { id: 'cmf', label: 'CMF •••• 9999', brand: 'CMF', isDefault: true };

/** Arte real de la tarjeta CMF Mastercard black. */
export const CMF_CARD_ART: CardArt = {
  src: '/checkout/tarjeta-cmf-black.png',
  width: 1536,
  height: 969,
  alt: 'Tarjeta CMF Mastercard black, negra con líneas verdes y el logo CMF',
};

/**
 * CMF es el único método que ofrece cuotas: ni Tarjeta ni Yappy las tienen.
 * Sólo cantidades, sin declarar tasas ni condiciones financieras (el proyecto
 * no tiene ese dato y CMF no ofrece cuotas sin interés).
 */
export const CMF_INSTALLMENT_COUNTS = [1, 3, 6, 12];

export const CMF_INSTALLMENT_OPTIONS = CMF_INSTALLMENT_COUNTS.map((count) => ({
  count,
  value: `${count} ${count === 1 ? 'cuota' : 'cuotas'}`,
}));

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  distance: string;
  availableToday: boolean;
}

export const STORES: Store[] = [
  { id: 'coronado', name: 'Novey Coronado', address: 'Centro Comercial Coronado, Local 23, Panamá', hours: 'Lun-Sáb: 7:00 AM - 9:00 PM', distance: '1.2 km', availableToday: true },
  { id: 'obarrio', name: 'Novey Obarrio', address: 'Obarrio, Calle 50, Panamá', hours: 'Lun-Sáb: 8:00 AM - 8:00 PM', distance: '3.4 km', availableToday: true },
  { id: 'losangeles', name: 'Novey Los Ángeles', address: 'Avenida Los Ángeles, Panamá', hours: 'Lun-Sáb: 7:00 AM - 9:00 PM', distance: '5.1 km', availableToday: false },
  { id: 'brisas', name: 'Novey Brisas del Golf', address: 'Brisas del Golf, San Miguelito, Panamá', hours: 'Lun-Sáb: 8:00 AM - 9:00 PM', distance: '7.8 km', availableToday: false },
];

export interface Address {
  id: string;
  label: string;
  recipient: string;
  line: string;
  city: string;
  zip: string;
  phone: string;
}

export const ADDRESSES: Address[] = [
  { id: 'home', label: 'Casa', recipient: 'María González', line: 'Calle 51 Este 5707', city: 'Provincia de Panamá', zip: '0832', phone: '+507 6123-4567' },
  { id: 'work', label: 'Trabajo', recipient: 'María González', line: 'Torre Financiera, Piso 12', city: 'Provincia de Panamá', zip: '0801', phone: '+507 6123-4567' },
];

export const DELIVERY_DATES = [
  'Martes 22 de diciembre',
  'Miércoles 23 de diciembre',
  'Jueves 24 de diciembre',
  'Viernes 26 de diciembre',
];

export const GIFT_BALANCE = 50.0;
export const POINTS_BALANCE = 9.0;
export const POINTS_QTY = 900;

export const BRANDS = [
  { name: 'LANCO', desc: 'Pinturas y Recubrimientos de alta calidad' },
  { name: 'INGCO', desc: 'Herramientas profesionales para cada proyecto' },
  { name: 'DYLLU', desc: 'Iluminación moderna y eficiente' },
  { name: 'KOHLER', desc: 'Baños y Sanitarios premium' },
];

// fixed order economics
export const OFFERS_DISCOUNT = 15.0;
export const SHIPPING = 4.99;
export const TAXES = 16.8;
