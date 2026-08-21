import Image from 'next/image';
import { ROUTES } from '../lib/routes';

// 12 — "Nuestra promesa": grilla de beneficios (4 col desktop, tarjeta Pets
// Club ocupa 2 filas). Valores del diseño ÷0.946 (el nodo vino escalado).

type PromiseCardData = {
  id: string;
  bg: string;
  title?: string;
  /** Logo arriba del texto (reemplaza al título en algunas cards) */
  logo?: { src: string; alt: string; w: number; h: number };
  /** Fila de logos bajo el título (caso CMF + Mastercard) */
  logoRow?: { src: string; alt: string; w: number; h: number };
  text?: string;
  href: string;
  image?: {
    src: string;
    alt: string;
    w: number;
    h: number;
    /** posición absoluta (sangra fuera de la card, se recorta) */
    className: string;
  };
};

const ROW_1: PromiseCardData[] = [
  {
    id: 'tarjeta-regalo',
    bg: 'bg-[#C9E7F6]',
    title: 'Tarjeta de regalo',
    text: 'Un regalo especial para cada ocasión.',
    href: ROUTES.tarjetaRegalo,
  },
  {
    id: 'cuotas',
    bg: 'bg-[#FEE8C2]',
    title: 'Tus compras fáciles y a cuotas',
    logoRow: {
      src: '/figma/cmf-mastercard.svg',
      alt: 'Mastercard y CMF',
      w: 66,
      h: 17,
    },
    href: '#compras-a-cuotas',
    image: {
      src: '/figma/0f2cad11f83a786d315eb73a7814c4165d27a754.png',
      alt: 'Hombre mostrando su tarjeta de crédito',
      w: 160,
      h: 224,
      className: 'absolute -bottom-6 -right-1 w-[160px]',
    },
  },
];

const ROW_2: PromiseCardData[] = [
  {
    id: 'puntos-gordos',
    bg: 'bg-[#F9D5D0]',
    title: 'Puntos Gordos',
    text: 'Acumula puntos y cámbialos por productos.',
    href: '#puntos-gordos',
    image: {
      src: '/figma/b80c3f12d32c6776442d0b62d93ed3e33eb5e134.png',
      alt: 'Mujer sonriendo con su celular',
      w: 144,
      h: 208,
      className: 'absolute -bottom-4 right-[10px] w-[144px]',
    },
  },
  {
    id: 'sostenibilidad',
    bg: 'bg-[#C9EBE3]',
    title: 'Sostenibilidad',
    text: 'Integramos una cultura y medio ambiente sostenible.',
    href: '#sostenibilidad',
    image: {
      src: '/figma/e5f1bdad1b98ee4f9fb0b02777302b6ae699a628.png',
      alt: 'Contenedores de reciclaje azul, rojo y verde',
      w: 188,
      h: 109,
      className: 'absolute left-6 top-[116px] w-[188px]',
    },
  },
];

const CARD_MIPRO: PromiseCardData = {
  id: 'mipro',
  bg: 'bg-[#FFF7D6]',
  logo: {
    src: '/figma/2e2aae6241632bec67a2d20cffea113eeaeeff9f.png',
    alt: 'MiPRO Asistencia técnica a domicilio',
    w: 107,
    h: 32,
  },
  text: 'Asistencia técnica especializada a domicilio',
  href: '#mipro',
  image: {
    src: '/figma/81004bb969bd1a8556e3d363d2d9d01c60158c49.png',
    alt: 'Técnico con protección auditiva usando un taladro',
    w: 144,
    h: 192,
    className: 'absolute -bottom-3 -right-4 w-[144px]',
  },
};

const CARD_PRO: PromiseCardData = {
  id: 'redpro',
  bg: 'bg-[#E3E3E3]',
  logo: {
    src: '/figma/0b404fbdb963e82fc645a0da5ab0f9a88a938314.png',
    alt: 'RedPRO Club de contratistas',
    w: 88,
    h: 28,
  },
  text: 'La red de profesionales más grande de Panamá',
  href: '#redpro',
  image: {
    src: '/figma/b5b840eb4502cc3fa90e8f69baef86c97356c570.png',
    alt: 'Contratista sonriente con los brazos cruzados',
    w: 160,
    h: 208,
    className: 'absolute -bottom-2 -right-4 w-[160px]',
  },
};

function CardButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="absolute bottom-6 left-6 inline-flex h-10 items-center rounded-novey border border-[#1A1A1A] px-4 text-sm font-medium text-[#1A1A1A] transition-colors duration-150 hover:bg-black/5"
    >
      Conoce más
    </a>
  );
}

function CardHeader({ card }: { card: PromiseCardData }) {
  return (
    <div className="relative z-10 max-w-[205px]">
      {card.logo ? (
        <img src={card.logo.src} alt={card.logo.alt} width={card.logo.w} height={card.logo.h} />
      ) : (
        <h3 className="text-xl font-medium leading-7 text-[#333333]">{card.title}</h3>
      )}
      {card.logoRow ? (
        <img
          src={card.logoRow.src}
          alt={card.logoRow.alt}
          width={card.logoRow.w}
          height={card.logoRow.h}
          className="mt-3"
        />
      ) : null}
      {card.text ? (
        <p className="mt-4 text-sm leading-5 text-[#666666]">{card.text}</p>
      ) : null}
    </div>
  );
}

function PromiseCard({ card, className }: { card: PromiseCardData; className: string }) {
  return (
    <li className={`relative overflow-hidden rounded-novey p-6 ${card.bg} ${className}`}>
      <CardHeader card={card} />
      {card.image ? (
        <Image
          src={card.image.src}
          alt={card.image.alt}
          width={card.image.w}
          height={card.image.h}
          className={`${card.image.className} h-auto`}
        />
      ) : null}
      <CardButton href={card.href} />
    </li>
  );
}

export default function PromiseSection() {
  return (
    <section aria-labelledby="promesa-heading">
      <div className="mx-auto w-full max-w-[1276px] px-4 sm:px-6 lg:px-6">
        <h2 id="promesa-heading" className="text-2xl font-bold leading-8 text-gray-900">
          Nuestra promesa
        </h2>
        <p className="mt-2 text-sm leading-[21px] text-gray-500">
          Beneficios exclusivos para vos
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[280px_297px]">
          {ROW_1.map((card) => (
            <PromiseCard key={card.id} card={card} className="h-[280px] lg:h-auto" />
          ))}

          {/* Novey Pets Club — tarjeta alta (2 filas en desktop) */}
          <li className="relative h-[420px] overflow-hidden rounded-novey bg-[#BEE2F6] p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-auto">
            <div className="relative z-10 max-w-[205px]">
              <img
                src="/figma/4d7e987c2ff3dbc6f968cc9ed11ad8d4b079be59.png"
                alt="Novey Pets Club"
                width={56}
                height={56}
              />
              <p className="mt-4 text-sm leading-5 text-[#666666]">
                La primera comunidad para los amantes de las mascotas.
              </p>
            </div>
            <Image
              src="/figma/0de8f8de6c04e1286b86ac13506ab8f5ffe73320.png"
              alt="Perro apoyado sobre un gato"
              width={262}
              height={262}
              className="absolute -bottom-4 -right-10 h-auto w-[220px] lg:-bottom-4 lg:-right-[87px] lg:w-[262px]"
            />
            {/* En el diseño el botón queda a media altura, sobre la foto */}
            <a
              href="#novey-pets-club"
              className="absolute bottom-6 left-6 z-10 inline-flex h-10 items-center rounded-novey border border-[#1A1A1A] px-4 text-sm font-medium text-[#1A1A1A] transition-colors duration-150 hover:bg-black/5 lg:bottom-[125px]"
            >
              Conoce más
            </a>
          </li>

          <PromiseCard card={CARD_MIPRO} className="h-[280px] lg:h-auto" />

          {ROW_2.map((card) => (
            <PromiseCard key={card.id} card={card} className="h-[297px] lg:h-auto" />
          ))}

          <PromiseCard card={CARD_PRO} className="h-[297px] lg:h-auto" />
        </ul>
      </div>
    </section>
  );
}
