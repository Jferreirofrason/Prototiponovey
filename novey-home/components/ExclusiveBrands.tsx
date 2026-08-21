'use client';

// 11 — "Nuestras marcas exclusivas". El carrusel vive en `shared/BrandsCarousel.tsx`
// (fuente única compartida con la confirmación de compra del checkout); acá sólo
// se le pasan el título y el subtítulo de esta página.

import BrandsCarousel from './shared/BrandsCarousel';
import { ROUTES } from '../lib/routes';

export default function ExclusiveBrands() {
  return (
    <BrandsCarousel
      title="Nuestras marcas exclusivas"
      subtitle="Productos de calidad respaldados por las mejores marcas"
      headingId="marcas-heading"
      exploreHref={ROUTES.marcas}
    />
  );
}
