// Reglas de visibilidad del mega-menú Departamentos.
//
// Viven separadas del componente porque las usa también la versión móvil y
// porque son las reglas que el negocio va a querer discutir ("¿por qué se
// ven 4?"), así que conviene poder probarlas solas, sin montar React
// (pruebas/menu-reglas.test.mjs).

/*
 * Jerarquía: departamento → subcategorías (bloques) → opciones.
 * La regla de cantidad 4–8 es de las SUBCATEGORÍAS; las opciones de cada
 * bloque topean en 5 visibles + "Ver todo (N)" hacia la página completa.
 * Las dos vistas (Visual y Lista) comparten datos y conteos.
 */

/** Cuántas subcategorías entran por fila en escritorio. */
export const SUBCATS_POR_FILA = 4;

/** Mínimo esperado de subcategorías por departamento (regla de contenido). */
export const SUBCATS_MIN = 4;

/** Máximo de subcategorías que muestra el menú (dos filas de 4). */
export const SUBCATS_MAX_MENU = 8;

/** Cuántas subcategorías destacadas (burbujas con foto) admite la vista Visual. */
export const MAX_DESTACADAS = 6;

/** Cuántas opciones muestra un bloque; la sexta línea es solo para "Ver todo (N)". */
export const OPCIONES_VISIBLES = 5;

/** Cuántas subcategorías se pintan: todas, con tope de 8 (nunca hay expansor). */
export const subcatsEnMenu = (total) => Math.min(total, SUBCATS_MAX_MENU);

/**
 * ¿El departamento quedó incompleto? Con menos de 4 subcategorías se muestran
 * las que haya (sin inventar); esto existe para que el Backoffice avise.
 */
export const faltanSubcategorias = (total) => total < SUBCATS_MIN;

/** ¿El bloque necesita la sexta línea? Solo si de verdad esconde opciones. */
export const necesitaVerTodo = (totalOpciones) => totalOpciones > OPCIONES_VISIBLES;

/** Cuántas opciones se pintan en el bloque. */
export const opcionesEnBloque = (totalOpciones) => Math.min(totalOpciones, OPCIONES_VISIBLES);

/**
 * Texto de la sexta línea. N es cuántas opciones QUEDARON OCULTAS (nunca el
 * total): con 12 opciones y 5 a la vista, "Ver todo (7)". Abre la página
 * completa de la subcategoría; el menú no despliega listas interminables.
 */
export const etiquetaVerTodo = (totalOpciones) =>
  `Ver todo (${totalOpciones - OPCIONES_VISIBLES})`;

/* ---------- nombres visibles (para el alta/edición futura) ---------- */

/**
 * Nombres propios y siglas que conservan su forma al sugerir un nombre
 * visible. Todo lo demás va en minúscula después de la primera palabra.
 */
export const NOMBRES_PROPIOS = ['LED', 'MDF', 'USB', 'TV', 'THHW', 'THW', 'Bluetooth', 'Novey'];

/**
 * ¿El nombre parece escrito a los gritos? (todo en mayúsculas). Sirve para
 * ADVERTIR y sugerir — nunca para corregir en silencio: la persona decide.
 */
export const pareceGritado = (texto) => {
  const letras = texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  return letras.length >= 4 && letras === letras.toUpperCase();
};

/**
 * Sugerencia de nombre visible en capitalización natural: mayúscula inicial,
 * el resto en minúscula, con nombres propios y siglas respetados.
 * "MUEBLES DE EXTERIOR" → "Muebles de exterior" · "focos led" → "Focos LED".
 */
export const sugerenciaNombre = (texto) =>
  texto
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((palabra, i) => {
      const propio = NOMBRES_PROPIOS.find((p) => p.toUpperCase() === palabra.toUpperCase());
      if (propio) return propio;
      const baja = palabra.toLowerCase();
      return i === 0 ? baja.charAt(0).toUpperCase() + baja.slice(1) : baja;
    })
    .join(' ');

/**
 * Clave para detectar duplicados: "Aire Libre y Recreación", "aire libre y
 * recreación" y "Aire libre y recreacion" son EL MISMO departamento. Ignora
 * mayúsculas, tildes y espacios repetidos; los slugs no se tocan.
 */
export const claveDeDuplicado = (texto) =>
  texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
