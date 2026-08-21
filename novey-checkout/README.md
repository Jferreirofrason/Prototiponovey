# Novey · PLP Prototype

Prototipo web responsive de la Product Listing Page (PLP) de Novey — para mostrar al equipo cómo se verían las product cards en contexto real.

Hecho en **Next.js 14 (App Router) + Tailwind CSS + TypeScript**. Sin backend, datos mockeados localmente.

---

## Qué incluye

**Pantalla única — PLP directa, sin landing:**

- Header de Novey (logo, buscador, login, carrito)
- Breadcrumb (Inicio › Herramientas › Herramientas eléctricas › Taladros)
- Título de categoría + cantidad de productos
- Sort bar con chips activos + dropdown de ordenamiento
- Sidebar de filtros (Categoría · Marca · Precio · Disponibilidad · Beneficios)
- Mobile filter bar (Filtros + Ordenar como botones pill)
- Grilla responsive de product cards
- Paginación

**Product cards** con variedad de estados:

- Base (sin atributos)
- Atributo Color (swatches)
- Atributo Medida / Presentación / Espesor / Diámetro / Acabado / Tamaño (pills)
- Estados: Oferta · RedPro · Envío gratis · Bajo stock · Disponibilidad futura · Instalación MiPro · Nuevo
- Favorito + compartir

**Microinteracciones:**

- Hover en card (lift + shadow)
- Hover en CTA
- Favorito toggle visual
- Selector de atributo activo
- Dropdown de ordenamiento

---

## Responsive

| Viewport | Grid | Sidebar |
|----------|------|---------|
| `≥1280px` (xl) | 4 columnas | Visible |
| `≥768px` (md) | 3 columnas | Visible |
| `<768px` (mobile) | 2 columnas | Modal/oculta |

---

## Stack

- Next.js 14.2 con App Router
- React 18
- TypeScript
- Tailwind CSS 3.4
- Sin librerías externas (todo native CSS + SVG icons inline)

---

## Correr localmente

```bash
cd novey-plp
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Deploy a Vercel

### Opción 1 — Desde la UI de Vercel

1. Subí el directorio `novey-plp/` a un repo de GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importá el repo.
3. Vercel detecta automáticamente Next.js.
4. **Deploy** → te da una URL del tipo `novey-plp.vercel.app`.

### Opción 2 — Vercel CLI

```bash
cd novey-plp
npx vercel
```

Seguir el wizard. La primera vez te crea el proyecto, las siguientes hacen redeploy.

> ⚠️ **No tocar el link estable del equipo.** Este prototipo va a un proyecto Vercel separado. Si te pregunta "Link to existing project?", decir **N** y crear uno nuevo.

---

## Estructura del proyecto

```
novey-plp/
├── app/
│   ├── layout.tsx       # Root layout con fuente Noto Sans
│   ├── page.tsx         # PLP (pantalla principal)
│   └── globals.css      # Variables CSS + Tailwind
├── components/
│   ├── Header.tsx
│   ├── Breadcrumb.tsx
│   ├── Sidebar.tsx           # Filtros desktop
│   ├── SortBar.tsx           # Sort + chips desktop
│   ├── MobileFilterBar.tsx   # Filtros mobile
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   └── Pagination.tsx
├── data/
│   └── products.ts      # 16 productos mockeados
├── tailwind.config.ts   # Tokens Novey
├── next.config.js
└── package.json
```

---

## Tokens de diseño Novey aplicados

Del Manual de Marca oficial (Pantone 2935 C):

| Token | Valor | Uso |
|-------|-------|-----|
| `novey-blue` | `#0055B8` | CTA principal, links, acentos |
| `novey-blue-dark` | `#003DA5` | Hover de CTA |
| `novey-blue-darker` | `#002F6C` | RedPro |
| `novey-red` | `#ED1C24` | Badge oferta |
| `text-primary` | `#201D18` | Texto principal |
| `text-secondary` | `#4A5565` | Texto secundario |
| `text-tertiary` | `#717171` | Labels, hints |
| `feedback-success-dark` | `#085E36` | Envío gratis |

Tipografía: **Noto Sans** (oficial Novey para Web & App).

---

## Notas para discusión interna

- **Sin naranja**: el diseño respeta la restricción del equipo (color de competidor prohibido).
- **Base card**: la card sin atributos sirve como referencia del componente más limpio.
- **Atributos variados**: cada card muestra un atributo diferente (no todas con color) para evaluar cómo escala el sistema con distintos tipos de variant blocks.
- **Mobile**: 2 columnas con cards a ~163px, atributos largos pueden truncar (tema a discutir UX).
- **No es una landing**: la primera pantalla es directamente la PLP.

---

## Próximos pasos sugeridos

1. Conectar a datos reales (Adobe Commerce / Magento API)
2. Implementar filtros funcionales con query params
3. Modal de filtros en mobile (UI ya tiene el botón)
4. Búsqueda con autocomplete
5. Lazy loading de imágenes con Intersection Observer
6. Skeleton states durante carga
