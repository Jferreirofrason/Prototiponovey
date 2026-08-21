// Rutas temporales centralizadas — la Home es un prototipo; los destinos
// reales se conectan cuando exista el resto del sitio.
export const ROUTES = {
  home: '/',
  ofertas: '/productos',
  producto: '/productos',
  categoria: '/productos',
  departamentos: '#departamentos',
  navidad: '#navidad',
  novedades: '#novedades',
  catalogos: '#catalogos',
  rastrearOrden: '/rastrear-orden',
  tarjetaRegalo: '#tarjeta-regalo',
  empresas: '#empresas',
  /** El ícono del navbar abre el carrito; el pago es el paso siguiente. */
  carrito: '/carrito',
  carritoCheckout: '/checkout',
  favoritos: '/favoritos',
  login: '/login',
  videos: '#videos',
  marcas: '#marcas',
} as const;

export type RouteKey = keyof typeof ROUTES;
