import ProductCard from './ProductCard';
import { navidadProducts } from '../data/products';
import { ROUTES } from '../lib/routes';

// 07 — Section: Departamentos (Figma 4338:73293)
// En el diseño esta sección es "Imprescindibles de Navidad": header + 4 cards.
export default function Departments() {
  return (
    <section aria-labelledby="navidad-essentials-title">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="navidad-essentials-title"
            className="text-[23px] font-bold leading-[30px] text-[#111827]"
          >
            Imprescindibles de Navidad
          </h2>
          <a
            href={ROUTES.navidad}
            className="shrink-0 text-[16px] font-medium leading-[22px] text-novey-blue transition-colors duration-150 hover:text-novey-blue-dark"
          >
            Ver todo
          </a>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
          Todo lo que necesitás para decorar tu hogar
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {navidadProducts.map((product) => (
            <li
              key={product.id}
              className="min-w-0"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
