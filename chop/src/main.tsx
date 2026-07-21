import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { getMostRecentTrip } from './lib/recent-trips'

const navigatorWithStandalone = navigator as Navigator & {
  standalone?: boolean;
};
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  navigatorWithStandalone.standalone === true;

document.documentElement.dataset.standalone = String(isStandalone);

const searchParams = new URLSearchParams(window.location.search);
const routeParam = searchParams.get("route");

if (
  window.location.pathname === import.meta.env.BASE_URL &&
  routeParam?.startsWith("/") &&
  !routeParam.startsWith("//")
) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.history.replaceState(null, "", `${basePath}${routeParam}`);
} else if (
  isStandalone &&
  window.location.pathname === import.meta.env.BASE_URL
) {
  const latestTrip = getMostRecentTrip();
  if (latestTrip) {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.history.replaceState(
      null,
      "",
      `${basePath}/bill/${latestTrip.id}`,
    );
  }
}

createRoot(document.getElementById("root")!).render(<App />);
