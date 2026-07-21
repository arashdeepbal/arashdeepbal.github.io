import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IllustratedState } from "@/components/IllustratedState";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-card">
      <main className="app-page flex flex-col items-center justify-center text-center">
        <IllustratedState
          className="max-w-sm gap-4"
          illustration={
            <img
              src={`${import.meta.env.BASE_URL}404-page.png`}
              alt=""
              width={220}
              height={175}
              className="h-auto w-[220px] max-w-full object-contain"
              decoding="async"
            />
          }
          title="Page not found"
          titleAs="h1"
          description="The page you’re looking for doesn’t exist or may have moved."
          actions={
            <Button type="button" asChild>
              <Link to="/">Go to home</Link>
            </Button>
          }
        />
      </main>
    </div>
  );
};

export default NotFound;
