// Reglas de visibilidad del mega-menú Departamentos.
//
// Viven separadas del componente porque las usa también la versión móvil y
// porque son las reglas que el negocio va a querer discutir ("¿por qué se
// ven 6?"), así que conviene poder probarlas solas, sin montar React
// (pruebas/menu-reglas.test.mjs).

/** Cuántas categorías principales muestra la vista Visual antes de "Ver todo (N)". */
export const MAX_CATEGORIAS_INICIALES = 6;

/** Cuántas opciones muestra una categoría en la vista Visual. */
export const MAX_OPCIONES_VISUAL = 5;

/** Cuántas opciones muestra una categoría en la vista Lista (más densa a propósito). */
export const MAX_OPCIONES_LISTA = 8;

/** Cuántas categorías destacadas (miniaturas con foto) admite la primera vista. */
export const MAX_DESTACADAS = 6;

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

/** ¿Esta categoría necesita su enlace "Ver N opciones más" en esta vista? */
export const necesitaOpcionesMas = (totalOpciones, maxIniciales) => totalOpciones > maxIniciales;

/** Cuántas opciones se ven según el estado de la categoría y la vista. */
export const opcionesVisibles = (totalOpciones, expandido, maxIniciales) =>
  expandido || !necesitaOpcionesMas(totalOpciones, maxIniciales)
    ? totalOpciones
    : maxIniciales;

/**
 * Texto del alternador de una categoría. El contador son SOLO las opciones
 * ocultas ("Ver 2 opciones más"), nunca el total: "Ver todas las opciones (7)"
 * con cinco a la vista se leía como si quedaran siete por ver.
 */
export const etiquetaOpcionesMas = (totalOpciones, expandido, maxIniciales) => {
  if (expandido) return 'Ver menos';
  const ocultas = totalOpciones - maxIniciales;
  return `Ver ${ocultas} ${ocultas === 1 ? 'opción más' : 'opciones más'}`;
};
