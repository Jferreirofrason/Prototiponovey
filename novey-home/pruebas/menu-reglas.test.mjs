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
  MAX_CATEGORIAS_INICIALES,
  OPCIONES_INICIALES_VISUAL,
  OPCIONES_TOPE_MENU,
  categoriasVisibles,
  etiquetaOpcionesMas,
  etiquetaVerTodasEn,
  etiquetaVerTodo,
  necesitaOpcionesMas,
  necesitaVerTodasEn,
  necesitaVerTodo,
  opcionesVisibles,
} from '../lib/menu-reglas.mjs';

const DEPARTMENTS = JSON.parse(
  readFileSync(new URL('../data/departments-menu.json', import.meta.url), 'utf8'),
);

/* ---------- categorías principales (vista Visual) ---------- */

test('con 6 categorías o menos se muestran todas y no hay "Ver todo"', () => {
  for (const total of [1, 4, 6]) {
    assert.equal(necesitaVerTodo(total), false);
    assert.equal(categoriasVisibles(total, false), total);
  }
});

test('con más de 6 se muestran 6 y "Ver todo (N)" usa el total de categorías', () => {
  assert.equal(necesitaVerTodo(8), true);
  assert.equal(categoriasVisibles(8, false), MAX_CATEGORIAS_INICIALES);
  assert.equal(etiquetaVerTodo(8, false), 'Ver todo (8)');
  assert.equal(etiquetaVerTodo(12, false), 'Ver todo (12)');
});

test('expandido muestra todas y el enlace pasa a "Ver menos"', () => {
  assert.equal(categoriasVisibles(8, true), 8);
  assert.equal(etiquetaVerTodo(8, true), 'Ver menos');
});

/* ---------- opciones por categoría: 4 iniciales, tope de 8 en el menú ---------- */

test('vista Visual: con 4 opciones o menos se muestran todas, sin expansor', () => {
  for (const total of [1, 3, 4]) {
    assert.equal(necesitaOpcionesMas(total, 'visual'), false);
    assert.equal(opcionesVisibles(total, false, 'visual'), total);
  }
});

test('vista Visual: entre 5 y 8 arranca en 4 y el contador dice cuántas agrega', () => {
  assert.equal(opcionesVisibles(6, false, 'visual'), OPCIONES_INICIALES_VISUAL);
  assert.equal(etiquetaOpcionesMas(5, false), 'Ver 1 opción más');
  assert.equal(etiquetaOpcionesMas(6, false), 'Ver 2 opciones más');
  assert.equal(etiquetaOpcionesMas(8, false), 'Ver 4 opciones más');
  assert.equal(opcionesVisibles(6, true, 'visual'), 6);
  assert.equal(etiquetaOpcionesMas(6, true), 'Ver menos');
});

test('con más de 8 el menú topea en 8 y el resto va a la página completa', () => {
  // Piscinas: 12 opciones → arranca en 4, "Ver 4 opciones más" (las que
  // agrega hasta el tope, nunca 8), expandida muestra 8 y ofrece la página.
  assert.equal(opcionesVisibles(12, false, 'visual'), OPCIONES_INICIALES_VISUAL);
  assert.equal(etiquetaOpcionesMas(12, false), 'Ver 4 opciones más');
  assert.equal(opcionesVisibles(12, true, 'visual'), OPCIONES_TOPE_MENU);
  assert.equal(necesitaVerTodasEn(12), true);
  assert.equal(necesitaVerTodasEn(8), false);
  assert.equal(etiquetaVerTodasEn('Piscinas'), 'Ver todas en Piscinas');
});

test('vista Lista: hasta 8 de entrada, sin expansor, con enlace si hay más', () => {
  assert.equal(opcionesVisibles(7, false, 'lista'), 7);
  assert.equal(opcionesVisibles(12, false, 'lista'), OPCIONES_TOPE_MENU);
  assert.equal(necesitaOpcionesMas(12, 'lista'), false);
});

/* ---------- invariantes de los datos ---------- */

test('el ejemplo del brief existe: Aire libre con 8 categorías, 6 visibles en Visual', () => {
  const aire = DEPARTMENTS.find((d) => d.slug === 'aire-libre-y-recreacion');
  assert.ok(aire, 'falta el departamento aire-libre-y-recreacion');
  assert.equal(aire.categories.length, 8);
  const nombres = aire.categories.map((c) => c.name);
  for (const esperado of ['Camping', 'Parrillas', 'Muebles de exterior', 'Piscinas', 'Jardín', 'Deportes', 'Bicicletas', 'Juegos al aire libre']) {
    assert.ok(nombres.includes(esperado), `falta la categoría ${esperado}`);
  }
  assert.equal(categoriasVisibles(aire.categories.length, false), 6);
  assert.equal(etiquetaVerTodo(aire.categories.length, false), 'Ver todo (8)');
  // Piscinas es el caso testigo del brief: 12 opciones
  const piscinas = aire.categories.find((c) => c.name === 'Piscinas');
  assert.equal(piscinas.items.length, 12);
  assert.equal(etiquetaOpcionesMas(piscinas.items.length, false), 'Ver 4 opciones más');
  assert.equal(necesitaVerTodasEn(piscinas.items.length), true);
  // Camping con 6: arranca en 4 → "Ver 2 opciones más"
  const camping = aire.categories.find((c) => c.name === 'Camping');
  assert.equal(camping.items.length, 6);
  assert.equal(etiquetaOpcionesMas(camping.items.length, false), 'Ver 2 opciones más');
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
