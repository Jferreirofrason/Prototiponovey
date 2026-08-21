// Contenido del mega-menú Departamentos, extraído del Figma 'Novey - Version 0.1'
// (sección 'Menu - Departamentos Desktop', página Revision). 13 departamentos.

export interface FeaturedCategory {
  name: string;
  image: string; // ruta bajo /public
}

export interface MenuColumn {
  title: string;
  items: string[];
  viewAll: string; // texto del link 'Ver todo …'
}

export interface Department {
  name: string;
  slug: string;
  subtitle: string; // 'N categorías disponibles'
  featured: FeaturedCategory[];
  columns: MenuColumn[];
}

export const DEPARTMENTS: Department[] = [
  {
    name: 'Acabados',
    slug: 'acabados',
    subtitle: '3 categorías disponibles',
    featured: [
      { name: 'Pintura', image: '/images/departments/acabados-pintura.jpg' },
      { name: 'Pisos Y Revestimientos', image: '/images/departments/acabados-pisos-y-revestimientos.jpg' },
      { name: 'Adhesivos Y Pegamentos', image: '/images/departments/acabados-adhesivos-y-pegamentos.jpg' },
    ],
    columns: [
      {
        title: 'Pintura',
        items: ['Pintura Interior', 'Pintura Exterior', 'Esmaltes', 'Barnices Y Lacas', 'Impermeabilizantes', 'Selladores'],
        viewAll: 'Ver todo Pintura',
      },
      {
        title: 'Pisos Y Revestimientos',
        items: ['Cerámica', 'Porcelanato', 'Pisos De Madera', 'Pisos Laminados', 'Pisos Vinílicos', 'Alfombras'],
        viewAll: 'Ver todo Pisos Y Revestimientos',
      },
      {
        title: 'Adhesivos Y Pegamentos',
        items: ['Pegamento Para Cerámica', 'Pegamento Para Madera', 'Silicona', 'Pegamento General'],
        viewAll: 'Ver todo Adhesivos Y Pegamentos',
      },
    ],
  },
  {
    name: 'Aire Libre Y Recreación',
    slug: 'aire-libre-y-recreacion',
    subtitle: '5 categorías disponibles',
    featured: [
      { name: 'Artículos De Acampar', image: '/images/departments/aire-libre-y-recreacion-articulos-de-acampar.jpg' },
      { name: 'Barbacoas', image: '/images/departments/aire-libre-y-recreacion-barbacoas.jpg' },
      { name: 'Muebles De Exterior', image: '/images/departments/aire-libre-y-recreacion-muebles-de-exterior.jpg' },
      { name: 'Piscinas', image: '/images/departments/aire-libre-y-recreacion-piscinas.jpg' },
    ],
    columns: [
      {
        title: 'Artículos De Acampar',
        items: ['Accesorios Para Acampar', 'Bolsas De Dormir', 'Bombas Para Inflar', 'Carpas', 'Catres', 'Colchones Inflables', 'Hieleras', 'Linternas'],
        viewAll: 'Ver todas (9)',
      },
      {
        title: 'Barbacoas',
        items: ['Accesorios Para Barbacoas', 'Barbacoas De Carbón', 'Barbacoas De Gas', 'Barbacoas Eléctricas', 'Carbón Y Leña', 'Parrillas Portátiles', 'Utensilios Para Barbacoa'],
        viewAll: 'Ver todo Barbacoas',
      },
      {
        title: 'Muebles De Exterior',
        items: ['Conjuntos De Patio', 'Hamacas Y Columpios', 'Mesas De Exterior', 'Parasoles Y Toldos', 'Sillas De Exterior', 'Tumbonas'],
        viewAll: 'Ver todo Muebles De Exterior',
      },
      {
        title: 'Piscinas',
        items: ['Accesorios Para Piscinas', 'Bombas Y Filtros', 'Cubiertas Para Piscinas', 'Escaleras Para Piscinas', 'Limpieza De Piscinas', 'Piscinas Inflables', 'Productos Químicos'],
        viewAll: 'Ver todo Piscinas',
      },
      {
        title: 'Jardinería',
        items: ['Fertilizantes', 'Herramientas De Jardín', 'Macetas Y Contenedores', 'Mangueras Y Riego', 'Semillas Y Plantas', 'Tierra Y Sustratos'],
        viewAll: 'Ver todo Jardinería',
      },
    ],
  },
  {
    name: 'Alimentos',
    slug: 'alimentos',
    subtitle: '3 categorías disponibles',
    featured: [
      { name: 'Bebidas', image: '/images/departments/alimentos-bebidas.jpg' },
      { name: 'Despensa', image: '/images/departments/alimentos-despensa.jpg' },
      { name: 'Snacks Y Dulces', image: '/images/departments/alimentos-snacks-y-dulces.jpg' },
    ],
    columns: [
      {
        title: 'Bebidas',
        items: ['Agua', 'Café Y Té', 'Jugos Y Néctares', 'Refrescos', 'Bebidas Energéticas'],
        viewAll: 'Ver todo Bebidas',
      },
      {
        title: 'Despensa',
        items: ['Arroz Y Granos', 'Aceites Y Vinagres', 'Conservas', 'Pasta', 'Salsas Y Condimentos'],
        viewAll: 'Ver todo Despensa',
      },
      {
        title: 'Snacks Y Dulces',
        items: ['Chocolates', 'Galletas', 'Papas Fritas', 'Frutos Secos'],
        viewAll: 'Ver todo Snacks Y Dulces',
      },
    ],
  },
  {
    name: 'Automóvil',
    slug: 'automovil',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Accesorios Para Auto', image: '/images/departments/automovil-accesorios-para-auto.jpg' },
      { name: 'Limpieza De Vehículos', image: '/images/departments/automovil-limpieza-de-vehiculos.jpg' },
      { name: 'Herramientas Para Auto', image: '/images/departments/automovil-herramientas-para-auto.jpg' },
      { name: 'Lubricantes Y Fluidos', image: '/images/departments/automovil-lubricantes-y-fluidos.jpg' },
    ],
    columns: [
      {
        title: 'Accesorios Para Auto',
        items: ['Alfombras', 'Cargadores', 'Forros Para Asientos', 'Organizadores', 'Parasoles'],
        viewAll: 'Ver todo Accesorios Para Auto',
      },
      {
        title: 'Limpieza De Vehículos',
        items: ['Aspiradoras', 'Ceras Y Pulimento', 'Esponjas Y Bayetas', 'Shampoo Para Auto'],
        viewAll: 'Ver todo Limpieza De Vehículos',
      },
      {
        title: 'Herramientas Para Auto',
        items: ['Cables Para Batería', 'Gatos Hidráulicos', 'Infladores', 'Llaves Y Dados'],
        viewAll: 'Ver todo Herramientas Para Auto',
      },
      {
        title: 'Lubricantes Y Fluidos',
        items: ['Aceites Para Motor', 'Anticongelante', 'Líquido De Frenos', 'Refrigerante'],
        viewAll: 'Ver todo Lubricantes Y Fluidos',
      },
    ],
  },
  {
    name: 'Baño',
    slug: 'bano',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Grifería', image: '/images/departments/bano-griferia.jpg' },
      { name: 'Sanitarios', image: '/images/departments/bano-sanitarios.jpg' },
      { name: 'Accesorios Para Baño', image: '/images/departments/bano-accesorios-para-bano.jpg' },
      { name: 'Muebles Para Baño', image: '/images/departments/bano-muebles-para-bano.jpg' },
    ],
    columns: [
      {
        title: 'Grifería',
        items: ['Grifos Para Lavabo', 'Grifos Para Ducha', 'Regaderas', 'Mezcladores'],
        viewAll: 'Ver todo Grifería',
      },
      {
        title: 'Sanitarios',
        items: ['Inodoros', 'Lavabos', 'Urinarios', 'Bidets'],
        viewAll: 'Ver todo Sanitarios',
      },
      {
        title: 'Accesorios Para Baño',
        items: ['Espejos', 'Jaboneras', 'Porta Papel Higiénico', 'Toalleros', 'Perchas Y Ganchos'],
        viewAll: 'Ver todo Accesorios Para Baño',
      },
      {
        title: 'Muebles Para Baño',
        items: ['Gabinetes', 'Organizadores', 'Botiquines', 'Estanterías'],
        viewAll: 'Ver todo Muebles Para Baño',
      },
    ],
  },
  {
    name: 'Cocina',
    slug: 'cocina',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Electrodomésticos', image: '/images/departments/cocina-electrodomesticos.jpg' },
      { name: 'Utensilios', image: '/images/departments/cocina-utensilios.jpg' },
      { name: 'Vajilla Y Cristalería', image: '/images/departments/cocina-vajilla-y-cristaleria.jpg' },
      { name: 'Almacenamiento', image: '/images/departments/cocina-almacenamiento.jpg' },
    ],
    columns: [
      {
        title: 'Electrodomésticos',
        items: ['Batidoras', 'Cafeteras', 'Licuadoras', 'Microondas', 'Tostadoras', 'Procesadores De Alimentos'],
        viewAll: 'Ver todo Electrodomésticos',
      },
      {
        title: 'Utensilios',
        items: ['Cuchillos Y Tablas', 'Espátulas Y Cucharones', 'Tazas Y Cucharas Medidoras', 'Ralladores', 'Coladores'],
        viewAll: 'Ver todo Utensilios',
      },
      {
        title: 'Vajilla Y Cristalería',
        items: ['Platos', 'Tazas Y Vasos', 'Cubiertos', 'Copas'],
        viewAll: 'Ver todo Vajilla Y Cristalería',
      },
      {
        title: 'Almacenamiento',
        items: ['Contenedores', 'Frascos', 'Organizadores', 'Cestas'],
        viewAll: 'Ver todo Almacenamiento',
      },
    ],
  },
  {
    name: 'Construcción',
    slug: 'construccion',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Cemento Y Concreto', image: '/images/departments/construccion-cemento-y-concreto.jpg' },
      { name: 'Ladrillos Y Bloques', image: '/images/departments/construccion-ladrillos-y-bloques.jpg' },
      { name: 'Arena Y Grava', image: '/images/departments/construccion-arena-y-grava.jpg' },
      { name: 'Madera', image: '/images/departments/construccion-madera.jpg' },
    ],
    columns: [
      {
        title: 'Cemento Y Concreto',
        items: ['Cemento Gris', 'Cemento Blanco', 'Concreto Premezclado', 'Mortero'],
        viewAll: 'Ver todo Cemento Y Concreto',
      },
      {
        title: 'Ladrillos Y Bloques',
        items: ['Ladrillos Rojos', 'Bloques De Concreto', 'Adoquines', 'Bloques De Vidrio'],
        viewAll: 'Ver todo Ladrillos Y Bloques',
      },
      {
        title: 'Arena Y Grava',
        items: ['Arena Para Construcción', 'Grava', 'Piedra Triturada'],
        viewAll: 'Ver todo Arena Y Grava',
      },
      {
        title: 'Madera',
        items: ['Tablas', 'Vigas', 'Contrachapado', 'MDF'],
        viewAll: 'Ver todo Madera',
      },
    ],
  },
  {
    name: 'Decoración',
    slug: 'decoracion',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Cortinas Y Persianas', image: '/images/departments/decoracion-cortinas-y-persianas.jpg' },
      { name: 'Iluminación Decorativa', image: '/images/departments/decoracion-iluminacion-decorativa.jpg' },
      { name: 'Cuadros Y Espejos', image: '/images/departments/decoracion-cuadros-y-espejos.jpg' },
      { name: 'Textiles Para El Hogar', image: '/images/departments/decoracion-textiles-para-el-hogar.jpg' },
    ],
    columns: [
      {
        title: 'Cortinas Y Persianas',
        items: ['Cortinas De Tela', 'Persianas Enrollables', 'Persianas Verticales', 'Rieles Y Barras'],
        viewAll: 'Ver todo Cortinas Y Persianas',
      },
      {
        title: 'Iluminación Decorativa',
        items: ['Lámparas De Techo', 'Lámparas De Mesa', 'Lámparas De Pie', 'Apliques De Pared'],
        viewAll: 'Ver todo Iluminación Decorativa',
      },
      {
        title: 'Cuadros Y Espejos',
        items: ['Cuadros Decorativos', 'Marcos', 'Espejos Decorativos', 'Vinilos Para Pared'],
        viewAll: 'Ver todo Cuadros Y Espejos',
      },
      {
        title: 'Textiles Para El Hogar',
        items: ['Cojines', 'Mantas', 'Tapetes', 'Fundas'],
        viewAll: 'Ver todo Textiles Para El Hogar',
      },
    ],
  },
  {
    name: 'Eléctrico',
    slug: 'electrico',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Cables Y Alambres', image: '/images/departments/electrico-cables-y-alambres.jpg' },
      { name: 'Interruptores Y Contactos', image: '/images/departments/electrico-interruptores-y-contactos.jpg' },
      { name: 'Luminarias', image: '/images/departments/electrico-luminarias.jpg' },
      { name: 'Tableros Y Protecciones', image: '/images/departments/electrico-tableros-y-protecciones.jpg' },
    ],
    columns: [
      {
        title: 'Cables Y Alambres',
        items: ['Cable THHW', 'Cable THW', 'Alambre Por Calibre', 'Cable De Uso Rudo'],
        viewAll: 'Ver todo Cables Y Alambres',
      },
      {
        title: 'Interruptores Y Contactos',
        items: ['Interruptores Sencillos', 'Interruptores Dobles', 'Contactos', 'Placas Decorativas'],
        viewAll: 'Ver todo Interruptores Y Contactos',
      },
      {
        title: 'Luminarias',
        items: ['Focos LED', 'Tubos LED', 'Reflectores', 'Luminarias De Emergencia'],
        viewAll: 'Ver todo Luminarias',
      },
      {
        title: 'Tableros Y Protecciones',
        items: ['Centro De Carga', 'Pastillas Térmicas', 'Reguladores De Voltaje', 'Supresores De Picos'],
        viewAll: 'Ver todo Tableros Y Protecciones',
      },
    ],
  },
  {
    name: 'Electrónica',
    slug: 'electronica',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Audio', image: '/images/departments/electronica-audio.jpg' },
      { name: 'Televisores', image: '/images/departments/electronica-televisores.jpg' },
      { name: 'Computación', image: '/images/departments/electronica-computacion.jpg' },
      { name: 'Accesorios', image: '/images/departments/electronica-accesorios.jpg' },
    ],
    columns: [
      {
        title: 'Audio',
        items: ['Audífonos', 'Bocinas Bluetooth', 'Sistemas De Sonido', 'Micrófonos'],
        viewAll: 'Ver todo Audio',
      },
      {
        title: 'Televisores',
        items: ['TV 32 Pulgadas', 'TV 43 Pulgadas', 'TV 55 Pulgadas', 'Soportes Para TV'],
        viewAll: 'Ver todo Televisores',
      },
      {
        title: 'Computación',
        items: ['Laptops', 'Tablets', 'Teclados Y Mouse', 'Monitores'],
        viewAll: 'Ver todo Computación',
      },
      {
        title: 'Accesorios',
        items: ['Cables USB', 'Cargadores', 'Memorias USB', 'Fundas Y Protectores'],
        viewAll: 'Ver todo Accesorios',
      },
    ],
  },
  {
    name: 'Escolar Y Oficina',
    slug: 'escolar-y-oficina',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Papelería', image: '/images/departments/escolar-y-oficina-papeleria.jpg' },
      { name: 'Escritura', image: '/images/departments/escolar-y-oficina-escritura.jpg' },
      { name: 'Arte Y Manualidades', image: '/images/departments/escolar-y-oficina-arte-y-manualidades.jpg' },
      { name: 'Organización', image: '/images/departments/escolar-y-oficina-organizacion.jpg' },
    ],
    columns: [
      {
        title: 'Papelería',
        items: ['Cuadernos', 'Hojas Blancas', 'Carpetas', 'Blocks Y Libretas'],
        viewAll: 'Ver todo Papelería',
      },
      {
        title: 'Escritura',
        items: ['Bolígrafos', 'Lápices', 'Marcadores', 'Plumas Fuente'],
        viewAll: 'Ver todo Escritura',
      },
      {
        title: 'Arte Y Manualidades',
        items: ['Pinturas Y Acuarela', 'Pinceles', 'Plastilina', 'Cartulinas'],
        viewAll: 'Ver todo Arte Y Manualidades',
      },
      {
        title: 'Organización',
        items: ['Archiveros', 'Bandejas Para Escritorio', 'Porta Lápices', 'Organizadores'],
        viewAll: 'Ver todo Organización',
      },
    ],
  },
  {
    name: 'Ferretería',
    slug: 'ferreteria',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Herramientas De Mano', image: '/images/departments/ferreteria-herramientas-de-mano.jpg' },
      { name: 'Herramientas Eléctricas', image: '/images/departments/ferreteria-herramientas-electricas.jpg' },
      { name: 'Tornillería Y Fijación', image: '/images/departments/ferreteria-tornilleria-y-fijacion.jpg' },
      { name: 'Candados Y Cerraduras', image: '/images/departments/ferreteria-candados-y-cerraduras.jpg' },
    ],
    columns: [
      {
        title: 'Herramientas De Mano',
        items: ['Martillos', 'Destornilladores', 'Alicates', 'Llaves Ajustables', 'Serruchos'],
        viewAll: 'Ver todo Herramientas De Mano',
      },
      {
        title: 'Herramientas Eléctricas',
        items: ['Taladros', 'Lijadoras', 'Sierras Eléctricas', 'Esmeriles'],
        viewAll: 'Ver todo Herramientas Eléctricas',
      },
      {
        title: 'Tornillería Y Fijación',
        items: ['Tornillos', 'Clavos', 'Taquetes', 'Tuercas Y Rondanas'],
        viewAll: 'Ver todo Tornillería Y Fijación',
      },
      {
        title: 'Candados Y Cerraduras',
        items: ['Candados', 'Cerraduras De Pomo', 'Cerrojos', 'Bisagras'],
        viewAll: 'Ver todo Candados Y Cerraduras',
      },
    ],
  },
  {
    name: 'Hogar',
    slug: 'hogar',
    subtitle: '4 categorías disponibles',
    featured: [
      { name: 'Muebles', image: '/images/departments/hogar-muebles.jpg' },
      { name: 'Recámara', image: '/images/departments/hogar-recamara.jpg' },
      { name: 'Organización', image: '/images/departments/hogar-organizacion.jpg' },
      { name: 'Limpieza', image: '/images/departments/hogar-limpieza.jpg' },
    ],
    columns: [
      {
        title: 'Muebles',
        items: ['Sofás', 'Mesas De Centro', 'Estanterías', 'Sillas De Comedor'],
        viewAll: 'Ver todo Muebles',
      },
      {
        title: 'Recámara',
        items: ['Camas', 'Colchones', 'Almohadas', 'Sábanas'],
        viewAll: 'Ver todo Recámara',
      },
      {
        title: 'Organización',
        items: ['Cajas De Almacenamiento', 'Closets Portátiles', 'Ganchos Y Perchas', 'Repisas'],
        viewAll: 'Ver todo Organización',
      },
      {
        title: 'Limpieza',
        items: ['Trapeadores', 'Escobas', 'Aspiradoras', 'Detergentes'],
        viewAll: 'Ver todo Limpieza',
      },
    ],
  },
];
