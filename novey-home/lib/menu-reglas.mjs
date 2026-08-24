// Reglas de visibilidad del mega-menú Departamentos.
//
// Viven separadas del componente por dos motivos: las usa también la versión
// móvil, y son las reglas que el negocio va a querer discutir ("¿por qué se
// ven 6?"), así que conviene poder probarlas solas, sin montar React
// (pruebas/menu-reglas.test.mjs).

/** Cuántas categorías principales se muestran antes de "Ver todo (N)". */
export const MAX_CATEGORIAS_INICIALES = 6;

/** Cuántas subcategorías muestra una categoría antes de su propio enlace. */
export const MAX_SUBCATS_INICIALES = 5;

/** Cuántas categorías destacadas (circulitos con foto) admite la primera vista. */
export const MAX_DESTACADAS = 6;

/**
 * ¿Este departamento necesita el enlace "Ver todo (N)"?
 * Con 6 o menos se muestran todas y el enlace no existe.
 */
export const necesitaVerTodo = (totalCategorias) => totalCategorias > MAX_CATEGORIAS_INICIALES;

/** Cuántas categorías se ven según el estado expandido/contraído. */
export const categoriasVisibles = (totalCategorias, expandido) =>
  expandido || !necesitaVerTodo(totalCategorias)
    ? totalCategorias
    : MAX_CATEGORIAS_INICIALES;

/**
 * Texto del alternador del departamento. El contador es el TOTAL de
 * categorías principales (las subcategorías no suman).
 */
export const etiquetaVerTodo = (totalCategorias, expandido) =>
  expandido ? 'Ver menos' : `Ver todo (${totalCategorias})`;

/** ¿Esta categoría necesita su enlace "Ver todas las opciones (N)"? */
export const necesitaVerOpciones = (totalSubcats) => totalSubcats > MAX_SUBCATS_INICIALES;

/** Cuántas subcategorías se ven según el estado de la categoría. */
export const subcatsVisibles = (totalSubcats, expandido) =>
  expandido || !necesitaVerOpciones(totalSubcats) ? totalSubcats : MAX_SUBCATS_INICIALES;

/** Texto del alternador de una categoría; el contador es su total de subcategorías. */
export const etiquetaVerOpciones = (totalSubcats, expandido) =>
  expandido ? 'Ver menos' : `Ver todas las opciones (${totalSubcats})`;
