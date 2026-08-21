import { useState, useEffect, Fragment } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Ic, Stars } from "../Icons";
import { pdp, TABS, IMG, products } from "../data";
import { FAV_CHANGE_EVENT, readFavorites, toggleFavorite } from "../lib/favorites";
import { readCart, writeCart } from "../lib/cart";
import { AccArt } from "../components/AccArt";
import { PackageCheck, Smartphone, Wrench } from "lucide-react";

function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`infotip ${open ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="infotip__btn"
        aria-label="Más información"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onBlur={() => setOpen(false)}
      >
        <Ic.info s={15} />
      </button>
      <span className="infotip__bubble" role="tooltip">{text}</span>
    </span>
  );
}

function OpinionesTab() {
  const [reviews, setReviews] = useState(pdp.opiniones);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const close = () => { setOpen(false); setRating(0); setHover(0); setName(""); setTitle(""); setText(""); };
  const submit = (e) => {
    e.preventDefault();
    if (!rating || !name.trim() || !text.trim()) return;
    const body = (title.trim() ? title.trim() + ". " : "") + text.trim();
    setReviews([[name.trim(), "Hoy", rating, body], ...reviews]);
    close();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="tabcontent">
      <h3>Opiniones</h3>
      <div className="opsum">
        <div className="big"><div className="n">{pdp.rating}</div><Stars n={pdp.rating} s={18} /><div className="tiny">{reviews.length} opiniones</div></div>
        <div className="dist">
          {pdp.dist.map(([st, pct]) => (
            <div className="d" key={st}><span>{st}★</span><span className="track"><i style={{ width: pct + "%" }} /></span><span className="tiny">{pct}%</span></div>
          ))}
        </div>
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        {reviews.map(([nm, dt, st, txt], i) => (
          <div className="review" key={nm + i}><div className="top"><span className="av">{nm[0]}</span>
            <div className="nm"><b>{nm}</b><small>{dt}</small></div><Stars n={st} s={13} /></div><div className="muted">{txt}</div></div>
        ))}
      </div>
      <button className="btn btn--ghost" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>Escribir opinión</button>

      {sent && (
        <div className="op-toast" role="status">
          <Ic.check s={16} /> ¡Gracias! Tu opinión se envió correctamente.
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head"><b>Escribir una opinión</b><button type="button" onClick={close} aria-label="Cerrar">✕</button></div>
            <form className="opform" onSubmit={submit}>
              <label>Tu calificación</label>
              <div className="starpick" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={n <= (hover || rating) ? "on" : ""} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} estrellas`}>★</button>
                ))}
              </div>
              <input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea placeholder="Contanos tu experiencia con el producto…" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
              <button type="submit" className="btn btn--cta btn--block" disabled={!rating || !name.trim() || !text.trim()}>Publicar opinión</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabContent({ tab }) {
  switch (tab) {
    case 0: // Especificaciones
      return (
        <div className="tabcontent"><h3>Especificaciones</h3>
          <div className="spectable">
            {pdp.specs.map(([k, v]) => <div className="r" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>)}
          </div>
        </div>);
    case 1: // Beneficios
      return (
        <div className="tabcontent"><h3>Beneficios</h3>
          <div className="cardgrid">
            {pdp.beneficios.map((b) => (
              <div className="fcard" key={b}><div className="ic"><Ic.bolt /></div><b>{b}</b><small>Tecnología pensada para tu lavandería.</small></div>
            ))}
          </div>
        </div>);
    case 2: // Garantía y devolución
      return (
        <div className="tabcontent"><h3>Garantía y devolución</h3>
          <div className="benlist">
            {pdp.garantia.map(([t, d]) => (
              <div className="b" key={t}><span className="ic"><Ic.shield /></span><div><b>{t}</b><div className="muted">{d}</div></div></div>
            ))}
          </div>
          <button className="btn btn--ghost" style={{ marginTop: 16 }}>Ver política completa</button>
        </div>);
    case 3: // Instalación y servicios
      return (
        <div className="tabcontent"><h3>Instalación y servicios</h3>
          <div className="cardgrid s2">
            {pdp.servicios.map(([t, d, pr]) => (
              <div className="fcard" key={t}>
                <div style={{ display: "flex", gap: 12 }}><div className="ic"><Ic.wrench /></div><div><b>{t}</b><small>{d}</small></div></div>
                <div className="foot"><b className="price">{pr}</b><button className="btn btn--ghost" style={{ padding: "8px 14px", fontSize: 12 }}>Agregar servicio</button></div>
              </div>
            ))}
          </div>
        </div>);
    case 4: // Accesorios compatibles
      return (
        <div className="tabcontent"><h3>Accesorios compatibles</h3>
          <div className="acc-row">
            {pdp.accesorios.map(([img, nm, pr]) => (
              <div className="acc" key={nm}><img src={img} alt={nm} loading="lazy" /><div className="b"><div className="nm">{nm}</div>
                <div className="pf"><b className="price">{pr}</b><button className="btn btn--cta">Agregar</button></div></div></div>
            ))}
          </div>
        </div>);
    case 5: // Opiniones
      return <OpinionesTab />;
    default: return null;
  }
}

export default function PDP() {
  const { id } = useParams();
  const location = useLocation();

  // Producto externo (viene de una card de la home del dominio unificado):
  // la card pasa nombre/marca/precio/imagen por query y el PDP los muestra.
  const q = new URLSearchParams(location.search);
  const ext = q.get("nombre")
    ? {
        name: q.get("nombre"),
        brand: q.get("marca") || "",
        price: q.get("precio") || "",
        oldPrice: q.get("oldprecio") || "",
        img: q.get("img") || "",
      }
    : null;

  // Integración de flujo: el carrito inicia el checkout. Bajo el dominio unificado
  // (prototiponovey) el checkout vive en /checkout; en el dominio propio de este
  // prototipo se abre el deploy original del checkout.
  const parseMoney = (v) => parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
  // Agrega al carrito SUMANDO (antes reemplazaba todo el carrito por este
  // producto) y lleva al carrito, no directo al pago, para que se vea qué quedó.
  const goCheckout = (qtyToSend = 1) => {
    const image = ext?.img || gallery[0];
    const clave = String(id ?? "ext");
    const nuevo = {
      id: clave,
      name: view.name,
      brand: view.brand,
      sku: ext ? "NV-HOME" : `NV-${id}`,
      price: parseMoney(view.price),
      oldPrice: ext?.oldPrice ? parseMoney(ext.oldPrice) : undefined,
      qty: qtyToSend,
      image,
    };
    const actual = readCart() ?? [];
    const existente = actual.find((it) => it.id === clave);
    writeCart(
      existente
        ? actual.map((it) => (it.id === clave ? { ...it, qty: it.qty + qtyToSend } : it))
        : [...actual, nuevo],
    );
    const base = window.location.hostname.startsWith("novey-plp")
      ? "https://prototiponovey.vercel.app/carrito"
      : "/carrito";
    window.location.assign(base);
  };
  const prod = products.find((p) => String(p.id) === String(id));
  const view = {
    brand: ext?.brand || (prod?.brand ?? pdp.brand),
    name: ext?.name || (prod?.name ?? pdp.name),
    price: ext?.price || (prod?.price ?? pdp.price),
    rating: prod?.rating ?? pdp.rating,
    reviews: prod?.reviews ?? pdp.reviews,
    fin: prod?.fin ?? pdp.fin,
    offer: ext ? Boolean(ext.oldPrice) : (prod?.offer ?? false),
  };
  const gallery = ext?.img ? [ext.img] : pdp.gallery;
  const [tab, setTab] = useState(0);
  const [acc, setAcc] = useState(0);
  const [gi, setGi] = useState(0);
  const [color, setColor] = useState(0);
  const [services, setServices] = useState(pdp.services.map((s) => s.on));
  const [deliv, setDeliv] = useState(0);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  // El corazón arranca del estado real y se sincroniza con el resto del sitio.
  useEffect(() => {
    const clave = String(id ?? "ext");
    const leer = () => setFav(readFavorites().includes(clave));
    leer();
    window.addEventListener(FAV_CHANGE_EVENT, leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener(FAV_CHANGE_EVENT, leer);
      window.removeEventListener("storage", leer);
    };
  }, [id]);
  const [showStock, setShowStock] = useState(false);
  const [pickupStore, setPickupStore] = useState("Novey Coronado");
  const [storeToast, setStoreToast] = useState("");
  const elegirTienda = (n) => {
    setPickupStore(n);
    setDeliv(0);
    setShowStock(false);
    setStoreToast(n);
    setTimeout(() => setStoreToast(""), 4000);
  };
  const [showBar, setShowBar] = useState(false);
  const [bundleSel, setBundleSel] = useState([true, true, true, true]);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 460);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="has-sticky">
      <Header />

      <div className="bc">
        {ext ? (
          <>
            <a href="/">Inicio</a><span className="sep">/</span><Link to="/">Productos</Link><span className="sep">/</span><b>{view.name}</b>
          </>
        ) : (
          <>
            <a href="#">Inicio</a><span className="sep">/</span><a href="#">Electrodomésticos</a><span className="sep">/</span>
            <a href="#">Lavadoras y Secadoras</a><span className="sep">/</span><b>Lavadoras carga frontal</b>
          </>
        )}
        <Link to="/" className="back"><Ic.chevL s={16} /> Volver a resultados</Link>
      </div>

      <div className="pdp-head">
        <div className="l">
          <div className="brand">{view.brand}</div>
          <h1>{view.name}</h1>
          <div className="sku">{pdp.sku}</div>
          <div className="rate"><Stars n={view.rating} s={18} /> <b>{view.rating}</b> · <a href="#" onClick={(e) => { e.preventDefault(); setTab(5); }}>{view.reviews} reseñas</a></div>
        </div>
      </div>

      <div className="pdp-main">
        <div className="pdp-left">
          <div className="gallery">
            <div className="thumbs">
              {gallery.map((g, i) => (
                <button key={i} className={i === gi ? "on" : ""} onClick={() => setGi(i)}><img src={g} alt="" /></button>
              ))}
            </div>
            <div className="main">
              <img src={gallery[gi]} alt={view.name} />
              <div className="gicons">
                <button type="button" className={`gib ${fav ? "fav" : ""}`} onClick={() => setFav(toggleFavorite(String(id ?? "ext")))} aria-pressed={fav} aria-label={`${fav ? "Quitar de" : "Agregar a"} favoritos`}><Ic.heart s={18} fill={fav ? "currentColor" : "none"} /></button>
                <button type="button" className="gib" aria-label="Compartir"><Ic.share s={16} /></button>
              </div>
              <button className="arrow l" onClick={() => setGi((gi - 1 + gallery.length) % gallery.length)}><Ic.chevL /></button>
              <button className="arrow r" onClick={() => setGi((gi + 1) % gallery.length)}><Ic.chevR /></button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Descripción</h3>
            <p className="muted">Renová tu lavandería con la Lavadora LG Carga Frontal 4.5 cu ft Inverter en acabado Black Steel. Su tecnología Inverter Direct Drive y TurboWash 360 lavan más ropa en menos tiempo, mientras el ciclo de vapor cuida las prendas delicadas. Controlala desde tu celular con Wi-Fi y ahorrá agua y energía en cada lavado.</p>
          </div>

          <div>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Lo más destacado</h3>
            <div className="cardgrid s2">
              {[["TurboWash 360", "Lava hasta 30% más rápido."], ["Motor inverter", "Más silencioso y durable."], ["ThinQ Wi-Fi", "Controlalo desde la app."], ["Alta eficiencia", "Ahorra agua y energía."]].map(([t, d]) => (
                <div className="fcard" key={t}><div style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="ic"><Ic.bolt /></div><div><b>{t}</b><small>{d}</small></div></div></div>
              ))}
            </div>
          </div>

          <div className="atglance" style={{ margin: 0 }}>
            {["Garantía 1 año", "Envío a domicilio", "Instalación disponible", "Devolución 30 días"].map((t) => (
              <div className="it" key={t}><span className="ic"><Ic.shield /></span><b style={{ fontSize: 13 }}>{t}</b></div>
            ))}
          </div>
        </div>

        <div className="buy">
          <div className="badges"><span className="badge badge--red">Oferta online</span><span className="badge badge--best">Más vendido</span></div>
          <div>
            <div className={`pr price ${view.offer ? "is-offer" : ""}`}>{view.price}</div>
          </div>
          <div>
            <b style={{ fontSize: 13 }}>Opciones de pago y financiamiento</b>
            <div className="pay-panel">
              <div className="pay-cmf">
                <img src="/img/pay/cmf.svg" alt="CMF" />
                <div className="txt">
                  36 cuotas de <b>${(parseFloat(view.price.replace(/[^0-9.]/g, "")) / 36).toFixed(2)}</b> c/u. Si no la tienes, <a href="#" onClick={(e) => e.preventDefault()}>solicítala aquí</a>
                </div>
              </div>
              <div className="pay-note"><Ic.info s={14} /> * Cuota referencial</div>
            </div>
          </div>

          {ext ? null : (
          <div className="colors">
            <div><span className="muted" style={{ fontWeight: 600 }}>Color: </span><b>{pdp.colors[color].name}</b></div>
            <div className="cset">
              {pdp.colors.map((c, i) => (
                <div key={i} className={`cv ${i === color ? "on" : ""}`} onClick={() => setColor(i)}>
                  <div className="sw"><img src={c.img} alt="" /></div><small className={`price ${view.offer ? "is-offer" : ""}`}>{view.price}</small>
                </div>
              ))}
            </div>
          </div>
          )}

          <div>
            <b style={{ fontSize: 13 }}>Servicios opcionales</b>
            <div className="stack" style={{ marginTop: 8 }}>
              {pdp.services.map((s, i) => (
                <div key={s.name} className={`svc ${services[i] ? "on" : ""}`} onClick={() => setServices(services.map((v, j) => j === i ? !v : v))}>
                  <span className={`cbox ${services[i] ? "on" : ""}`}>{services[i] && <Ic.check s={12} />}</span>
                  <div className="t">
                    <span className="svc-name"><b>{s.name}</b>{s.info && <InfoTip text={s.info} />}</span>
                    <small>{s.free ? "Sin cargo · lo sumamos a tu compra" : "Agregá este servicio a tu compra"}</small>
                  </div>
                  <b className={`price ${s.free ? "free" : ""}`}>{s.price}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="cta-row">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><b>{qty}</b><button onClick={() => setQty(qty + 1)}>+</button></div>
            <button className="btn btn--cta" onClick={() => goCheckout(qty)}><Ic.cart s={20} /> Agregar al carrito</button>
          </div>

          <div>
            <b style={{ fontSize: 13 }}>Opciones de entrega</b>
            <div className="stack" style={{ marginTop: 8 }}>
              <div className={`dcard ${deliv === 0 ? "on" : ""}`} onClick={() => setDeliv(0)}>
                <span className="ic"><Ic.store s={18} /></span>
                <div className="t"><div className="top"><b>Retiro en tienda</b><b className="price" style={{ color: "var(--green-d)" }}>Gratis</b></div>
                  <div className="muted" style={{ fontSize: 12 }}>{pickupStore} · Listo hoy</div><div className="ok" style={{ fontSize: 12, color: "var(--green-d)", fontWeight: 600 }}>Disponible para retiro hoy</div></div>
              </div>
              <div className={`dcard ${deliv === 1 ? "on" : ""}`} onClick={() => setDeliv(1)}>
                <span className="ic"><Ic.truck s={18} /></span>
                <div className="t"><div className="top"><b>Entrega a domicilio</b><b className="price">$12</b></div>
                  <div className="muted" style={{ fontSize: 12 }}>Llega el mié 3 de jul · Ciudad de Panamá</div></div>
              </div>
            </div>

            <button className={`stock-link ${showStock ? "open" : ""}`} onClick={() => setShowStock(!showStock)}>
              <Ic.store s={16} /> <span>Verifica inventario en otra sucursal</span> <Ic.chevD s={16} />
            </button>
            {showStock && (
              <div className="stock-list">
                {[["Novey Los Ángeles", "Disponible · 8 unidades", "in"], ["Novey Costa del Este", "Disponible · 3 unidades", "in"], ["Novey David", "Bajo stock · 1 unidad", "low"], ["Novey Coronado", "Agotado", "out"]].map(([n, st, state]) => (
                  <div className={`stock-row ${pickupStore === n ? "chosen" : ""}`} key={n}>
                    <span className="ic"><Ic.pin s={16} /></span>
                    <div className="t"><b>{n}</b><small className={`st st--${state}`}>{st}</small></div>
                    {state !== "out" && (
                      pickupStore === n
                        ? <span className="mini mini--on"><Ic.check s={13} /> Elegida</span>
                        : <button className="mini" onClick={() => elegirTienda(n)}>Elegir</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* sticky bar desktop (visual) */}
      <div className={`stickybar ${showBar ? "show" : ""}`}>
        <div className="thumb"><img src={gallery[0]} alt="" /></div>
        <div className="info"><b>{view.name}</b><small><Stars n={view.rating} s={12} /> {view.rating} · {view.reviews} reseñas</small></div>
        <div className={`pr price ${view.offer ? "is-offer" : ""}`}>{view.price}</div>
        <button className="btn btn--cta" onClick={() => goCheckout(qty)}><Ic.cart s={18} /> Agregar al carrito</button>
      </div>

      {/* Desktop: tabs */}
      <div className="pdp-tabs">
        <div className="tabs">
          {TABS.map((t, i) => <button key={t} className={i === tab ? "on" : ""} onClick={() => setTab(i)}>{t}</button>)}
        </div>
        <TabContent tab={tab} />
      </div>

      {/* Mobile: acordeón desplegable */}
      <div className="pdp-acc">
        {TABS.map((t, i) => (
          <div className={`acc-item ${i === acc ? "open" : ""}`} key={t}>
            <button className="acc-head" onClick={() => setAcc(i === acc ? -1 : i)}>
              <span>{t}</span><Ic.chevD s={20} />
            </button>
            {i === acc && <div className="acc-body"><TabContent tab={i} /></div>}
          </div>
        ))}
      </div>

      {(() => {
        const BUNDLE = [[IMG[10], "Lavadora LG 4.5 cu ft", 878], [IMG[2], "Secadora LG 7.4 cu ft", 799], [IMG[4], "Base pedestal LG", 249], [IMG[12], "Kit de mangueras", 378]];
        const count = bundleSel.filter(Boolean).length;
        const total = BUNDLE.reduce((s, it, i) => s + (bundleSel[i] ? it[2] : 0), 0);
        const fmt = (n) => "$" + n.toLocaleString("en-US");
        const toggle = (i) => setBundleSel(bundleSel.map((v, j) => (j === i ? !v : v)));
        return (
          <div className="bundle">
            <h3>Mejor en conjunto</h3>
            <div className="row">
              {BUNDLE.map(([img, nm, price], i, a) => {
                const on = bundleSel[i];
                const label = i === 0 ? "Producto actual" : on ? "Seleccionado" : "No seleccionado";
                return (
                  <Fragment key={nm}>
                    <div className={`item ${i === 0 ? "cur" : ""} ${on ? "" : "off"}`}>
                      <button type="button" className="pick" onClick={() => toggle(i)}>
                        <span className={`cbox ${on ? "on" : ""}`}>{on && <Ic.check s={12} />}</span>
                        <small style={{ fontWeight: 700, color: i === 0 ? "var(--blue)" : "var(--tT)" }}>{label}</small>
                      </button>
                      <img src={img} alt={nm} /><div style={{ fontWeight: 600, fontSize: 13 }}>{nm}</div><div className="price" style={{ fontWeight: 700 }}>{fmt(price)}</div>
                    </div>
                    {i < a.length - 1 && <span className="plus">+</span>}
                  </Fragment>
                );
              })}
            </div>
            <div className="foot">
              <div className="sub"><small className="muted">Subtotal de {count} producto{count === 1 ? "" : "s"}</small><div className="n price">{fmt(total)}</div></div>
              <button className="btn btn--cta" disabled={count === 0}>Agregar {count} producto{count === 1 ? "" : "s"} al carrito</button>
            </div>
          </div>
        );
      })()}

      <div className="simlist">
        <h3>Productos que se usan con esta lavadora</h3>
        <div className="row">
          {[["suavizante", "Downy", "Suavizante Fresh + Calm Lavanda 39 usos", 5, "$9", "/img/acc/suavizante.png"], ["pods", "Tide", "Cápsulas PODS 3 en 1 Spring Meadow 76 u.", 5, "$32", "/img/acc/pods.png"], ["atrapapelusas", "Preplabs", "Atrapapelusas reutilizable de malla 6 pzas", 4, "$9", "/img/acc/atrapapelusas.png"], ["oxiclean", "OxiClean", "White Revive blanqueador y quitamanchas 3 pack", 5, "$27", "/img/acc/oxiclean.png"], ["ariel", "Ariel", "Detergente en polvo con toque Downy 52 oz · 33 cargas", 5, "$11", "/img/acc/ariel.png"]].map(([art, br, nm, rt, pr, img]) => (
            <div className="simcard" key={nm}><div className="simcard__art">{img ? <img src={img} alt={nm} loading="lazy" /> : AccArt[art]}</div>
              <div className="b"><div className="tiny" style={{ fontWeight: 700 }}>{br}</div><div className="nm">{nm}</div><Stars n={rt} s={12} /><div className="pf"><div className="price" style={{ fontWeight: 700, fontSize: 16 }}>{pr}</div><button className="btn btn--ghost" style={{ padding: "7px 12px", fontSize: 12 }}>Agregar</button></div></div></div>
          ))}
        </div>
      </div>

      <div className="pdp-benefits">
        <div className="pbenefit pbenefit--teal">
          <span className="pbenefit__ic"><PackageCheck size={38} strokeWidth={1.5} /></span>
          <p>¡Entrega gratis en compras mayores a $50! Aplica automáticamente al completar tu compra.</p>
        </div>
        <div className="pbenefit pbenefit--green">
          <span className="pbenefit__ic"><Smartphone size={38} strokeWidth={1.5} /></span>
          <div className="pbenefit__body">
            <p>Crédito más fácil con CMF, compra y paga hasta 36 cuotas.</p>
            <span className="pbenefit__cmf"><img src="/img/pay/cmf.png" alt="CMF" /></span>
          </div>
        </div>
        <div className="pbenefit pbenefit--green">
          <span className="pbenefit__ic"><Wrench size={38} strokeWidth={1.5} /></span>
          <div className="pbenefit__body">
            <img className="pbenefit__mipro" src="/img/brand/mipro.png" alt="MiPro" />
            <p>Asistencia técnica especializada a domicilio.</p>
          </div>
        </div>
      </div>

      <Footer />

      {/* sticky mobile bar */}
      <div className="msticky">
        <div className={`pr price ${view.offer ? "is-offer" : ""}`}>{view.price}<small>{view.fin}</small></div>
        <button className="btn btn--cta" onClick={() => goCheckout(qty)}><Ic.cart s={18} /> Agregar al carrito</button>
      </div>

      {storeToast && (
        <div className="op-toast" role="status">
          <Ic.check s={16} /> Retiro configurado en {storeToast}
        </div>
      )}
    </div>
  );
}
