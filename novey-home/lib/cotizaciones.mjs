// "Agregar una cotización" del mini carrito: formato, resolución y regla de
// combinación. Separado del componente para probarlo sin montar React
// (pruebas/cotizaciones.test.mjs).
//
// El prototipo no tiene backend: `resolverCotizacion` hace de API con
// cotizaciones de demostración, una por estado del flujo. La costura para el
// servicio real es exactamente esta función.
//
//   COT-1001  válida (sierra + pintura; la sierra ya está en el carrito demo,
//             así que además demuestra la regla de combinación)
//   COT-4004  con productos sin stock → confirmación de carga parcial
//   COT-5005  con precios cambiados → confirmación con diferencia
//   COT-2002  vencida
//   COT-3003  de otra cuenta
//   COT-9999  error de conexión en el primer intento; el reintento funciona
//   otro COT-#### bien formado → no encontrada
//
// REGLA DE NEGOCIO (estado 13): la cotización SE SUMA al carrito actual
// combinando productos iguales (suma de cantidades). Nunca reemplaza, así
// que no hace falta la confirmación de reemplazo.

/** Normaliza lo tipeado: sin espacios alrededor y en mayúsculas. */
export const normalizarNumero = (texto) => texto.trim().toUpperCase();

/** Formato real del número: COT- seguido de 4 a 6 dígitos. */
export const esFormatoValido = (numero) => /^COT-\d{4,6}$/.test(numero);

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

/**
 * Resuelve un número BIEN FORMADO contra las cotizaciones de demostración.
 *  - `aplicadas`: números ya agregados a este carrito (estado "ya agregada").
 *  - `intento`: para COT-9999, el primer intento falla y el reintento sale.
 * Devuelve siempre un objeto con `tipo`; el componente solo pinta estados.
 *
 * @param {string} numero
 * @param {{ aplicadas?: string[], intento?: number }} [opciones]
 */
export function resolverCotizacion(numero, { aplicadas = [], intento = 1 } = {}) {
  if (aplicadas.includes(numero)) return { tipo: 'ya-agregada' };

  switch (numero) {
    case 'COT-1001':
      return { tipo: 'ok', items: [SIERRA, PINTURA] };
    case 'COT-4004':
      return {
        tipo: 'parcial',
        disponibles: [BROCAS, PINTURA],
        noDisponibles: ['Taladro percutor 850W (sin stock)'],
      };
    case 'COT-5005': {
      const precioCotizado = 169.99;
      return {
        tipo: 'precios',
        items: [{ ...SIERRA }],
        cambios: [
          { name: SIERRA.name, precioCotizado, precioActual: SIERRA.price },
        ],
        totalCotizado: precioCotizado,
        totalActual: SIERRA.price,
      };
    }
    case 'COT-2002':
      return { tipo: 'vencida' };
    case 'COT-3003':
      return { tipo: 'ajena' };
    case 'COT-9999':
      return intento < 2 ? { tipo: 'error-red' } : { tipo: 'ok', items: [BROCAS] };
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
