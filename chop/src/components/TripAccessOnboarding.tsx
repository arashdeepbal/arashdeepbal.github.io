import { IconCopy } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { TRIP_ACCESS_GUIDANCE } from "@/lib/trip-access-guidance";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface TripAccessOnboardingProps {
  eventId: string;
  onContinue: () => void;
}

export function TripAccessOnboarding({
  eventId,
  onContinue,
}: TripAccessOnboardingProps) {
  const tripUrl = new URL(
    `bill/${eventId}`,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).toString();

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Couldn’t copy. Please copy it manually.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <header className="space-y-3 text-center">
        <img
          src={`${import.meta.env.BASE_URL}trip-link-onboarding.webp`}
          alt="A bookmark marking a private web link."
          width={180}
          height={180}
          className="empty-state-illustration mx-auto block"
          decoding="async"
        />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bookmark your trip link
        </h1>
      </header>

      <ul
        className="mx-auto max-w-md space-y-2 text-center"
        aria-label="How to keep and share your trip"
      >
        {TRIP_ACCESS_GUIDANCE.map((message) => (
          <li key={message} className="text-sm leading-relaxed">
            <span className="inline-flex max-w-full items-start justify-center gap-2">
              <Check
                className="mt-0.5 size-4 shrink-0 stroke-[2.5] text-primary"
                aria-hidden
              />
              <span className="text-center text-foreground">{message}</span>
            </span>
          </li>
        ))}
      </ul>

      <section
        className="space-y-3"
        aria-label="Trip access details"
      >
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">Trip link</p>
            <a
              href={tripUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm leading-relaxed text-primary underline-offset-2 hover:underline"
            >
              {tripUrl}
            </a>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2"
            onClick={() => void copyToClipboard(tripUrl, "Trip link copied")}
          >
            <IconCopy className="h-5 w-5" />
            Copy URL
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Trip number</p>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-wide text-foreground">
              {eventId}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2"
            onClick={() =>
              void copyToClipboard(eventId, "Trip number copied")
            }
          >
            <IconCopy className="h-5 w-5" />
            Copy number
          </Button>
        </div>
      </section>

      <div className="pt-4">
        <Button
          type="button"
          className="h-12 min-h-12 w-full text-base font-medium"
          onClick={onContinue}
        >
          Start adding bills
        </Button>
      </div>
    </div>
  );
}
