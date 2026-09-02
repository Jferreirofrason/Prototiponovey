// Pruebas del mega-menú Departamentos: las reglas de visibilidad de las dos
// vistas y los invariantes de los datos que esas reglas asumen.
//
//   node --test pruebas/
//
// Sin frameworks: node:test viene con Node. Si estas reglas cambian, primero
// se cambia acá la expectativa y después lib/menu-reglas.mjs.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  OPCIONES_VISIBLES,
  SUBCATS_MAX_MENU,
  SUBCATS_MIN,
  etiquetaVerTodo,
  faltanSubcategorias,
  necesitaVerTodo,
  opcionesEnBloque,
  subcatsEnMenu,
} from '../lib/menu-reglas.mjs';

const DEPARTMENTS = JSON.parse(
  readFileSync(new URL('../data/departments-menu.json', import.meta.url), 'utf8'),
);

/* ---------- subcategorías: 4 a 8, todas a la vista ---------- */

test('el menú muestra todas las subcategorías con tope de 8', () => {
  for (const [total, esperado] of [[3, 3], [4, 4], [8, 8], [11, SUBCATS_MAX_MENU]]) {
    assert.equal(subcatsEnMenu(total), esperado);
  }
});

test('menos de 4 subcategorías no rompe el menú pero queda marcado como incompleto', () => {
  assert.equal(faltanSubcategorias(3), true);
  assert.equal(faltanSubcategorias(4), false);
  assert.equal(SUBCATS_MIN, 4);
});

/* ---------- opciones por bloque: 5 visibles + "Ver todo (ocultas)" ---------- */

test('con 5 opciones o menos se muestran todas y NO hay sexta línea', () => {
  for (const total of [3, 5]) {
    assert.equal(opcionesEnBloque(total), total);
    assert.equal(necesitaVerTodo(total), false);
  }
});

test('la sexta línea dice cuántas opciones quedaron ocultas, no el total', () => {
  assert.equal(necesitaVerTodo(6), true);
  assert.equal(etiquetaVerTodo(6), 'Ver todo (1)');
  assert.equal(etiquetaVerTodo(8), 'Ver todo (3)');
  assert.equal(etiquetaVerTodo(12), 'Ver todo (7)');
  assert.equal(opcionesEnBloque(12), OPCIONES_VISIBLES);
});

/* ---------- invariantes de los datos ---------- */

test('el ejemplo máximo existe: Aire libre supera el tope de 8 y el menú recorta', () => {
  const aire = DEPARTMENTS.find((d) => d.slug === 'aire-libre-y-recreacion');
  assert.ok(aire, 'falta el departamento aire-libre-y-recreacion');
  // 10 categorías: el menú muestra 8 y el resto sale por
  // "Ver todas las categorías" (el ejemplo pedido de contenido máximo).
  assert.equal(aire.categories.length, 10);
  assert.equal(subcatsEnMenu(aire.categories.length), 8);
  const nombres = aire.categories.map((c) => c.name);
  for (const esperado of ['Camping', 'Parrillas', 'Muebles de exterior', 'Piscinas', 'Jardín', 'Deportes', 'Bicicletas', 'Juegos al aire libre']) {
    assert.ok(nombres.includes(esperado), `falta la subcategoría ${esperado}`);
  }
  // Camping (6 opciones): 5 a la vista y "Ver todo (1)"
  const camping = aire.categories.find((c) => c.name === 'Camping');
  assert.equal(camping.items.length, 6);
  assert.equal(etiquetaVerTodo(camping.items.length), 'Ver todo (1)');
  // Piscinas (12): 5 a la vista y "Ver todo (7)" hacia su página completa
  const piscinas = aire.categories.find((c) => c.name === 'Piscinas');
  assert.equal(piscinas.items.length, 12);
  assert.equal(etiquetaVerTodo(piscinas.items.length), 'Ver todo (7)');
  // Parrillas (5): sin sexta línea
  const parrillas = aire.categories.find((c) => c.name === 'Parrillas');
  assert.equal(parrillas.items.length, 5);
  assert.equal(necesitaVerTodo(parrillas.items.length), false);
});

test('los departamentos con menos de 4 subcategorías quedan identificados para el Backoffice', () => {
  const incompletos = DEPARTMENTS.filter((d) => faltanSubcategorias(d.categories.length)).map((d) => d.slug);
  // Son datos reales del Figma: se muestran igual, sin inventar relleno.
  for (const d of DEPARTMENTS) {
    assert.equal(faltanSubcategorias(d.categories.length), d.categories.length < 4, d.slug);
  }
  assert.ok(incompletos.every((slug) => DEPARTMENTS.find((d) => d.slug === slug).categories.length >= 1));
});

test('capitalización natural: mayúscula inicial, sin Title Case (salvo siglas)', () => {
  const SIGLAS = ['LED', 'MDF', 'USB', 'TV', 'THHW', 'THW', 'Bluetooth'];
  const naturales = (texto) => {
    const palabras = texto.split(' ').slice(1); // la primera va en mayúscula
    return palabras.every((w) => SIGLAS.includes(w) || w === w.toLowerCase());
  };
  for (const d of DEPARTMENTS) {
    assert.ok(naturales(d.name), `Title Case en departamento: ${d.name}`);
    for (const c of d.categories) {
      assert.ok(naturales(c.name), `Title Case en categoría: ${c.name}`);
      for (const i of c.items) assert.ok(naturales(i), `Title Case en opción: ${i}`);
    }
  }
});

test('ningún departamento conserva el contador "N categorías disponibles"', () => {
  for (const d of DEPARTMENTS) {
    assert.equal('subtitle' in d, false, `${d.slug} todavía tiene subtitle`);
  }
});

test('todos los departamentos tienen nombre, slug y categorías bien formadas', () => {
  assert.ok(DEPARTMENTS.length > 0);
  for (const d of DEPARTMENTS) {
    assert.ok(d.name && d.slug, 'departamento sin nombre o slug');
    assert.ok(Array.isArray(d.categories), `${d.slug} sin lista de categorías`);
    for (const c of d.categories) {
      assert.ok(c.name, `${d.slug} tiene una categoría sin nombre`);
      assert.ok(Array.isArray(c.items), `${d.slug}/${c.name} sin lista de opciones`);
      // Regla de contenido: ninguna columna se muestra rala.
      assert.ok(c.items.length >= 5, `${d.slug}/${c.name} tiene ${c.items.length} opciones (mínimo 5)`);
    }
  }
});

/* ---------- nombres visibles: sugerencia y duplicados ---------- */

test('sugerenciaNombre pasa a capitalización natural sin romper siglas ni tildes', async () => {
  const { sugerenciaNombre, pareceGritado, claveDeDuplicado } = await import('../lib/menu-reglas.mjs');
  assert.equal(sugerenciaNombre('MUEBLES DE EXTERIOR'), 'Muebles de exterior');
  assert.equal(sugerenciaNombre('Parrillas A Carbón'), 'Parrillas a carbón');
  assert.equal(sugerenciaNombre('QUÍMICOS   Y LIMPIEZA'), 'Químicos y limpieza');
  assert.equal(sugerenciaNombre('focos led'), 'Focos LED');
  assert.equal(sugerenciaNombre('cable thhw'), 'Cable THHW');
  assert.equal(sugerenciaNombre('bocinas bluetooth'), 'Bocinas Bluetooth');

  // Se advierte, no se corrige en silencio
  assert.equal(pareceGritado('MUEBLES DE EXTERIOR'), true);
  assert.equal(pareceGritado('Muebles de exterior'), false);
  assert.equal(pareceGritado('TV'), false, 'las siglas cortas no son gritos');

  // Equivalentes que NO deben crear departamentos distintos
  const a = claveDeDuplicado('Aire Libre y Recreación');
  assert.equal(claveDeDuplicado('aire libre y recreación'), a);
  assert.equal(claveDeDuplicado('Aire  libre y recreacion'), a);
  assert.notEqual(claveDeDuplicado('Aire libre'), a);
});
