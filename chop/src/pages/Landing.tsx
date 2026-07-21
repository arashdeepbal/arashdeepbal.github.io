import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createEvent, checkEventExists, generateEventCode } from "@/services/database";
import { LandingHeartIcon } from "@/components/icons/landing-heart-icon";
import { LandingPlusIcon } from "@/components/icons/landing-plus-icon";

const HERO = `${import.meta.env.BASE_URL}landing-hero.webp`;
const HERO_ALT = "3D knife slicing a roll of money — split the bill";
export default function Landing() {
  const [tripName, setTripName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 250);
    return () => clearTimeout(t);
  }, []);
  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }
    setIsCreating(true);
    try {
      const eventCode = generateEventCode();
      await createEvent(eventCode, tripName.trim());
      toast.success(`Trip created! Access code: ${eventCode}`);
      navigate(`/bill/${eventCode}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  const handleJoinTrip = async () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }

    if (!/^\d{6}$/.test(accessCode.trim())) {
      toast.error("Please enter a valid 6-digit access code");
      return;
    }
    setIsJoining(true);
    try {
      const exists = await checkEventExists(accessCode.trim());
      if (exists) {
        navigate(`/bill/${accessCode.trim()}`);
      } else {
        toast.error("Trip not found. Please check the access code.");
      }
    } catch (error) {
      console.error("Error checking trip:", error);
      toast.error("Failed to join trip. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="app-page">
          <div className="space-y-3 text-center">
            <Skeleton className="empty-state-illustration mx-auto" />
            <Skeleton className="mx-auto h-12 w-56 sm:h-14" />
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
          <div className="mt-8 space-y-6">
            <Skeleton className="h-44 w-full rounded-lg" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="app-page">
        <header className="space-y-3 text-center">
          <div className="flex w-full justify-center">
            <img
              src={HERO}
              alt={HERO_ALT}
              width={256}
              height={256}
              className="empty-state-illustration mx-auto block"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Chop Chop!
          </h1>
          <p className="text-sm text-muted-foreground">
            Split bills easily with friends.
          </p>
        </header>

        <div className="mt-8 w-full space-y-6">
          <section aria-labelledby="landing-create-heading">
            <Card>
              <CardHeader className="p-4 pb-4">
                <CardTitle
                  as="h2"
                  id="landing-create-heading"
                  className="text-left text-xl font-bold tracking-tight text-foreground"
                >
                  Create a new trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <Input
                  id="landing-trip-name"
                  type="text"
                  autoComplete="off"
                  placeholder="Name of the trip"
                  aria-label="Name of the trip"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTrip();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleCreateTrip}
                  className="w-full gap-2 text-base font-medium"
                  size="lg"
                  disabled={isCreating}
                >
                  {!isCreating && (
                    <LandingPlusIcon className="!size-5 shrink-0 text-primary-foreground" />
                  )}
                  {isCreating ? "Creating…" : "Create trip"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <div className="flex items-center gap-3" role="separator" aria-hidden>
            <div className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <section aria-labelledby="landing-join-heading">
            <Card className="bg-secondary/20">
              <CardHeader className="p-4 pb-4">
                <CardTitle
                  as="h2"
                  id="landing-join-heading"
                  className="text-left text-xl font-bold tracking-tight text-foreground"
                >
                  Join an existing trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="6-digit access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinTrip();
                    }
                  }}
                  maxLength={6}
                />
                <Button
                  type="button"
                  onClick={handleJoinTrip}
                  variant="secondary"
                  className="w-full gap-2 text-base font-medium"
                  size="lg"
                  disabled={isJoining}
                >
                  {!isJoining && (
                    <LandingHeartIcon className="!size-5 shrink-0 text-primary" />
                  )}
                  {isJoining ? "Joining…" : "Join trip"}
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
