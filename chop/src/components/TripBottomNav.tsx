import { cn } from "@/lib/utils";
import {
  NavIconDocument,
  NavIconHome,
  NavIconMenu,
  NavIconTime,
  NavIconUsers,
} from "@/components/icons/trip-nav-icons";

export type TripNavSection = "bill" | "summary" | "participants" | "history" | "more";

const ITEMS: {
  id: TripNavSection;
  label: string;
  Icon: typeof NavIconHome;
}[] = [
  { id: "bill", label: "Bill", Icon: NavIconHome },
  { id: "summary", label: "Summary", Icon: NavIconDocument },
  { id: "participants", label: "Participants", Icon: NavIconUsers },
  { id: "history", label: "History", Icon: NavIconTime },
  { id: "more", label: "More", Icon: NavIconMenu },
];

interface TripBottomNavProps {
  active: TripNavSection;
  onChange: (section: TripNavSection) => void;
}

export default function TripBottomNav({ active, onChange }: TripBottomNavProps) {
  const activeIndex = Math.max(
    ITEMS.findIndex((item) => item.id === active),
    0,
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-[var(--safe-area-bottom)] shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.08)]"
      aria-label="Primary"
    >
      <div className="relative mx-auto flex max-w-app">
        <span
          className="trip-nav-indicator pointer-events-none absolute left-0 top-0 h-0.5 w-1/5 bg-primary"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
          aria-hidden
        />
        {ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-t-2 border-transparent px-1 py-1.5 transition-[color,background-color,transform] duration-200 ease-in-out motion-safe:active:scale-[0.97]",
                isActive
                  ? "bg-card text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex transition-transform duration-200 ease-out",
                  isActive && "motion-safe:-translate-y-0.5 motion-safe:scale-105",
                )}
              >
                <Icon />
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[11px] leading-tight",
                  isActive ? "font-semibold text-primary" : "font-medium"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
