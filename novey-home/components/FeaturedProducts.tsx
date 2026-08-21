import ProductCard from './ProductCard';
import { featuredProducts } from '../data/products';
import { ROUTES } from '../lib/routes';

// 05 — Section: Productos Destacados (Figma 4338:73044)
export default function FeaturedProducts() {
  return (
    <section aria-labelledby="featured-products-title">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="featured-products-title"
            className="text-[20px] font-bold leading-[29px] text-[#1A1A1A]"
          >
            Productos Destacados
          </h2>
          <a
            href={ROUTES.ofertas}
            className="shrink-0 text-[16px] font-medium leading-[22px] text-novey-blue transition-colors duration-150 hover:text-novey-blue-dark"
          >
            Ver todo
          </a>
        </div>
        <p className="mt-2 text-[15px] leading-5 text-text-secondary">
          Encuentra las mejores ofertas en herramientas y productos para el hogar
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {featuredProducts.map((product) => (
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
