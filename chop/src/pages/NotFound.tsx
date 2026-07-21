import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="app-page flex flex-col items-center justify-center text-center">
        <div className="max-w-sm space-y-4">
          <img
            src={`${import.meta.env.BASE_URL}404-page.png`}
            alt=""
            width={220}
            height={175}
            className="mx-auto block h-auto w-[220px] max-w-full object-contain"
            decoding="async"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you’re looking for doesn’t exist or may have moved.
          </p>
          <Button type="button" asChild>
            <Link to="/">Go to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
