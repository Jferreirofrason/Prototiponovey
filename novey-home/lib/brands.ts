// Selector global de marcas/sitios del grupo — fuente única de URLs.
// Novey, Cochez y Kohler llevan SIEMPRE a su landing principal (URL absoluta,
// reemplaza cualquier ruta actual). Punto Cochez y CMF quedan sin cambios.
export interface BrandSite {
  label: string;
  url: string;
  /** Marca actual (se resalta) */
  current?: boolean;
  /** Estilo itálico (CMF) */
  italic?: boolean;
}

export const BRAND_SITES: BrandSite[] = [
  { label: 'Novey', url: 'https://prototiponovey.vercel.app/', current: true },
  { label: 'Cochez', url: 'https://cochez-web-mauve.vercel.app/' },
  { label: 'Kohler by Cochez', url: 'https://kohler-panama.vercel.app/' },
  { label: 'Punto Cochez', url: '#punto-cochez' },
  { label: 'CMF', url: '#cmf', italic: true },
];
