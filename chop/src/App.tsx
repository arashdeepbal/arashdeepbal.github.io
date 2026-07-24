import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeModeProvider } from "@/components/theme-mode-provider";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));

function BillEditRedirectToTrip() {
  const { eventId } = useParams<{ eventId: string }>();
  return <Navigate to={eventId ? `/bill/${eventId}` : "/"} replace />;
}

function RouteScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

const App = () => (
  <ThemeModeProvider>
    <TooltipProvider>
    <Sonner
      className="!w-full !max-w-app"
      position="bottom-center"
    />
    <BrowserRouter
      basename={import.meta.env.BASE_URL}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RouteScrollReset />
      <Suspense
        fallback={
          <main className="mx-auto flex min-h-dvh w-full max-w-app items-center justify-center px-4 text-sm text-muted-foreground">
            Loading…
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/bill/:eventId/edit" element={<BillEditRedirectToTrip />} />
          <Route path="/bill/:eventId" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </TooltipProvider>
  </ThemeModeProvider>
);

export default App;
