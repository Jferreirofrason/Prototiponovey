import Image from 'next/image';
import { ROUTES } from '../lib/routes';

const CATEGORIES = [
  {
    image: '/figma/a5de832b80d36c1ea527fc0faa956fdecbc25a91.png',
    arrow: '/figma/32c4e21c6d9eb8c8bc43190f2d4e46994f471826.svg',
    alt: 'Árbol de Navidad decorado junto a una ventana',
    href: ROUTES.navidad,
  },
  {
    image: '/figma/3175951b8a96b3832490c59baf834cbd6b97334b.png',
    arrow: '/figma/41a4f9abf8b19053b2420dfbf0981220ec5e8ece.svg',
    alt: 'Regalos luminosos navideños con moños rojos en el jardín',
    href: ROUTES.navidad,
  },
  {
    image: '/figma/230cebd046cc9c7a85a39c4f0e5a97e4a5a786b2.png',
    arrow: '/figma/0d27cdf5f16edd2f5849aa4f73fe37de4c4eb57e.svg',
    alt: 'Bastones de caramelo decorativos frente a una casa iluminada',
    href: ROUTES.navidad,
  },
];

export default function QuickCategories() {
  return (
    <section aria-labelledby="quick-categories-title" className="w-full">
      <h2 id="quick-categories-title" className="sr-only">
        Categorías destacadas de Navidad
      </h2>
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        <ul className="scroll-x flex snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:gap-6">
          {CATEGORIES.map((cat) => (
            <li key={cat.image} className="w-[70vw] max-w-[280px] shrink-0 snap-start md:w-auto md:max-w-none">
              <a
                href={cat.href}
                className="group relative block h-[220px] overflow-hidden rounded-novey shadow-lg md:h-[248px]"
              >
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  sizes="(min-width: 768px) 33vw, 70vw"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent"
                />
                <span className="absolute bottom-6 left-6 flex h-11 items-center gap-2 rounded-novey bg-white px-6 text-sm font-semibold text-[#101828] shadow-md transition-colors duration-150 group-hover:bg-gray-100">
                  Ver ahora
                  <img src={cat.arrow} alt="" className="size-4" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
