import { cn } from "@/lib/utils";

interface TripPageHeaderProps {
  tripName: string;
  title: string;
  compact: boolean;
}

export function TripPageHeader({
  tripName,
  title,
  compact,
}: TripPageHeaderProps) {
  return (
    <div className="trip-page-header" data-compact={compact || undefined}>
      <div className="trip-page-header-material" aria-hidden />
      <header
        className={cn(
          "relative z-10 mx-auto w-full max-w-app px-4",
          "transition-[padding] duration-200 ease-out",
          compact
            ? "pb-3 pt-[calc(0.75rem+var(--safe-area-top))]"
            : "pb-4 pt-[var(--safe-area-top)]",
        )}
      >
        <div
          className={cn(
            "grid transition-[grid-template-rows,margin,opacity,transform] duration-200 ease-out",
            compact
              ? "mb-0 -translate-y-1 grid-rows-[0fr] opacity-0"
              : "mb-1 translate-y-0 grid-rows-[1fr] opacity-100",
          )}
          aria-hidden={compact || undefined}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="truncate text-sm font-medium leading-5 text-muted-foreground">
              {tripName.trim() || "Trip"}
            </p>
          </div>
        </div>
        <h1
          key={title}
          className={cn(
            "trip-tab-enter min-w-0 truncate font-semibold tracking-tight text-foreground",
            "transition-[font-size,line-height] duration-200 ease-out",
            compact ? "text-xl leading-7" : "text-2xl leading-8",
          )}
        >
          {title}
        </h1>
      </header>
    </div>
  );
}
