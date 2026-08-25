// Pruebas del flujo "Agregar una cotización": formato, resolución de cada
// estado (con el resumen del paso intermedio) y regla de combinación.
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

test('el número se normaliza: espacios fuera y sin el prefijo COT- del papel', () => {
  assert.equal(normalizarNumero('  1001  '), '1001');
  assert.equal(normalizarNumero('cot-1001'), '1001');
  assert.equal(normalizarNumero('COT1001'), '1001');
});

test('formato: 4 a 6 dígitos; vacío o cualquier otra cosa es inválido', () => {
  assert.equal(esFormatoValido('1001'), true);
  assert.equal(esFormatoValido('123456'), true);
  assert.equal(esFormatoValido(''), false);
  assert.equal(esFormatoValido('12'), false);
  assert.equal(esFormatoValido('1234567'), false);
  assert.equal(esFormatoValido('cotización uno'), false);
});

/* ---------- resolución de estados ---------- */

test('cotización encontrada trae lo que necesita el resumen', () => {
  const r = resolverCotizacion('1001');
  assert.equal(r.tipo, 'encontrada');
  assert.equal(r.items.length, 2);
  assert.equal(r.total, 255.97, 'sierra 189.99 + pintura 32.99×2');
  assert.deepEqual(r.noDisponibles, []);
  assert.deepEqual(r.preciosActualizados, []);
});

test('cotización no encontrada', () => {
  assert.equal(resolverCotizacion('7777').tipo, 'no-encontrada');
});

test('cotización vencida', () => {
  assert.equal(resolverCotizacion('2002').tipo, 'vencida');
});

test('cotización de otra cuenta: sin datos del propietario en la respuesta', () => {
  const r = resolverCotizacion('3003');
  assert.equal(r.tipo, 'ajena');
  assert.equal(Object.keys(r).length, 1, 'no expone nada más que el tipo');
});

test('cotización ya agregada no vuelve a resolver productos', () => {
  const r = resolverCotizacion('1001', { aplicadas: ['1001'] });
  assert.equal(r.tipo, 'ya-agregada');
  assert.equal(r.items, undefined);
});

test('productos sin stock: el resumen dice cuáles no se van a agregar', () => {
  const r = resolverCotizacion('4004');
  assert.equal(r.tipo, 'encontrada');
  assert.equal(r.items.length, 2, 'solo los disponibles');
  assert.equal(r.noDisponibles.length, 1);
  assert.equal(r.total, 90.97, 'el total es solo de lo disponible');
});

test('precios modificados: el resumen ya trae el total con precios de hoy', () => {
  const r = resolverCotizacion('5005');
  assert.equal(r.tipo, 'encontrada');
  assert.equal(r.preciosActualizados[0].precioCotizado, 169.99);
  assert.equal(r.preciosActualizados[0].precioActual, 189.99);
  assert.equal(r.total, 189.99);
});

test('error de conexión en el primer intento; el reintento sale bien', () => {
  assert.equal(resolverCotizacion('9999', { intento: 1 }).tipo, 'error-red');
  assert.equal(resolverCotizacion('9999', { intento: 2 }).tipo, 'encontrada');
});

/* ---------- combinación con el carrito ---------- */

test('la cotización SE SUMA al carrito: fusiona iguales, no reemplaza nada', () => {
  const r = resolverCotizacion('1001');
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
  const r = resolverCotizacion('1001');
  assert.equal(combinarConCarrito([], r.items).length, 2);
});
