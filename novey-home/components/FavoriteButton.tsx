'use client';

/**
 * Corazón de favoritos: ÚNICO componente para todo el prototipo (home, ofertas,
 * carruseles, favoritos). Centraliza el estado, la animación y el toast, así
 * ninguna card implementa su propia versión.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FAV_CHANGE_EVENT, addFavorite, readFavorites, toggleFavorite } from '../lib/favorites';
import { showToast } from './ToastHost';
import { ROUTES } from '../lib/routes';

/** Corazón dibujado en SVG para poder rellenarlo; el ícono del Figma es plano. */
function HeartIcon({
  filled,
  className = '',
  size,
}: {
  filled: boolean;
  className?: string;
  size: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 20.7 3.9 12.6a5.4 5.4 0 0 1 7.6-7.6l.5.5.5-.5a5.4 5.4 0 1 1 7.6 7.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoriteButton({
  productId,
  productName,
  productImage,
  className = '',
  size = 18,
}: {
  productId: string;
  productName: string;
  productImage?: string;
  className?: string;
  size?: number;
}) {
  const [fav, setFav] = useState(false);
  const [animando, setAnimando] = useState(false);
  const timer = useRef<number>();

  // Estado inicial y sincronización con el resto del sitio.
  useEffect(() => {
    const leer = () => setFav(readFavorites().includes(productId));
    leer();
    window.addEventListener(FAV_CHANGE_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(FAV_CHANGE_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, [productId]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      // El corazón suele estar dentro de un link de producto.
      e.preventDefault();
      e.stopPropagation();

      // El storage es la fuente de verdad: clics repetidos no desincronizan.
      const ahoraEsFav = toggleFavorite(productId);
      setFav(ahoraEsFav);

      if (ahoraEsFav) {
        setAnimando(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setAnimando(false), 600);
        showToast({
          kind: 'favorito',
          message: 'Agregado a tus favoritos',
          productName,
          image: productImage,
          action: { label: 'Ver favoritos', href: ROUTES.favoritos },
        });
      } else {
        setAnimando(false);
        showToast({
          kind: 'favorito',
          message: 'Eliminado de tus favoritos',
          productName,
          image: productImage,
          // Callback directo: la card puede haberse desmontado al quitarla.
          action: { label: 'Deshacer', onClick: () => addFavorite(productId) },
        });
      }
    },
    [productId, productName, productImage],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={fav}
      aria-label={`${fav ? 'Quitar' : 'Agregar'} ${productName} ${fav ? 'de' : 'a'} favoritos`}
      // Sin clase de posición: la define quien lo usa (las cards lo ponen
      // `absolute` sobre la imagen). Poner `relative` acá le ganaba a esa clase
      // y el corazón terminaba abajo del todo.
      className={`flex items-center justify-center rounded-full bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-colors duration-150 hover:bg-novey-blue-pale ${
        fav ? 'text-novey-blue' : 'text-text-primary'
      } ${className}`}
    >
      {/* Onda sutil, sólo al agregar */}
      {animando && (
        <span aria-hidden="true" className="fav-ripple absolute inset-0 rounded-full border-2 border-novey-blue" />
      )}
      <HeartIcon filled={fav} size={size} className={animando ? 'fav-pop' : ''} />
    </button>
  );
}
