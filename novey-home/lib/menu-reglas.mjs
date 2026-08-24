// Reglas de visibilidad del mega-menú Departamentos.
//
// Viven separadas del componente porque las usa también la versión móvil y
// porque son las reglas que el negocio va a querer discutir ("¿por qué se
// ven 4?"), así que conviene poder probarlas solas, sin montar React
// (pruebas/menu-reglas.test.mjs).

/** Cuántas categorías principales muestra la vista Visual antes de "Ver todo (N)". */
export const MAX_CATEGORIAS_INICIALES = 6;

/** Cuántas opciones muestra una categoría al inicio en la vista Visual. */
export const OPCIONES_INICIALES_VISUAL = 4;

/**
 * Tope de opciones dentro del megamenú, en cualquier vista y estado. Con más
 * que esto, el resto vive en la página completa de la categoría ("Ver todas
 * en [categoría]"): el menú no es el lugar para listas interminables.
 */
export const OPCIONES_TOPE_MENU = 8;

/** Cuántas categorías destacadas (miniaturas con foto) admite la primera vista. */
export const MAX_DESTACADAS = 6;

/* ---------- categorías principales (vista Visual) ---------- */

/**
 * ¿Este departamento necesita el enlace "Ver todo (N)"? Solo aplica a la
 * vista Visual: la Lista muestra todas las categorías desde el comienzo.
 */
export const necesitaVerTodo = (totalCategorias) => totalCategorias > MAX_CATEGORIAS_INICIALES;

/** Cuántas categorías se ven en la vista Visual según expandido/contraído. */
export const categoriasVisibles = (totalCategorias, expandido) =>
  expandido || !necesitaVerTodo(totalCategorias)
    ? totalCategorias
    : MAX_CATEGORIAS_INICIALES;

/**
 * Texto del alternador del departamento. El contador es el TOTAL de
 * categorías principales (las opciones no suman).
 */
export const etiquetaVerTodo = (totalCategorias, expandido) =>
  expandido ? 'Ver menos' : `Ver todo (${totalCategorias})`;

/* ---------- opciones por categoría ---------- */

/**
 * Cuántas opciones se ven en una categoría.
 *  - Visual contraída: hasta 4.  - Visual expandida: hasta 8.
 *  - Lista: hasta 8 desde el comienzo (es la vista compacta, sin expansor).
 * Nunca más de 8 dentro del menú.
 */
export const opcionesVisibles = (totalOpciones, expandido, vista) => {
  const inicial = vista === 'visual' ? OPCIONES_INICIALES_VISUAL : OPCIONES_TOPE_MENU;
  return Math.min(totalOpciones, expandido ? OPCIONES_TOPE_MENU : inicial);
};

/** ¿La categoría necesita expansor? Solo en Visual, cuando esconde opciones. */
export const necesitaOpcionesMas = (totalOpciones, vista) =>
  vista === 'visual' && totalOpciones > OPCIONES_INICIALES_VISUAL;

/**
 * Texto del expansor. El contador dice cuántas opciones SE VAN A AGREGAR
 * (nunca el total): con 12 opciones se agregan 4 (de 4 a 8), no 8.
 */
export const etiquetaOpcionesMas = (totalOpciones, expandido) => {
  if (expandido) return 'Ver menos';
  const agrega = Math.min(totalOpciones, OPCIONES_TOPE_MENU) - OPCIONES_INICIALES_VISUAL;
  return `Ver ${agrega} ${agrega === 1 ? 'opción más' : 'opciones más'}`;
};

/**
 * ¿Hace falta el enlace a la página completa? Cuando la categoría supera el
 * tope del menú: en Visual aparece recién al expandir, en Lista siempre.
 */
export const necesitaVerTodasEn = (totalOpciones) => totalOpciones > OPCIONES_TOPE_MENU;

/** Texto del enlace a la página completa de la categoría. */
export const etiquetaVerTodasEn = (nombreCategoria) => `Ver todas en ${nombreCategoria}`;
