# Prototipo Novey — prototiponovey.vercel.app

Tres apps desplegadas como proyectos separados de Vercel, unificadas bajo un
solo dominio con rewrites:

| Carpeta | Proyecto Vercel | Ruta pública |
| --- | --- | --- |
| `novey-home/` | `prototiponovey` (dominio público) y `novey-home` | `/` — home, carrito, favoritos, minicart |
| `novey-checkout/` | `novey-checkout` | `/checkout` — pasos, CMF, confirmación |
| `novey-prototype/` | `novey-plp-y-pdp` | `/productos` — PLP y PDP |
| `shared/` | — | fuente única: carrito, favoritos, sesión, logo, carrusel de marcas |

## Cómo correr en local

```
cd novey-home      && npm install && npm run dev   # puerto 3050
cd novey-checkout  && npm install && npm run dev   # puerto 3000
cd novey-prototype && npm install && npm run dev   # puerto 5181
```

`shared/sync.mjs` copia los archivos compartidos dentro de cada app; corre solo
en `predev`/`prebuild`, no hace falta ejecutarlo a mano.

## Deploy

Cada app se deploya con `npx vercel --prod` desde su carpeta. El dominio
público `prototiponovey.vercel.app` corresponde al proyecto `prototiponovey`,
que se deploya desde `novey-home`.

El estado entre apps se comparte por localStorage (`novey-cart`,
`novey-favorites`, `novey-session`) más CustomEvents, bajo el mismo origen.
