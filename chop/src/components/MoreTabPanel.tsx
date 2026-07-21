import { IconCopy, IconEdit, IconSignOut } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { TRIP_ACCESS_GUIDANCE } from "@/lib/trip-access-guidance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const moreMenuListItemClass = cn(
  "h-auto min-h-14 w-full justify-start gap-3 rounded-none border-0 shadow-none",
  "bg-transparent px-0 py-5 text-left text-base font-normal",
  "transition-colors hover:bg-muted/50 active:bg-muted/60",
  "focus-visible:bg-muted/40"
);

interface MoreTabPanelProps {
  eventId: string;
  tripName: string;
  onEditTrip: () => void;
}

export default function MoreTabPanel({ eventId, tripName, onEditTrip }: MoreTabPanelProps) {
  const tripUrl = new URL(
    `bill/${eventId}`,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).toString();

  const copyTripUrl = () => {
    void navigator.clipboard.writeText(tripUrl);
    toast.success("Trip URL copied to clipboard!");
  };

  const copyAccessCode = () => {
    void navigator.clipboard.writeText(eventId);
    toast.success("Access code copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-card p-4 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm text-muted-foreground">Name of trip</p>
            <p className="mt-1.5 break-words text-lg font-semibold leading-snug text-foreground">
              {tripName.trim() ? tripName : "Trip"}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              type="button"
              variant="outline"
              className="gap-2 font-medium"
              onClick={onEditTrip}
            >
              <IconEdit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <section className="space-y-2" aria-labelledby="more-actions-heading">
        <h3
          id="more-actions-heading"
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Actions
        </h3>
        <ul className="m-0 flex w-full list-none flex-col divide-y divide-border p-0">
          <li>
            <Button
              type="button"
              variant="ghost"
              className={moreMenuListItemClass}
              onClick={copyTripUrl}
            >
              <IconCopy className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Copy trip URL</span>
            </Button>
          </li>
          <li>
            <Button
              type="button"
              variant="ghost"
              className={cn(moreMenuListItemClass, "justify-between gap-4")}
              onClick={copyAccessCode}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <IconCopy className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-foreground">Copy access code</span>
              </span>
              <span
                className="max-w-[min(12rem,45%)] shrink-0 truncate text-right text-base font-normal italic tabular-nums tracking-wide text-muted-foreground"
                title={eventId}
              >
                {eventId}
              </span>
            </Button>
          </li>
          <li>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                moreMenuListItemClass,
                "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100/80 active:text-red-800"
              )}
              onClick={() => {
                window.location.href = import.meta.env.BASE_URL;
              }}
            >
              <IconSignOut className="h-5 w-5 shrink-0" />
              <span>Exit trip</span>
            </Button>
          </li>
        </ul>
      </section>

      <section className="space-y-2" aria-labelledby="more-good-to-know-heading">
        <h3
          id="more-good-to-know-heading"
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Good to know
        </h3>
        <ul className="m-0 flex w-full list-none flex-col divide-y divide-border p-0">
          {["Bookmark your trip link.", ...TRIP_ACCESS_GUIDANCE].map(
            (message) => (
              <li
                key={message}
                className="flex items-start gap-3 py-2 text-base font-normal leading-relaxed text-foreground"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 stroke-[2.5] text-primary"
                  aria-hidden
                />
                <span>{message}</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
