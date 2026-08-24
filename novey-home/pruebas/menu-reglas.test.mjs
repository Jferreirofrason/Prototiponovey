// Pruebas del mega-menú Departamentos: las reglas de visibilidad y los
// invariantes de los datos que esas reglas asumen.
//
//   node --test pruebas/
//
// Sin frameworks: node:test viene con Node. Si estas reglas cambian, primero
// se cambia acá la expectativa y después lib/menu-reglas.mjs.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  MAX_CATEGORIAS_INICIALES,
  MAX_SUBCATS_INICIALES,
  categoriasVisibles,
  etiquetaVerOpciones,
  etiquetaVerTodo,
  necesitaVerOpciones,
  necesitaVerTodo,
  subcatsVisibles,
} from '../lib/menu-reglas.mjs';

const DEPARTMENTS = JSON.parse(
  readFileSync(new URL('../data/departments-menu.json', import.meta.url), 'utf8'),
);

/* ---------- reglas de categorías principales ---------- */

test('con 6 categorías o menos se muestran todas y no hay "Ver todo"', () => {
  for (const total of [1, 4, 6]) {
    assert.equal(necesitaVerTodo(total), false);
    assert.equal(categoriasVisibles(total, false), total);
  }
});

test('con más de 6 se muestran 6 y aparece "Ver todo (N)" con el total real', () => {
  assert.equal(necesitaVerTodo(8), true);
  assert.equal(categoriasVisibles(8, false), MAX_CATEGORIAS_INICIALES);
  assert.equal(etiquetaVerTodo(8, false), 'Ver todo (8)');
  assert.equal(etiquetaVerTodo(12, false), 'Ver todo (12)');
  assert.equal(etiquetaVerTodo(20, false), 'Ver todo (20)');
});

test('expandido muestra todas y el enlace pasa a "Ver menos"', () => {
  assert.equal(categoriasVisibles(8, true), 8);
  assert.equal(etiquetaVerTodo(8, true), 'Ver menos');
});

/* ---------- reglas de subcategorías ---------- */

test('una categoría muestra hasta 5 subcategorías sin enlace propio', () => {
  assert.equal(necesitaVerOpciones(5), false);
  assert.equal(subcatsVisibles(5, false), 5);
});

test('con más de 5 muestra 5 y "Ver todas las opciones (N)" con su total', () => {
  assert.equal(necesitaVerOpciones(12), true);
  assert.equal(subcatsVisibles(12, false), MAX_SUBCATS_INICIALES);
  assert.equal(etiquetaVerOpciones(12, false), 'Ver todas las opciones (12)');
  assert.equal(etiquetaVerOpciones(7, true), 'Ver menos');
});

/* ---------- invariantes de los datos ---------- */

test('el ejemplo del brief existe: Aire Libre con 8 categorías, 6 visibles', () => {
  const aire = DEPARTMENTS.find((d) => d.slug === 'aire-libre-y-recreacion');
  assert.ok(aire, 'falta el departamento aire-libre-y-recreacion');
  assert.equal(aire.categories.length, 8);
  const nombres = aire.categories.map((c) => c.name);
  for (const esperado of ['Camping', 'Parrillas', 'Muebles De Exterior', 'Piscinas', 'Jardín', 'Deportes', 'Bicicletas', 'Juegos Al Aire Libre']) {
    assert.ok(nombres.includes(esperado), `falta la categoría ${esperado}`);
  }
  assert.equal(categoriasVisibles(aire.categories.length, false), 6);
  assert.equal(etiquetaVerTodo(aire.categories.length, false), 'Ver todo (8)');
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
      assert.ok(Array.isArray(c.items), `${d.slug}/${c.name} sin lista de subcategorías`);
      // Regla de contenido: ninguna columna se muestra rala.
      assert.ok(c.items.length >= 5, `${d.slug}/${c.name} tiene ${c.items.length} subcategorías (mínimo 5)`);
    }
  }
});
