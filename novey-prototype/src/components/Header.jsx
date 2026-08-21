
import { Ic } from "../Icons";
import NoveyLogo from "./NoveyLogo";
import { useCartCount, useFavCount, useNombreSesion } from "../lib/useStore";

// Carrito, favoritos y sesión viven en el dominio unificado, fuera de esta app,
// así que se enlazan con href absoluto (no con Link, que prefijaría /productos).
// En el dominio propio del PLP, "/" redirige de vuelta al listado; ahí hace
// falta la URL absoluta del sitio unificado.
const homeHref =
  typeof window !== "undefined" && window.location.hostname.startsWith("novey-plp")
    ? "https://prototiponovey.vercel.app/"
    : "/";

export default function Header() {
  const cartCount = useCartCount();
  const favCount = useFavCount();
  const nombre = useNombreSesion();
  return (
    <header className="nhdr">
      <div className="nhdr__ship">
        <Ic.truck s={16} /> Envío gratis en pedidos mayores a $50
      </div>
      <div className="nhdr__tabs">
        <div className="brands">
          {/* Selector global de marcas: siempre a la landing principal */}
          <a className="on" href="https://prototiponovey.vercel.app/">Novey</a><i>|</i>
          <a href="https://cochez-web-mauve.vercel.app/">Cochez</a><i>|</i>
          <a>Punto Cochez</a><i>|</i>
          <a href="https://kohler-panama.vercel.app/">Kohler by Cochez</a><i>|</i>
          <a>CMF</a>
        </div>
        <button className="empresas">Empresas <Ic.chevD s={14} /></button>
      </div>

      <div className="nhdr__main">
        <button className="nhdr__burger"><Ic.menu s={24} /></button>
        {/* Enlace absoluto, no <Link>: el router corre con basename="/productos"
            y "to=/" devolvía al listado en vez de al Home del sitio. */}
        <a href={homeHref} className="nhdr__logo" aria-label="Novey — ir al inicio"><NoveyLogo /></a>
        <div className="nhdr__search">
          <Ic.search s={20} />
          <input placeholder="Buscar productos, marcas y más..." />
          <button className="go"><Ic.search s={18} /></button>
        </div>
        <button className="nhdr__store">
          <Ic.pin s={18} />
          <span><small>Retiro o envío</small><b>Coronado</b></span>
          <Ic.chevD s={16} />
        </button>
        <div className="nhdr__acts">
          <a className="nhdr__act" href="/favoritos">
            <span className="nhdr__act-ic">
              <Ic.heart />
              {favCount > 0 && (
                <span className="nhdr__cart-c" aria-label={`${favCount} ${favCount === 1 ? "producto" : "productos"} en favoritos`}>
                  {favCount}
                </span>
              )}
            </span>
            <span className="lbl">Favoritos</span>
          </a>
          <a className="nhdr__act" href="/login">
            <Ic.user />
            <span className="lbl">{nombre ? `Hola, ${nombre}` : "Iniciar sesión"}</span>
          </a>
          <a className="nhdr__act" href="/carrito">
            <span className="nhdr__act-ic">
              <Ic.cart />
              {cartCount > 0 && (
                <span className="nhdr__cart-c" aria-label={`${cartCount} ${cartCount === 1 ? "producto" : "productos"} en el carrito`}>
                  {cartCount}
                </span>
              )}
            </span>
            <span className="lbl">Carrito</span>
          </a>
        </div>
      </div>

      <nav className="nhdr__nav">
        {/* Sólo llevan a algún lado las que tienen destino real; el resto queda
            como texto, para no dejar enlaces que no van a ninguna parte. */}
        <a className="pill dept" href="/productos"><Ic.menu s={16} /> Departamentos <Ic.chevD s={14} /></a>
        <a className="pill" href="/productos">Ofertas</a>
        <span className="pill pill--off">Tarjeta de regalo</span>
        <span className="pill pill--off">🎄 Navidad</span>
        <span className="pill pill--off">Novedades</span>
        <span className="pill pill--off">Catálogos</span>
        <a className="pill" href="/rastrear-orden">Rastrear mi orden</a>
        <span className="pill pill--off">Más <Ic.chevD s={14} /></span>
      </nav>
    </header>
  );
}
