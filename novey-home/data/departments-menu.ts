// Contenido del mega-menú Departamentos.
//
// Jerarquía: departamento → categorías principales → subcategorías.
// Los datos viven en departments-menu.json (mismo formato que devolvería el
// backend); este módulo solo les pone tipos. "Aire Libre Y Recreación" trae
// las 8 categorías de demostración del brief; el resto es el contenido real
// del Figma 'Novey - Version 0.1'.

import data from './departments-menu.json';

export interface Category {
  name: string;
  /** Miniatura de la categoría. Sin imagen, el menú muestra un placeholder. */
  image?: string;
  /** Subcategorías. Puede venir vacío: la categoría se muestra igual. */
  items: string[];
}

export interface Department {
  name: string;
  slug: string;
  categories: Category[];
}

export const DEPARTMENTS: Department[] = data as Department[];
