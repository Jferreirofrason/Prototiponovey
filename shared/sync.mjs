#!/usr/bin/env node
/**
 * Copia los componentes compartidos dentro de cada app antes de `dev` y `build`.
 *
 * novey-home y novey-checkout son deploys separados en Vercel: cada uno sube
 * SOLO su propia carpeta, así que no pueden importar un archivo de fuera. Por
 * eso la fuente de verdad vive en `shared/` y acá se materializa una copia
 * dentro de cada app (marcada como generada, no se edita a mano).
 *
 * En Vercel esta carpeta no existe: el script no hace nada y la app usa la
 * copia que ya viajó con el deploy. Nunca falla el build por esto.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const AVISO = `/* ARCHIVO GENERADO — no editar.
   Fuente: shared/${'%s'}  ·  Se regenera con \`node shared/sync.mjs\` (corre solo en dev y build). */\n\n`;

/** archivo en shared/ -> destinos relativos a la raíz del repo */
const ARCHIVOS = {
  'BrandsCarousel.tsx': [
    'novey-home/components/shared/BrandsCarousel.tsx',
    'novey-checkout/components/shared/BrandsCarousel.tsx',
  ],
  // Logo de marca: la home y el checkout tienen que mostrar EXACTAMENTE el mismo.
  'NoveyLogo.tsx': [
    'novey-home/components/NoveyLogo.tsx',
    'novey-checkout/components/NoveyLogo.tsx',
  ],
  'session.ts': [
    'novey-home/lib/session.ts',
    'novey-checkout/lib/session.ts',
    'novey-prototype/src/lib/session.ts',
  ],
  // Carrito y favoritos: los comparten la home, el PLP/PDP y (el carrito) el checkout.
  'cart.ts': ['novey-home/lib/cart.ts', 'novey-prototype/src/lib/cart.ts'],
  'favorites.ts': ['novey-home/lib/favorites.ts', 'novey-prototype/src/lib/favorites.ts'],
};

let copiados = 0;
for (const [nombre, destinos] of Object.entries(ARCHIVOS)) {
  const origen = join(here, nombre);
  if (!existsSync(origen)) continue;
  const contenido = readFileSync(origen, 'utf8');
  for (const destino of destinos) {
    const salida = resolve(here, '..', destino);
    mkdirSync(dirname(salida), { recursive: true });
    const nuevo = AVISO.replace('%s', nombre) + contenido;
    // Sólo escribe si cambió: evita invalidar el fast refresh en cada arranque.
    if (existsSync(salida) && readFileSync(salida, 'utf8') === nuevo) continue;
    writeFileSync(salida, nuevo);
    copiados++;
    console.log(`shared → ${destino}`);
  }
}

if (copiados === 0) console.log('shared: sin cambios');
