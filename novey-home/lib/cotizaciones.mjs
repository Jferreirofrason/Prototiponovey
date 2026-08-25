// "Agregar una cotización" del mini carrito: formato, resolución y regla de
// combinación. Separado del componente para probarlo sin montar React
// (pruebas/cotizaciones.test.mjs).
//
// El flujo es en dos pasos: buscar la cotización, mostrar un resumen sencillo
// (número, productos, total, faltantes) y recién ahí agregarla al carrito.
//
// El prototipo no tiene backend: `resolverCotizacion` hace de API con
// cotizaciones de demostración, una por estado del flujo. La costura para el
// servicio real es exactamente esta función.
//
//   1001  se encuentra completa (sierra + pintura)
//   4004  se encuentra con un producto sin stock → el resumen lo avisa
//   5005  se encuentra con precios cambiados → el resumen muestra el total al día
//   2002  vencida
//   3003  de otra cuenta
//   9999  error de conexión en el primer intento; el reintento funciona
//   otro número bien formado → no encontrada
//
// REGLA DE NEGOCIO: la cotización SE SUMA al carrito actual combinando
// productos iguales (suma de cantidades). Nunca reemplaza, así que no hace
// falta una confirmación de reemplazo.

/**
 * Normaliza lo tipeado: sin espacios y sin el prefijo "COT-" si el usuario lo
 * copió del papel. Lo que identifica a la cotización son sus dígitos.
 */
export const normalizarNumero = (texto) =>
  texto.trim().toUpperCase().replace(/^COT-?/, '');

/** Formato real del número: 4 a 6 dígitos. */
export const esFormatoValido = (numero) => /^\d{4,6}$/.test(numero);

const SIERRA = {
  id: 'destacado-1',
  name: 'Sierra circular 7 1/4" 1800W con guía láser',
  brand: 'DEWALT',
  price: 189.99,
  qty: 1,
  image: '/images/p-sierra.jpg',
};
const PINTURA = {
  id: 'entrega-2',
  name: 'Pintura látex interior blanca lavable',
  brand: 'SHERWIN-WILLIAMS',
  price: 32.99,
  qty: 2,
  image: '/images/p-pintura.jpg',
};
const BROCAS = {
  id: 'destacado-3',
  name: 'Set de brocas para concreto x12 piezas',
  brand: 'TRUPER',
  price: 24.99,
  qty: 1,
  image: '/images/p-brocas.jpg',
};

const totalDe = (items) =>
  +items.reduce((n, it) => n + it.price * it.qty, 0).toFixed(2);

/** Una cotización encontrada, con todo lo que necesita el resumen. */
const encontrada = (items, extras = {}) => ({
  tipo: 'encontrada',
  items,
  total: totalDe(items),
  noDisponibles: [],
  preciosActualizados: [],
  ...extras,
});

/**
 * Resuelve un número BIEN FORMADO contra las cotizaciones de demostración.
 *  - `aplicadas`: números ya agregados a este carrito (estado "ya agregada").
 *  - `intento`: para 9999, el primer intento falla y el reintento sale.
 * Devuelve siempre un objeto con `tipo`; el componente solo pinta estados.
 *
 * @param {string} numero
 * @param {{ aplicadas?: string[], intento?: number }} [opciones]
 */
export function resolverCotizacion(numero, { aplicadas = [], intento = 1 } = {}) {
  if (aplicadas.includes(numero)) return { tipo: 'ya-agregada' };

  switch (numero) {
    case '1001':
      return encontrada([SIERRA, PINTURA]);
    case '4004':
      return encontrada([BROCAS, PINTURA], {
        noDisponibles: ['Taladro percutor 850W (sin stock)'],
      });
    case '5005':
      return encontrada([{ ...SIERRA }], {
        preciosActualizados: [
          { name: SIERRA.name, precioCotizado: 169.99, precioActual: SIERRA.price },
        ],
      });
    case '2002':
      return { tipo: 'vencida' };
    case '3003':
      return { tipo: 'ajena' };
    case '9999':
      return intento < 2 ? { tipo: 'error-red' } : encontrada([BROCAS]);
    default:
      return { tipo: 'no-encontrada' };
  }
}

/**
 * Regla de combinación: los productos cotizados se SUMAN al carrito actual;
 * si un producto ya está, se aumentan las cantidades (no se duplica la fila
 * ni se pisa nada del carrito).
 */
export function combinarConCarrito(carrito, items) {
  const resultado = [...carrito];
  for (const item of items) {
    const i = resultado.findIndex((it) => it.id === item.id);
    if (i === -1) resultado.push(item);
    else resultado[i] = { ...resultado[i], qty: resultado[i].qty + item.qty };
  }
  return resultado;
}
