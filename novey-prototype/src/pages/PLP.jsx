import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Ic, Stars } from "../Icons";
import { WashingMachine, Droplets, Combine, Fan, Layers2, ShoppingBasket, SlidersHorizontal, RotateCw, ArrowRight, LayoutGrid, List } from "lucide-react";
import { products, subcategories, BADGE_LABEL, IMG } from "../data";
import { GRUPOS, ORDENES, aplicar, contar, ordenar } from "../lib/filtrar";
import { readCart, writeCart } from "../lib/cart";
import { FAV_CHANGE_EVENT, readFavorites, toggleFavorite } from "../lib/favorites";

const SWATCHES = ["#1a1a1a", "#ffffff", "#9aa0a6"];
const CAPS = ["13 kg", "15 kg", "19 kg", "22 kg", "30 kg"];

const SUBCAT_ICONS = {
  "Lavadoras automáticas": WashingMachine,
  "Lavadoras semiautomáticas": Droplets,
  "Secadoras": Fan,
  "Centros de lavado": Layers2,
  "Lavasecadoras": Combine,
  "Accesorios": ShoppingBasket,
};

function ProductCard({ p }) {
  const [fav, setFav] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const navigate = useNavigate();
  // La card entera es clickeable, pero adentro hay links y botones: sin este
  // guard el click navegaba dos veces y el botón Atrás necesitaba dos toques.
  const go = (e) => {
    if (e?.target?.closest?.('a, button')) return;
    navigate(`/producto/${p.id}`);
  };
  const stop = (e) => e.stopPropagation();

  // El corazón refleja el estado real, compartido con la home y /favoritos.
  useEffect(() => {
    const leer = () => setFav(readFavorites().includes(String(p.id)));
    leer();
    window.addEventListener(FAV_CHANGE_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(FAV_CHANGE_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, [p.id]);

  const onFav = (e) => {
    stop(e);
    setFav(toggleFavorite(String(p.id)));
  };

  // "Agregar al carrito" agrega de verdad, en vez de sólo abrir el detalle.
  const onAgregar = (e) => {
    stop(e);
    e.preventDefault();
    const precio = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
    const actual = readCart() ?? [];
    const existente = actual.find((it) => it.id === String(p.id));
    writeCart(
      existente
        ? actual.map((it) => (it.id === String(p.id) ? { ...it, qty: it.qty + 1 } : it))
        : [...actual, { id: String(p.id), name: p.name, brand: p.brand, price: precio, qty: 1, image: p.img }],
    );
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1600);
  };
  return (
    <div className="pcard" onClick={go} role="link" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") go(); }} style={{ cursor: "pointer" }}>
      <div className="pcard__img">
        <img src={p.img} alt={p.name} loading="lazy" />
        {p.badge && <span className={`pcard__badge badge badge--${p.badge}`}>{BADGE_LABEL[p.badge]}</span>}
        <div className="pcard__icons">
          <button type="button" className={`pcard__ib ${fav ? "fav" : ""}`} onClick={onFav} aria-pressed={fav} aria-label={`${fav ? "Quitar" : "Agregar"} ${p.name} ${fav ? "de" : "a"} favoritos`}>
            <Ic.heart s={16} fill={fav ? "currentColor" : "none"} />
          </button>
          <button type="button" className="pcard__ib" onClick={stop} aria-label="Compartir"><Ic.share s={15} /></button>
        </div>
      </div>
      <div className="pcard__body">
        <div className="pcard__opt">
          <small>Color</small>
          <div className="pcard__swatches">
            {SWATCHES.map((c, i) => (
              <span key={i} className={`pcard__sw ${i === 0 ? "on" : ""}`} style={{ background: c, border: c === "#ffffff" ? "1px solid var(--bS)" : "none" }} />
            ))}
          </div>
        </div>
        <div className="pcard__opt">
          <small>Capacidad</small>
          <div className="pcard__chips">
            {CAPS.map((c, i) => (
              <span key={c} className={`pcard__chip ${i === 0 ? "on" : ""} ${i === 3 ? "off" : ""}`}>{c}</span>
            ))}
          </div>
        </div>
        <div className="pcard__brand">{p.brand}</div>
        <div className="pcard__name">{p.name}</div>
        <div className={`pcard__price price ${p.offer ? "is-offer" : ""}`}>{p.price}</div>
        <div className="pcard__fin"><span className="cmf"><img src="/img/pay/cmf.png" alt="CMF" /></span> {p.fin}</div>
        <div className="pcard__rate"><Stars n={p.rating} s={14} /> <b>{p.rating}</b> <span className="tiny">({p.reviews})</span></div>
        <div className="pcard__cta">
          <button type="button" onClick={onAgregar} className="btn btn--cta btn--block">
            <Ic.cart s={18} /> {agregado ? "Agregado" : "Agregar al carrito"}
          </button>
        </div>
        <Link to={`/producto/${p.id}`} className="pcard__det">Ver detalles</Link>
      </div>
    </div>
  );
}

const MAX_PRECIO = 2000;

function PriceRange({ rango, setRango }) {
  const MAX = MAX_PRECIO, STEP = 10;
  const [min, max] = rango;
  const setMin = (v) => setRango([v, max]);
  const setMax = (v) => setRango([min, v]);
  const fmt = (n) => "$" + n.toLocaleString("en-US");
  const minPct = (min / MAX) * 100;
  const maxPct = (max / MAX) * 100;
  return (
    <div className="pricerange">
      <div className="pricerange__vals">
        <div className="pricerange__val"><small>Mínimo</small><b>{fmt(min)}</b></div>
        <div className="pricerange__val pricerange__val--max"><small>Máximo</small><b>{fmt(max)}</b></div>
      </div>
      <div className="pricerange__slider">
        <div className="pricerange__track" />
        <div className="pricerange__fill" style={{ left: minPct + "%", width: (maxPct - minPct) + "%" }} />
        <input type="range" min={0} max={MAX} step={STEP} value={min} aria-label="Precio mínimo"
          onChange={(e) => setMin(Math.min(Number(e.target.value), max - STEP))} />
        <input type="range" min={0} max={MAX} step={STEP} value={max} aria-label="Precio máximo"
          onChange={(e) => setMax(Math.max(Number(e.target.value), min + STEP))} />
      </div>
    </div>
  );
}

function FilterGroups({ sel, setSel, rango, setRango, resultados }) {
  const alternar = (key, valor) =>
    setSel((prev) => {
      const actuales = prev[key] || [];
      const next = actuales.includes(valor)
        ? actuales.filter((v) => v !== valor)
        : [...actuales, valor];
      return { ...prev, [key]: next };
    });

  return (
    <>
      <div className="fgroup">
        <b>Precio</b>
        <PriceRange rango={rango} setRango={setRango} />
      </div>
      {GRUPOS.map((g) => (
        <div className="fgroup" key={g.key}>
          <b>{g.title}</b>
          {g.opciones(products).map((opt) => {
            const on = (sel[g.key] || []).includes(opt);
            // El conteo sale de los productos reales, no de un número fijo.
            const n = contar(products, g, opt);
            return (
              <label className="frow" key={opt}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => alternar(g.key, opt)}
                  className="frow__cb"
                />
                <span className={`cbox ${on ? "on" : ""}`} aria-hidden="true">
                  {on && <Ic.check s={12} />}
                </span>
                <span className="lbl">{opt}</span>
                <span className="num">({n})</span>
              </label>
            );
          })}
        </div>
      ))}
      <p className="tiny" aria-live="polite" style={{ padding: "4px 2px" }}>
        {resultados} {resultados === 1 ? "producto" : "productos"}
      </p>
    </>
  );
}

export default function PLP() {
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState("grid");
  const [sel, setSel] = useState({});
  const [rango, setRango] = useState([0, MAX_PRECIO]);
  const [orden, setOrden] = useState(ORDENES[0]);

  const filtrados = ordenar(aplicar(products, sel, rango), orden);

  // Escape cierra el panel de filtros de mobile.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);
  const limpiar = () => {
    setSel({});
    setRango([0, MAX_PRECIO]);
  };

  // intercalar banners en la grilla
  const grid = [];
  filtrados.forEach((p, i) => {
    grid.push(<ProductCard key={p.id} p={p} />);
    if (i === 7) grid.push(
      <div className="fbanner fbanner--red gbanner" key="b1">
        <div className="fbanner__content">
          <span className="fbanner__tag">Liquidación</span>
          <h2>Hasta 45% en línea blanca</h2>
          <p className="fbanner__sub">Lavadoras y secadoras seleccionadas. Mientras dure el inventario.</p>
          <a href="#" className="fbanner__cta">Ver liquidación <Ic.chevR s={16} /></a>
        </div>
        <div className="fbanner__media"><img src={IMG[1]} alt="" /></div>
        <div className="fbanner__disc"><b>45%</b><small>dcto</small></div>
      </div>);
  });

  return (
    <>
      <Header />

      <div className="fbanner fbanner--blue">
        <div className="fbanner__content">
          <span className="fbanner__tag">Ofertas de temporada</span>
          <h2>Renueva tu lavandería con ofertas especiales</h2>
          <p className="fbanner__sub">Lavadoras, secadoras y centros de lavado de las mejores marcas.</p>
          <a href="#" className="fbanner__cta">Ver ofertas <Ic.chevR s={16} /></a>
        </div>
        <div className="fbanner__media"><img src={IMG[10]} alt="" /></div>
        <div className="fbanner__disc"><b>30%</b><small>dcto</small></div>
      </div>

      <div className="bc">
        <a href="#">Inicio</a><span className="sep">/</span>
        <a href="#">Electrodomésticos</a><span className="sep">/</span>
        <b>Lavadoras y Secadoras</b>
      </div>
      <div className="page-title">
        <h1>Lavadoras y Secadoras</h1>
        <div className="cnt">Mostrando {filtrados.length} de {products.length} productos</div>
      </div>

      <div className="subcats">
        {subcategories.map((s) => {
          const Icon = SUBCAT_ICONS[s] || WashingMachine;
          return (
            <a className="subcat" key={s} href="#">
              <span className="subcat__ic"><Icon size={42} strokeWidth={1.5} /></span>
              <b className="subcat__name">{s}</b>
              <span className="subcat__go"><Ic.arrowR s={20} /></span>
            </a>
          );
        })}
      </div>

      <div className="mfilters">
        <button className="btn btn--ghost" onClick={() => setDrawer(true)}><Ic.menu s={16} /> Filtrar</button>
        <select className="btn btn--ghost" style={{ fontWeight: 600 }} aria-label="Ordenar por"
          value={orden} onChange={(e) => setOrden(e.target.value)}>
          {ORDENES.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="plp-main">
        <aside className="sidebar">
          <div className="sb-h">
            <b><SlidersHorizontal size={18} /> Filtros</b>
            <button type="button" className="sb-clear" onClick={limpiar}>Limpiar <RotateCw size={15} /></button>
          </div>
          <FilterGroups sel={sel} setSel={setSel} rango={rango} setRango={setRango} resultados={filtrados.length} />
        </aside>

        <div className="results">
          <div className="results-bar">
            <div className="l"><b aria-live="polite">Mostrando {filtrados.length} de {products.length} productos</b><div className="tiny">Lavadoras y Secadoras</div></div>
            <label className="sortby">Ordenar por
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                {ORDENES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <div className="viewtoggle">
              <button type="button" className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Vista de cuadrícula"><LayoutGrid size={18} /></button>
              <button type="button" className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="Vista de lista"><List size={18} /></button>
            </div>
          </div>
          {filtrados.length === 0 ? (
            <div className="empty-results">
              <b>No encontramos productos con esos filtros</b>
              <p>Prueba quitando alguno o ampliando el rango de precio.</p>
              <button type="button" className="btn btn--cta" onClick={limpiar}>Limpiar filtros</button>
            </div>
          ) : (
            <div className={`grid ${view === "list" ? "grid--list" : ""}`}>{grid}</div>
          )}
          <div className="pagination">
            <span className="pg">‹</span>
            <span className="pg on">1</span><span className="pg">2</span><span className="pg">3</span>
            <span className="pg next">Siguiente <Ic.chevR s={16} /></span>
          </div>
        </div>
      </div>

      <div className="related">
        <b>Búsquedas relacionadas</b>
        <div className="chips">
          {["lavadora carga frontal", "secadora eléctrica", "lavadora inverter", "centro de lavado", "lavasecadora Samsung", "lavadora 19 kg"].map((c) =>
            <span className="chip" key={c}>{c}</span>)}
        </div>
      </div>

      <Footer />

      <div className={`drawer-backdrop ${drawer ? "show" : ""}`} onClick={() => setDrawer(false)} />
      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="dh">
            <b style={{ fontSize: 16 }}>Filtros</b>
            <button type="button" onClick={limpiar} className="sb-clear" style={{ marginLeft: "auto", marginRight: 12 }}>Limpiar</button>
            <button type="button" onClick={() => setDrawer(false)} aria-label="Cerrar filtros" style={{ fontSize: 22 }}>✕</button>
          </div>
          <FilterGroups sel={sel} setSel={setSel} rango={rango} setRango={setRango} resultados={filtrados.length} />
          <button className="btn btn--cta btn--block" style={{ marginTop: 12 }} onClick={() => setDrawer(false)}>
            Ver {filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}
          </button>
        </div>
      )}
    </>
  );
}
