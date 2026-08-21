import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Component } from "react";
import PLP from "./pages/PLP";
import PDP from "./pages/PDP";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: "#111" }}>
          <h2 style={{ color: "#c00" }}>Se produjo un error al cargar la página</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8, fontSize: 13 }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "10px 18px", borderRadius: 6, background: "#0055b8", color: "#fff", border: 0, fontWeight: 700, cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/productos">
        <ScrollTop />
        <Routes>
          <Route path="/" element={<PLP />} />
          <Route path="/producto/:id" element={<PDP />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
