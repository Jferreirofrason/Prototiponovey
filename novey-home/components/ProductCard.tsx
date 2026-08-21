import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../data/products';
import FavoriteButton from './FavoriteButton';

// Íconos exportados del Figma
const ICON_HEART = '/figma/ee4e8b6098f19d45be72f15f8ae49529106303e9.svg';
const ICON_SHARE = '/figma/77f2509fb36a8dfb250dd8b82e154e2cedc2a34c.svg';
const ICON_DOT = '/figma/d22510dda3c49188bf133b88d39a741bc0e731b0.svg';
const LOGO_REDPRO = '/figma/febf363239e3f543b75374d22c465accb1ecefba.svg';
// Logo CMF exportado de Figma como SVG único
const CMF_LOGO = '/figma/cmf-logo.svg';

function CmfLogo() {
  return <img alt="CMF" src={CMF_LOGO} className="h-3 w-[21px] shrink-0" />;
}

function Badge({ badge }: { badge: NonNullable<Product['badge']> }) {
  if (badge === 'oferta') {
    return (
      <span className="flex min-h-6 items-center justify-center rounded-novey bg-novey-red px-2 py-1 text-[11px] font-bold text-white">
        OFERTA
      </span>
    );
  }
  if (badge === 'oferta-exclusiva-redpro') {
    return (
      <span className="flex min-h-[23px] flex-wrap items-center gap-1 rounded-novey bg-text-primary px-2 py-1 text-[11px] font-bold text-white">
        Oferta EXCLUSIVa
        <img alt="RedPRO" src={LOGO_REDPRO} className="h-[9px] w-[43px]" />
      </span>
    );
  }
  return (
    <span className="flex min-h-[23px] flex-wrap items-center gap-1 rounded-novey bg-feedback-success-bg px-2 py-1 text-[11px] font-bold text-feedback-success-dark">
      OFERTA EXCLUSIVA
      <CmfLogo />
    </span>
  );
}

// Selector de variantes del board "Product Card - Variables":
// dots de color o chips (seleccionado azul, deshabilitado gris)
function VariantSelector({ selector }: { selector: NonNullable<Product['variants']> }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] leading-4 text-text-tertiary">{selector.label}</p>
      {selector.kind === 'color' ? (
        <div className="flex items-center gap-2">
          {selector.colors?.map((c) => (
            <span
              key={c}
              aria-hidden="true"
              className="size-[18px] rounded-full border border-border-medium"
              style={{ backgroundColor: c }}
            />
          ))}
          {selector.more && (
            <span className="text-[11px] leading-4 text-text-tertiary">{selector.more}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {selector.options?.map((o) => (
            <span
              key={o.label}
              className={`flex h-[26px] items-center rounded-novey border px-2 text-[12px] leading-4 ${
                o.state === 'selected'
                  ? 'border-novey-blue font-semibold text-novey-blue'
                  : o.state === 'disabled'
                    ? 'border-border-light text-border-medium'
                    : 'border-border-medium text-[#111827]'
              }`}
            >
              {o.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Estados de disponibilidad del board: en stock / pocas unidades / entrega en días
function Availability({ product }: { product: Product }) {
  const kind = product.availability ?? 'low-stock';
  if (kind === 'in-stock') {
    return (
      <p className="flex items-center gap-1.5 text-[12px] font-medium leading-4">
        <img alt="" src={ICON_DOT} className="h-1 w-1 shrink-0" />
        <span>
          <span className="text-[#4B5563]">Disponible en </span>
          <span className="text-novey-blue-dark">Novey {product.store}</span>
        </span>
      </p>
    );
  }
  if (kind === 'delivery-days') {
    return (
      <p className="flex items-center gap-1.5 text-[12px] font-medium leading-4">
        <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-novey-blue-dark" />
        <span className="text-novey-blue-dark">Disponible en 3 días</span>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-[12px] font-medium leading-4">
      <img alt="" src={ICON_DOT} className="h-1 w-1 shrink-0" />
      <span>
        <span className="text-novey-blue-dark">{product.store}</span>{' '}
        <span className="text-[#4B5563]">|{product.stockNote}</span>
      </span>
    </p>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  // El PDP del flujo unificado muestra este producto (nombre/marca/precio/imagen van por query)
  const pdpQuery = new URLSearchParams({
    nombre: product.name,
    marca: product.brand,
    precio: product.price,
    img: product.image,
    ...(product.oldPrice ? { oldprecio: product.oldPrice } : {}),
  });
  const pdpHref = `/productos/producto/${product.pdpId ?? 1}?${pdpQuery.toString()}`;
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-novey border border-border-light bg-white shadow-card transition-shadow duration-150 hover:shadow-card-hover">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-novey bg-[#f5f5f5] lg:aspect-auto lg:h-[264px]">
        <Link href={pdpHref} aria-label={`Ver detalle de ${product.name}`} className="absolute inset-0 z-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 264px, 72vw"
          />
        </Link>
        {product.badge && (
          <div className="absolute left-3 top-3 max-w-[calc(100%-56px)]">
            <Badge badge={product.badge} />
          </div>
        )}
        <FavoriteButton
          productId={product.id}
          productName={product.name}
          productImage={product.image}
          className="absolute right-3 top-3 h-8 w-8"
        />
        <button
          type="button"
          aria-label={`Compartir ${product.name}`}
          className="absolute right-3 top-[52px] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-colors duration-150 hover:bg-novey-blue-pale"
        >
          <img alt="" src={ICON_SHARE} className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 lg:p-4">
        <div className="flex flex-1 flex-col gap-3 pb-6">
          {product.variants && <VariantSelector selector={product.variants} />}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold leading-4 text-text-tertiary">{product.brand}</p>
            <h3 className="text-[14px] font-medium leading-5 text-text-primary">
              <Link href={pdpHref} className="transition-colors duration-150 hover:text-novey-blue">
                {product.name}
              </Link>
            </h3>
          </div>
          {/* Variantes de precio del board "Product Card - Variables" */}
          {product.priceStyle === 'cmf' ? (
            <div className="flex flex-col gap-1 text-feedback-success-dark">
              <p className="text-[20px] font-bold leading-7">{product.price}</p>
              <p className="text-[11px] leading-4">Precio CMF · 36 cuotas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p
                className={`text-[20px] font-bold leading-7 ${
                  product.priceStyle === 'regular' ? 'text-text-primary' : 'text-novey-red'
                }`}
              >
                {product.price}
                {product.priceUnit && (
                  <span className="text-[14px] font-normal text-text-tertiary"> {product.priceUnit}</span>
                )}
              </p>
              {product.oldPrice && (
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[14px] leading-5 text-text-disabled">{product.oldPrice}</span>
                  <span className="text-[11px] leading-5 text-text-tertiary">{product.oldPriceLabel}</span>
                </p>
              )}
            </div>
          )}
          <div className="mt-auto">
            <Availability product={product} />
          </div>
        </div>
        <Link
          href={pdpHref}
          className="block w-full rounded-novey bg-novey-blue px-2 py-3 text-center text-[14px] leading-5 text-white lg:px-6 lg:py-3.5 lg:text-[16px] lg:leading-6 transition-colors duration-150 hover:bg-novey-blue-dark active:bg-novey-navy"
        >
          Agregar al carrito
        </Link>
      </div>
    </article>
  );
}
