// Pruebas del flujo "Agregar una cotización": formato, resolución de cada
// estado y regla de combinación con el carrito.
//
//   node --test pruebas/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  combinarConCarrito,
  esFormatoValido,
  normalizarNumero,
  resolverCotizacion,
} from '../lib/cotizaciones.mjs';

const CARRITO = [
  { id: 'destacado-1', name: 'Sierra circular', price: 189.99, qty: 1 },
  { id: 'x', name: 'Otro producto', price: 10, qty: 3 },
];

/* ---------- formato ---------- */

test('el número se normaliza: espacios fuera y mayúsculas', () => {
  assert.equal(normalizarNumero('  cot-1001  '), 'COT-1001');
});

test('formato: COT- más 4 a 6 dígitos; vacío o cualquier otra cosa es inválido', () => {
  assert.equal(esFormatoValido('COT-1001'), true);
  assert.equal(esFormatoValido('COT-123456'), true);
  assert.equal(esFormatoValido(''), false);
  assert.equal(esFormatoValido('1001'), false);
  assert.equal(esFormatoValido('COT-12'), false);
  assert.equal(esFormatoValido('COT-1234567'), false);
  assert.equal(esFormatoValido('cotización uno'), false);
});

/* ---------- resolución de estados ---------- */

test('cotización válida devuelve sus productos', () => {
  const r = resolverCotizacion('COT-1001');
  assert.equal(r.tipo, 'ok');
  assert.equal(r.items.length, 2);
});

test('cotización no encontrada', () => {
  assert.equal(resolverCotizacion('COT-7777').tipo, 'no-encontrada');
});

test('cotización vencida', () => {
  assert.equal(resolverCotizacion('COT-2002').tipo, 'vencida');
});

test('cotización de otra cuenta: sin datos del propietario en la respuesta', () => {
  const r = resolverCotizacion('COT-3003');
  assert.equal(r.tipo, 'ajena');
  assert.equal(Object.keys(r).length, 1, 'no expone nada más que el tipo');
});

test('cotización ya agregada no vuelve a resolver productos', () => {
  const r = resolverCotizacion('COT-1001', { aplicadas: ['COT-1001'] });
  assert.equal(r.tipo, 'ya-agregada');
  assert.equal(r.items, undefined);
});

test('productos sin stock: informa cuáles y ofrece los disponibles', () => {
  const r = resolverCotizacion('COT-4004');
  assert.equal(r.tipo, 'parcial');
  assert.equal(r.disponibles.length, 2);
  assert.equal(r.noDisponibles.length, 1);
});

test('precios modificados: trae cotizado, actual y totales', () => {
  const r = resolverCotizacion('COT-5005');
  assert.equal(r.tipo, 'precios');
  assert.equal(r.cambios[0].precioCotizado, 169.99);
  assert.equal(r.cambios[0].precioActual, 189.99);
  assert.ok(r.totalActual > r.totalCotizado);
});

test('error de red en el primer intento; el reintento sale bien', () => {
  assert.equal(resolverCotizacion('COT-9999', { intento: 1 }).tipo, 'error-red');
  assert.equal(resolverCotizacion('COT-9999', { intento: 2 }).tipo, 'ok');
});

/* ---------- combinación con el carrito ---------- */

test('la cotización SE SUMA al carrito: fusiona iguales, no reemplaza nada', () => {
  const r = resolverCotizacion('COT-1001');
  const combinado = combinarConCarrito(CARRITO, r.items);
  // el producto ajeno a la cotización sigue intacto
  assert.equal(combinado.find((i) => i.id === 'x').qty, 3);
  // la sierra estaba (qty 1) y la cotización trae 1 más → 2, una sola fila
  assert.equal(combinado.filter((i) => i.id === 'destacado-1').length, 1);
  assert.equal(combinado.find((i) => i.id === 'destacado-1').qty, 2);
  // la pintura es nueva → entra al final
  assert.equal(combinado.at(-1).id, 'entrega-2');
  assert.equal(combinado.length, 3);
});

test('combinar con carrito vacío simplemente carga la cotización', () => {
  const r = resolverCotizacion('COT-1001');
  assert.equal(combinarConCarrito([], r.items).length, 2);
});
