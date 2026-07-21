import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-app text-center">
        <header className="mb-6 border-b border-border pb-6">
          <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Oops! Page not found.</p>
        </header>
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          Return to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
