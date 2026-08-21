import Image from 'next/image';
import { ROUTES } from '../lib/routes';

const ARROW_MAIN = '/figma/130ef74ba4e901ad9fde0876779121dfb5d60365.svg';
const ARROW_EXPLORAR = '/figma/97e762bc734a8814fde081800bec2797145e3997.svg';
const ARROW_CATALOGO = '/figma/1fb70c22a04e89ffc2908b40cfdf4db2415f130a.svg';

const SIDE_CARDS = [
  {
    image: '/images/ambiente.jpg',
    imageAlt: 'Living con sofá y mesa de centro en tonos neutros',
    title: 'Ambiente perfecto para tu hogar',
    subtitle: 'Muebles y decoración',
    cta: 'Explorar',
    arrow: ARROW_EXPLORAR,
    href: ROUTES.categoria,
  },
  {
    image: '/images/herramientas.jpg',
    imageAlt: 'Herramientas de mano ordenadas en un panel de taller',
    title: 'Herramientas profesionales',
    subtitle: 'Para proyectos de todo tipo',
    cta: 'Ver catálogo',
    arrow: ARROW_CATALOGO,
    href: ROUTES.catalogos,
  },
];

export default function NewsBrands() {
  return (
    <section aria-labelledby="news-brands-heading" className="w-full">
      <h2 id="news-brands-heading" className="sr-only">
        Novedades y marcas
      </h2>
      <div className="mx-auto grid w-full max-w-page gap-6 px-4 sm:px-6 lg:grid-cols-[621fr_494fr] lg:px-6">
        {/* Bloque grande: Mega Oferta colchones */}
        <div className="relative flex min-h-[280px] flex-col items-start gap-4 overflow-hidden rounded-novey p-6">
          <Image
            src="/images/colchones.jpg"
            alt="Dormitorio luminoso con cama tendida en blanco"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 621px"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
          <span className="relative inline-flex items-center rounded-novey bg-[#d32f2f] px-2.5 py-[5px] text-[10px] font-semibold leading-[15px] text-white">
            Mega Oferta
          </span>
          <h3 className="relative max-w-[412px] text-[20px] font-bold leading-[26px] text-white">
            Colchones Premium con hasta 40% de descuento
          </h3>
          <p className="relative max-w-[371px] text-[13px] leading-5 text-white/90">
            Encuentra tu descanso perfecto con nuestra colección de colchones de alta calidad.
          </p>
          <a
            href={ROUTES.ofertas}
            className="relative inline-flex h-11 items-center gap-2 rounded-novey bg-novey-blue px-4 text-[12px] leading-[18px] text-white transition-colors duration-150 hover:bg-novey-blue-dark lg:h-10"
          >
            Ver colchones
            <img src={ARROW_MAIN} alt="" className="size-3" />
          </a>
        </div>

        {/* Dos tarjetas apiladas con overlay */}
        <div className="flex flex-col gap-4">
          {SIDE_CARDS.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group relative block h-[140px] overflow-hidden rounded-novey shadow-[0px_2px_7px_0px_rgba(0,0,0,0.08)] lg:h-[132px]"
            >
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 494px"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5" />
              <span className="absolute inset-0 flex flex-col items-start justify-end p-3.5">
                <span className="text-[13px] font-bold leading-[17px] text-white">{card.title}</span>
                <span className="mt-1.5 text-[11px] leading-4 text-white/85">{card.subtitle}</span>
                <span className="mt-2 inline-flex h-[33px] items-center gap-2 rounded-novey bg-novey-blue px-3.5 text-[12px] leading-[18px] text-white transition-colors duration-150 group-hover:bg-novey-blue-dark">
                  {card.cta}
                  <img src={card.arrow} alt="" className="size-2.5" />
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
