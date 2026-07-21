import { IconCopy, IconEdit, IconSignOut } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { TRIP_ACCESS_GUIDANCE } from "@/lib/trip-access-guidance";
import { toast } from "@/lib/app-toast";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { copyText, shareTrip } from "@/lib/share-trip";
import { FeedbackIcon } from "@/components/FeedbackIcon";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";

const moreMenuListItemClass = cn(
  "-mx-3 h-auto min-h-14 w-[calc(100%+1.5rem)] justify-start gap-3 rounded-lg border-0 shadow-none",
  "bg-transparent px-3 py-5 text-left text-base font-normal",
  "transition-colors hover:bg-muted/50 active:bg-muted/60",
  "focus-visible:bg-muted/40"
);

interface MoreTabPanelProps {
  eventId: string;
  tripName: string;
  onEditTrip: () => void;
  onExitTrip: () => void;
}

export default function MoreTabPanel({
  eventId,
  tripName,
  onEditTrip,
  onExitTrip,
}: MoreTabPanelProps) {
  const copyFeedback = useTransientFeedback();
  const shareFeedback = useTransientFeedback();
  const tripUrl = new URL(
    `bill/${eventId}`,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).toString();

  const copyAccessCode = async () => {
    try {
      await copyText(eventId);
      copyFeedback.trigger();
      toast.success("Access code copied", { id: "more-copy-access-code" });
    } catch {
      toast.error("Couldn’t copy the access code", { id: "more-copy-access-code" });
    }
  };

  const handleShareTrip = async () => {
    try {
      const result = await shareTrip({ tripName, tripUrl });
      if (result !== "cancelled") shareFeedback.trigger();
      if (result === "copied") {
        toast.success("Sharing isn’t available, so the trip URL was copied", {
          id: "more-share-trip",
        });
      }
    } catch {
      toast.error("Couldn’t share this trip", { id: "more-share-trip" });
    }
  };

  return (
    <div className="space-y-8">
      <Card variant="elevated" className="p-4">
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
      </Card>

      <section className="space-y-2" aria-labelledby="more-actions-heading">
        <SectionHeading id="more-actions-heading">
          Actions
        </SectionHeading>
        <ul className="m-0 flex w-full list-none flex-col divide-y divide-border p-0">
          <li>
            <Button
              type="button"
              variant="ghost"
              className={moreMenuListItemClass}
              onClick={() => void handleShareTrip()}
            >
              <FeedbackIcon active={shareFeedback.active}>
                <img
                  src={`${import.meta.env.BASE_URL}share.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </FeedbackIcon>
              <span className="text-foreground">Share trip</span>
            </Button>
          </li>
          <li>
            <Button
              type="button"
              variant="ghost"
              className={cn(moreMenuListItemClass, "justify-between gap-4")}
              onClick={() => void copyAccessCode()}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <FeedbackIcon active={copyFeedback.active}>
                  <IconCopy className="h-5 w-5 text-foreground" />
                </FeedbackIcon>
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
                "text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 active:text-destructive",
              )}
              onClick={onExitTrip}
            >
              <IconSignOut className="h-5 w-5 shrink-0" aria-hidden />
              <span>Exit trip</span>
            </Button>
          </li>
        </ul>
      </section>

      <section className="space-y-2" aria-labelledby="more-good-to-know-heading">
        <SectionHeading id="more-good-to-know-heading">
          Access and sharing
        </SectionHeading>
        <ul className="m-0 flex w-full list-none flex-col divide-y divide-border p-0">
          {TRIP_ACCESS_GUIDANCE.map(
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
