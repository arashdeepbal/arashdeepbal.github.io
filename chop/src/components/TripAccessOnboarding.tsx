import { IconCopy } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TRIP_ACCESS_GUIDANCE } from "@/lib/trip-access-guidance";
import { Check, Share2 } from "lucide-react";
import { toast } from "@/lib/app-toast";
import { copyText, shareTrip } from "@/lib/share-trip";
import { FeedbackIcon } from "@/components/FeedbackIcon";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import { IllustratedState } from "@/components/IllustratedState";
import { ThemeImage } from "@/components/theme-image";

interface TripAccessOnboardingProps {
  eventId: string;
  tripName: string;
  onContinue: () => void;
}

export function TripAccessOnboarding({
  eventId,
  tripName,
  onContinue,
}: TripAccessOnboardingProps) {
  const shareFeedback = useTransientFeedback();
  const linkCopyFeedback = useTransientFeedback();
  const numberCopyFeedback = useTransientFeedback();
  const tripUrl = new URL(
    `bill/${eventId}`,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).toString();

  const copyToClipboard = async (
    value: string,
    successMessage: string,
    toastId: string,
    onSuccess: () => void,
  ) => {
    try {
      await copyText(value);
      onSuccess();
      toast.success(successMessage, { id: toastId });
    } catch {
      toast.error("Couldn’t copy. Please copy it manually.", { id: toastId });
    }
  };

  const handleShareTrip = async () => {
    try {
      const result = await shareTrip({ tripName, tripUrl });
      if (result !== "cancelled") shareFeedback.trigger();
      if (result === "copied") {
        toast.success("Sharing isn’t available, so the trip link was copied", {
          id: "onboarding-share-trip",
        });
      }
    } catch {
      toast.error("Couldn’t share this trip", { id: "onboarding-share-trip" });
    }
  };

  return (
    <div className="w-full space-y-6">
      <IllustratedState
        as="header"
        className="gap-3"
        illustration={
          <ThemeImage
            src={`${import.meta.env.BASE_URL}trip-link-onboarding.webp`}
          darkSrc={`${import.meta.env.BASE_URL}trip-link-onboarding-dark.webp`}
            alt="A bookmark marking a private web link."
            width={180}
            height={180}
            className="empty-state-illustration"
            decoding="async"
          />
        }
        title="Bookmark your trip link"
        titleAs="h1"
      />

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
        <Card className="p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Trip link</p>
            <a
              href={tripUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-words text-sm leading-relaxed text-primary underline-offset-2 hover:underline"
            >
              {tripUrl}
            </a>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full gap-2"
              onClick={() => void handleShareTrip()}
            >
              <FeedbackIcon active={shareFeedback.active}>
                <Share2 className="h-5 w-5" />
              </FeedbackIcon>
              Share
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full gap-2"
              onClick={() =>
                void copyToClipboard(
                  tripUrl,
                  "Trip link copied",
                  "onboarding-copy-trip-link",
                  linkCopyFeedback.trigger,
                )
              }
            >
              <FeedbackIcon active={linkCopyFeedback.active}>
                <IconCopy className="h-5 w-5" />
              </FeedbackIcon>
              Copy URL
            </Button>
          </div>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-4">
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
              void copyToClipboard(
                eventId,
                "Trip number copied",
                "onboarding-copy-trip-number",
                numberCopyFeedback.trigger,
              )
            }
          >
            <FeedbackIcon active={numberCopyFeedback.active}>
              <IconCopy className="h-5 w-5" />
            </FeedbackIcon>
            Copy number
          </Button>
        </Card>
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
