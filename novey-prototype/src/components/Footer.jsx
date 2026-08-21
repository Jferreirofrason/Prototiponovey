import { Ic } from "../Icons";
import NoveyLogo from "./NoveyLogo";
import { SOCIAL } from "./SocialLogos";

const PAY = [
  ["Visa", "/img/pay/visa.svg"],
  ["Mastercard", "/img/pay/mastercard.svg"],
  ["CMF", "/img/pay/cmf.png"],
  ["Yappy", "/img/pay/yappy.png"],
];

const cols = {
  "Sobre Nosotros": ["Nuestra empresa", "Sucursales", "Sostenibilidad", "Trabaja con nosotros"],
  "Servicio al cliente": ["Rastrea tu orden", "Métodos de entrega", "Factura electrónica", "Preguntas frecuentes", "Contáctanos", "Ayuda"],
  "Nuestros servicios": ["Tarjeta de regalo", "Medios de pago", "Puntos Gordos", "Servicios e instalaciones", "Garantía extendida", "Remesas"],
  "Novey contigo": ["Blog", "Novey Pets Club", "Novey Kids Club", "Somos tu Familia Novey", "Redpro"],
};


export default function Footer() {
  return (
    <footer className="nftr">
      <div className="nftr__top">
        <div className="nftr__brand"><NoveyLogo /></div>
        <div className="nftr__cols">
          {Object.entries(cols).map(([h, items]) => (
            <div className="nftr__col" key={h}>
              <h4>{h}</h4>
              {items.map((i) => <a key={i} href="#">{i}</a>)}
            </div>
          ))}
        </div>
        <div className="nftr__sub">
          <h4>Suscríbete</h4>
          <p>Regístrate para recibir noticias y promociones de Novey.</p>
          <div className="nftr__news">
            <input placeholder="Correo electrónico" />
            <button className="btn btn--cta">Enviar</button>
          </div>
        </div>
      </div>

      <div className="nftr__mid">
        <div className="nftr__follow">
          <span>Síguenos</span>
          <div className="nftr__social">
            {SOCIAL.map((s) => (
              <a key={s.name} href="#" aria-label={s.name} title={s.name} style={{ color: s.color }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div className="nftr__apps">
          <span>Descarga nuestra App</span>
          <div className="nftr__store">
            <a className="appbadge" href="#" aria-label="Disponible en Google Play"><img src="/img/store/googleplay.svg" alt="Disponible en Google Play" /></a>
            <a className="appbadge" href="#" aria-label="Descárgalo en la App Store"><img src="/img/store/appstore.svg" alt="Descárgalo en la App Store" /></a>
          </div>
        </div>
      </div>

      <div className="nftr__bottom">
        <div className="nftr__pay">
          <img src="/img/pay/pay-methods.png" alt="Visa, Mastercard, Clave, CMF, Yappy" />
        </div>
        <div className="nftr__legal">
          <nav>
            <a href="#">Políticas de privacidad</a>
            <a href="#">Políticas de cambios y devoluciones</a>
            <a href="#">Términos y condiciones</a>
          </nav>
          <div className="nftr__contact"><span>☎ 300-9100</span><span><Ic.pin s={14} /> 6433-6170</span></div>
        </div>
        <div className="nftr__copy">© 2026 Novey, S.A. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}
