import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const routeParam = new URLSearchParams(window.location.search).get("route");

if (
  window.location.pathname === import.meta.env.BASE_URL &&
  routeParam?.startsWith("/") &&
  !routeParam.startsWith("//")
) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.history.replaceState(null, "", `${basePath}${routeParam}`);
}

createRoot(document.getElementById("root")!).render(<App />);
