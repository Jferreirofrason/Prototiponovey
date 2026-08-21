import { ROUTES } from '../lib/routes';

// 13 — Footer completo: columnas de links + suscripción, redes + apps +
// contacto, legal + medios de pago. Valores del diseño ÷0.826 (el nodo
// vino escalado: íconos sociales 16.5px → 20px reales, etc.).

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: 'Sobre Nosotros',
    links: [
      { label: 'Nuestra empresa', href: '#nuestra-empresa' },
      { label: 'Sucursales', href: '#sucursales' },
      { label: 'Sostenibilidad', href: '#sostenibilidad' },
      { label: 'Trabaja con nosotros', href: '#trabaja-con-nosotros' },
    ],
  },
  {
    title: 'Servicio al cliente',
    links: [
      { label: 'Rastrea tu orden', href: ROUTES.rastrearOrden },
      { label: 'Métodos de entrega', href: '#metodos-de-entrega' },
      { label: 'Factura electrónica', href: '#factura-electronica' },
      { label: 'Preguntas frecuentes', href: '#preguntas-frecuentes' },
      { label: 'Contáctanos', href: '#contactanos' },
      { label: 'Cuéntanos tu experiencia', href: '#cuentanos-tu-experiencia' },
      { label: 'Ayuda', href: '#ayuda' },
    ],
  },
  {
    title: 'Nuestros servicios',
    links: [
      { label: 'Tarjeta de regalo', href: ROUTES.tarjetaRegalo },
      { label: 'Medios de pago', href: '#medios-de-pago' },
      { label: 'Puntos Gordos', href: '#puntos-gordos' },
      { label: 'Servicios e instalaciones', href: '#servicios-e-instalaciones' },
      { label: 'Garantía extendida', href: '#garantia-extendida' },
      { label: 'Remesas', href: '#remesas' },
      { label: 'Club de mercancía', href: '#club-de-mercancia' },
    ],
  },
  {
    title: 'Novey contigo',
    links: [
      { label: 'Blog', href: '#blog' },
      { label: 'Novey Pets Club', href: '#novey-pets-club' },
      { label: 'Novey Kids Club', href: '#novey-kids-club' },
      { label: 'Somos tu familia Novey', href: '#somos-tu-familia-novey' },
      { label: 'Redpro', href: '#redpro' },
    ],
  },
];

const SOCIAL_LINKS = [
  { name: 'Instagram', href: '#instagram', icon: '/figma/8e8ee6bf0afec7f6c15e3c37e6d0c12977cf4c66.svg' },
  { name: 'Facebook', href: '#facebook', icon: '/figma/eaf73c7f1c1540a777049d6f1b3377a5d733357c.svg' },
  { name: 'YouTube', href: '#youtube', icon: '/figma/150528dd3d7633186acf69596b8f81b83dfef6dc.svg' },
  { name: 'TikTok', href: '#tiktok', icon: '/figma/1de434c85cf7ed119595c1e158838a90a2b05ae9.svg' },
  { name: 'LinkedIn', href: '#linkedin', icon: '/figma/182f55592a9d6aa8c426fb838d92d2386395a72f.svg' },
  { name: 'X (Twitter)', href: '#x-twitter', icon: '/figma/9504f4810638a96a79a5363fb62ff34229de20ef.svg' },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Políticas de privacidad', href: '#politicas-de-privacidad' },
  { label: 'Términos y condiciones', href: '#terminos-y-condiciones' },
  { label: 'Políticas de cambios y devoluciones', href: '#politicas-de-cambios-y-devoluciones' },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-novey-blue bg-white">
      <div className="mx-auto flex w-full max-w-[1276px] flex-col gap-8 px-4 py-7 sm:px-6 lg:px-6">
        {/* Columnas de links + suscripción */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:flex lg:items-start lg:justify-between">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="lg:w-[180px]">
              <h3 className="pb-4 text-base font-bold leading-6 text-[#1A1A1A]">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm leading-5 text-[#333333] transition-colors duration-150 hover:text-novey-blue hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-4 lg:col-auto lg:w-[269px]">
            <h3 className="pb-4 text-base font-bold leading-6 text-[#1A1A1A]">Suscríbete</h3>
            <p className="pb-3 text-xs leading-[17px] text-[#555555]">
              Regístrate para recibir noticias y promociones
            </p>
            <form className="flex gap-3" aria-label="Suscripción a noticias y promociones">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Correo electrónico"
                className="h-10 w-full min-w-0 flex-1 rounded-novey border border-[#D9D9D9] px-3 text-sm text-text-ink placeholder:text-[#0A0A0A]/50"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-novey bg-[#0059A7] px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-novey-blue-dark"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Redes + apps + contacto */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold leading-5 text-[#1A1A1A]">Síguenos en</h3>
            <ul className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    aria-label={social.name}
                    className="inline-flex size-11 items-center justify-center transition-opacity duration-150 hover:opacity-70 lg:size-auto"
                  >
                    <img src={social.icon} alt="" width={20} height={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 lg:items-center">
            <h4 className="text-sm font-bold leading-5 text-[#1A1A1A]">Descarga nuestra App</h4>
            <div className="flex items-center gap-2">
              <a href="#google-play" aria-label="Descárgala en Google Play">
                <img
                  src="/figma/1b899b9954895029c8038a806a28cdb957339637.svg"
                  alt="Get it on Google Play"
                  className="h-12 w-auto"
                />
              </a>
              <a href="#app-store" aria-label="Descárgala en el App Store">
                <img
                  src="/figma/app-store-badge.svg"
                  alt="Download on the App Store"
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs font-medium leading-[18px] text-[#555555]">
              ¿Podemos ayudarte?
            </p>
            <a
              href="tel:300-9200"
              className="flex items-center gap-1 text-xs leading-[18px] text-[#333333] transition-colors duration-150 hover:text-novey-blue"
            >
              <img
                src="/figma/4b338958fdcc4b051822576a8144ca6032044f8a.svg"
                alt=""
                width={16}
                height={16}
              />
              300-9200
            </a>
            <a
              href="tel:6433-6170"
              className="flex items-center gap-1 text-xs leading-[18px] text-[#333333] transition-colors duration-150 hover:text-novey-blue"
            >
              <img
                src="/figma/ff6fc72a570878bb2af53a82416cffa90fc03fbf.svg"
                alt=""
                width={16}
                height={16}
              />
              6433-6170
            </a>
          </div>
        </div>

        {/* Legal + medios de pago */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs leading-[18px] text-[#555555]">
              © 2024 por Novey. Todos los derechos reservados
            </p>
            <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {LEGAL_LINKS.map((link, index) => (
                <li key={link.label} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-xs text-[#555555]">
                      |
                    </span>
                  ) : null}
                  <a
                    href={link.href}
                    className="text-xs leading-[18px] text-[#555555] transition-colors duration-150 hover:text-novey-blue hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <img
            src="/figma/payment-methods.svg"
            alt="Medios de pago: Visa, Mastercard, Clave, CMF y Yappy"
            className="h-7 w-auto"
          />
        </div>
      </div>
    </footer>
  );
}
