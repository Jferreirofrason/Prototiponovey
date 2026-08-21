// Hooks del estado compartido (carrito, favoritos y sesión) para el PLP/PDP.
// Leen las mismas claves de localStorage que la home y el checkout, y se
// actualizan con los eventos que emiten esos módulos compartidos.
import { useEffect, useState } from 'react';
import { countUnits, readCart } from './cart';
import { FAV_CHANGE_EVENT, readFavorites } from './favorites';
import { SESSION_CHANGE_EVENT, readSession } from './session';

function useStorageValue(leer, eventos) {
  const [valor, setValor] = useState(null);
  useEffect(() => {
    const refrescar = () => setValor(leer());
    refrescar();
    eventos.forEach((e) => window.addEventListener(e, refrescar));
    window.addEventListener('storage', refrescar);
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, refrescar));
      window.removeEventListener('storage', refrescar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return valor;
}

export function useCartCount() {
  return useStorageValue(() => {
    const items = readCart();
    return items ? countUnits(items) : 0;
  }, ['novey-cart-change']);
}

export function useFavCount() {
  return useStorageValue(() => readFavorites().length, [FAV_CHANGE_EVENT]);
}

export function useNombreSesion() {
  return useStorageValue(() => {
    const s = readSession();
    return s?.name ? s.name.split(' ')[0] : '';
  }, [SESSION_CHANGE_EVENT]);
}
