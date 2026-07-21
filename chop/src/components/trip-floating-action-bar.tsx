import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TripFloatingActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60]">
      <div
        className={cn(
          "mx-auto flex w-full max-w-app justify-center px-4 pb-[calc(0.25rem+3.5rem+1rem+var(--safe-area-bottom))] [&>*]:pointer-events-auto",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FloatingActionButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "h-12 min-h-12 min-w-0 gap-2 rounded-full px-5 text-base font-medium shadow-[0_10px_40px_-8px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.12)] ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  );
}
