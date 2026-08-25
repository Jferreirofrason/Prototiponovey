// Pruebas del flujo "Quitar" del mini carrito: eliminación, deshacer,
// posición original, último producto, errores y eliminaciones consecutivas.
//
//   node --test pruebas/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  MAX_UNIDADES,
  ajustarCantidad,
  quitarItem,
  restaurarItem,
  textoCantidad,
  volverAAgregar,
} from '../lib/carrito-drawer.mjs';

const CARRITO = [
  { id: 'a', name: 'Sierra circular', price: 189.99, qty: 1 },
  { id: 'b', name: 'Set de brocas', price: 24.99, qty: 2 },
  { id: 'c', name: 'Pintura látex', price: 32.99, qty: 1 },
];

test('eliminar con productos restantes: saca el ítem y recuerda su posición', () => {
  const r = quitarItem(CARRITO, 'b');
  assert.equal(r.restantes.length, 2);
  assert.deepEqual(r.restantes.map((i) => i.id), ['a', 'c']);
  assert.equal(r.indice, 1);
  assert.equal(r.item.qty, 2, 'el recuerdo conserva la cantidad para el deshacer');
});

test('eliminar el último producto deja la lista vacía (empty state)', () => {
  const solo = [CARRITO[0]];
  const r = quitarItem(solo, 'a');
  assert.deepEqual(r.restantes, []);
  // y deshacer desde vacío lo repone
  const vuelta = restaurarItem(r.restantes, r);
  assert.deepEqual(vuelta.map((i) => i.id), ['a']);
});

test('deshacer restaura el producto en su posición original con su cantidad', () => {
  const r = quitarItem(CARRITO, 'b');
  const vuelta = restaurarItem(r.restantes, r);
  assert.deepEqual(vuelta.map((i) => i.id), ['a', 'b', 'c']);
  assert.equal(vuelta[1].qty, 2);
});

test('si la lista cambió y la posición ya no existe, entra al final sin romper', () => {
  const r = quitarItem(CARRITO, 'c'); // índice 2
  const listaMasChica = [CARRITO[0]]; // mientras tanto quitaron otro
  const vuelta = restaurarItem(listaMasChica, r);
  assert.deepEqual(vuelta.map((i) => i.id), ['a', 'c']);
});

test('si el producto volvió por otro camino, deshacer fusiona cantidades sin duplicar', () => {
  const r = quitarItem(CARRITO, 'b'); // qty 2
  const conBOtraVez = [...r.restantes, { id: 'b', name: 'Set de brocas', price: 24.99, qty: 1 }];
  const vuelta = restaurarItem(conBOtraVez, r);
  assert.equal(vuelta.filter((i) => i.id === 'b').length, 1, 'una sola fila');
  assert.equal(vuelta.find((i) => i.id === 'b').qty, 3, '1 + 2 fusionadas');
});

test('error al eliminar: la lista original queda intacta (no se aplicó nada)', () => {
  // El drawer solo aplica `restantes` si la escritura salió bien; ante un
  // error simplemente no lo aplica: la fuente de datos no cambió.
  const r = quitarItem(CARRITO, 'a');
  assert.equal(CARRITO.length, 3, 'quitarItem no muta la lista de entrada');
  assert.notEqual(r.restantes, CARRITO);
});

test('error al restaurar: "Volver a agregar" repone al final o fusiona', () => {
  const r = quitarItem(CARRITO, 'a');
  const alFinal = volverAAgregar(r.restantes, r.item);
  assert.deepEqual(alFinal.map((i) => i.id), ['b', 'c', 'a']);
  const fusionado = volverAAgregar(CARRITO, { id: 'c', name: 'Pintura látex', price: 32.99, qty: 2 });
  assert.equal(fusionado.find((i) => i.id === 'c').qty, 3);
});

test('eliminaciones consecutivas: cada recuerdo es independiente', () => {
  const r1 = quitarItem(CARRITO, 'a');
  const r2 = quitarItem(r1.restantes, 'c');
  assert.deepEqual(r2.restantes.map((i) => i.id), ['b']);
  // deshacer en orden inverso reconstruye la lista completa
  const v1 = restaurarItem(r2.restantes, r2);
  const v2 = restaurarItem(v1, r1);
  assert.deepEqual(v2.map((i) => i.id), ['a', 'b', 'c']);
});

test('quitar algo que ya no está devuelve null (clics repetidos no rompen)', () => {
  const r = quitarItem(CARRITO, 'a');
  assert.equal(quitarItem(r.restantes, 'a'), null);
});

/* ---------- cantidades (+ / −) ---------- */

test('sumar y restar confirman la cantidad nueva sin tocar el resto', () => {
  const mas = ajustarCantidad(CARRITO, 'b', 1);
  assert.equal(mas.tipo, 'ok');
  assert.equal(mas.qty, 3);
  assert.equal(mas.items.find((i) => i.id === 'b').qty, 3);
  assert.equal(mas.items.find((i) => i.id === 'a').qty, 1, 'los demás no cambian');

  const menos = ajustarCantidad(CARRITO, 'b', -1);
  assert.equal(menos.tipo, 'ok');
  assert.equal(menos.qty, 1);
});

test('restar con una sola unidad no baja a cero: explica que existe "Quitar"', () => {
  const r = ajustarCantidad(CARRITO, 'a', -1); // qty 1
  assert.equal(r.tipo, 'ultima-unidad');
  assert.equal(CARRITO.find((i) => i.id === 'a').qty, 1, 'la cantidad no se toca');
});

test('sumar con el stock lleno avisa el tope, sin reintento posible', () => {
  const lleno = [{ id: 'z', name: 'Producto', price: 5, qty: MAX_UNIDADES }];
  const r = ajustarCantidad(lleno, 'z', 1);
  assert.equal(r.tipo, 'sin-stock');
  assert.equal(r.max, MAX_UNIDADES);
});

test('ajustar un producto que ya no está devuelve null (clics tardíos)', () => {
  assert.equal(ajustarCantidad(CARRITO, 'no-existe', 1), null);
});

test('el texto de confirmación dice la cantidad, con singular incluido', () => {
  assert.equal(textoCantidad(1), 'Ahora tienes 1 unidad de este producto.');
  assert.equal(textoCantidad(2), 'Ahora tienes 2 unidades de este producto.');
});
