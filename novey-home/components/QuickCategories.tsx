import Image from 'next/image';
import { ROUTES } from '../lib/routes';

// Sub-banners de categoría bajo el hero: compactos y horizontales para no
// competir con el banner principal. Altura por breakpoint (160 / 176 / 192),
// toda la escala de 8. Cada card lleva su nombre de categoría (awareness) y
// un CTA textual; la card entera es el enlace.

interface SubBanner {
  image: string;
  /** Encuadre para no cortar el producto (object-position). */
  pos: string;
  name: string;
  cta: string;
  alt: string;
  href: string;
}

const BANNERS: SubBanner[] = [
  {
    image: '/images/ambiente.jpg',
    pos: 'center 60%',
    name: 'Salas',
    cta: 'Ver colección',
    alt: 'Living moderno con sofá gris, biblioteca y lámpara de pie',
    href: ROUTES.categoria,
  },
  {
    image: '/images/colchones.jpg',
    pos: 'center 55%',
    name: 'Dormitorios',
    cta: 'Ver colección',
    alt: 'Dormitorio luminoso con cama tendida en tonos claros',
    href: ROUTES.categoria,
  },
  {
    image: '/images/p-butaca.jpg',
    pos: 'center 40%',
    name: 'Sillones',
    cta: 'Ver productos',
    alt: 'Butaca reclinable beige con mesas auxiliares de madera',
    href: ROUTES.categoria,
  },
];

/** Ícono de flecha (acompaña al CTA, nunca lo reemplaza). */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function QuickCategories() {
  return (
    <section aria-labelledby="quick-categories-title" className="w-full">
      <h2 id="quick-categories-title" className="sr-only">
        Categorías destacadas de muebles
      </h2>
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        {/* Mobile: carrusel con la siguiente card asomada; md+: fila de 3 iguales */}
        <ul className="scroll-x flex snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:gap-6">
          {BANNERS.map((b) => (
            <li key={b.name} className="w-[78vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
              <a
                href={b.href}
                aria-label={`${b.name} · ${b.cta}`}
                className="group relative block h-40 overflow-hidden rounded-novey shadow-md outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-novey-blue focus-visible:ring-offset-2 active:scale-[0.99] md:h-44 lg:h-48"
              >
                <Image
                  src={b.image}
                  alt={b.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  style={{ objectPosition: b.pos }}
                  sizes="(min-width: 768px) 33vw, 78vw"
                />
                {/* Oscurecido de izquierda, lo justo para AA sobre el texto */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
                />
                <span className="absolute inset-y-0 left-0 flex flex-col justify-center gap-2 p-5">
                  <span className="text-[20px] font-bold leading-tight text-white drop-shadow-sm">
                    {b.name}
                  </span>
                  <span className="inline-flex h-11 w-fit items-center gap-1.5 rounded-novey bg-white px-4 text-sm font-semibold text-text-ink shadow-sm transition-colors duration-150 group-hover:bg-novey-blue group-hover:text-white">
                    {b.cta}
                    <ArrowIcon />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
