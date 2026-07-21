import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const navigatorWithStandalone = navigator as Navigator & {
  standalone?: boolean;
};
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  navigatorWithStandalone.standalone === true;

document.documentElement.dataset.standalone = String(isStandalone);

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
