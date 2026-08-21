// Filtros y orden del PLP, derivados de los datos que ya tienen los productos.
// No se inventan atributos: marca sale del campo marca, tipo de carga y
// capacidad del nombre, y la modalidad de entrega del texto de disponibilidad.

export const GRUPOS = [
  {
    title: 'Marca',
    key: 'marca',
    opciones: (ps) => [...new Set(ps.map((p) => p.brand))].sort(),
    test: (p, v) => p.brand === v,
  },
  {
    title: 'Tipo de carga',
    key: 'carga',
    opciones: () => ['Carga frontal', 'Carga superior'],
    test: (p, v) => p.name.toLowerCase().includes(v.toLowerCase()),
  },
  {
    title: 'Capacidad de lavado',
    key: 'capacidad',
    opciones: () => ['10 a 14 kg', '15 a 18 kg', '19 kg o más'],
    test: (p, v) => {
      const kg = kilos(p.name);
      if (kg === null) return false;
      if (v === '10 a 14 kg') return kg >= 10 && kg <= 14;
      if (v === '15 a 18 kg') return kg >= 15 && kg <= 18;
      return kg >= 19;
    },
  },
  {
    title: 'Entrega',
    key: 'entrega',
    opciones: () => ['Retiro en tienda', 'Envío a domicilio'],
    test: (p, v) => {
      const t = (p.avail || '').toLowerCase();
      return v === 'Retiro en tienda' ? t.includes('retira') : t.includes('envío') || t.includes('envio');
    },
  },
];

function kilos(nombre) {
  const m = /(\d+(?:[.,]\d+)?)\s*kg/i.exec(nombre || '');
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

export const precioNum = (precio) => parseFloat(String(precio).replace(/[^0-9.]/g, '')) || 0;

/** Cuenta cuántos productos quedarían por opción, con los datos reales. */
export function contar(productos, grupo, valor) {
  return productos.filter((p) => grupo.test(p, valor)).length;
}

export function aplicar(productos, sel, rango) {
  return productos.filter((p) => {
    const precio = precioNum(p.price);
    if (precio < rango[0] || precio > rango[1]) return false;
    // Dentro de un grupo las opciones suman (OR); entre grupos restringen (AND).
    return GRUPOS.every((g) => {
      const elegidas = sel[g.key] || [];
      return elegidas.length === 0 || elegidas.some((v) => g.test(p, v));
    });
  });
}

export const ORDENES = [
  'Más populares',
  'Precio (de menor a mayor)',
  'Precio (de mayor a menor)',
  'Mejor calificados',
];

export function ordenar(productos, orden) {
  const l = [...productos];
  if (orden === 'Precio (de menor a mayor)') return l.sort((a, b) => precioNum(a.price) - precioNum(b.price));
  if (orden === 'Precio (de mayor a menor)') return l.sort((a, b) => precioNum(b.price) - precioNum(a.price));
  if (orden === 'Mejor calificados') return l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return l.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
}
