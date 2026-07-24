import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/app-toast";
import { createEvent, checkEventExists, generateEventCode } from "@/services/database";
import { LandingHeartIcon } from "@/components/icons/landing-heart-icon";
import { LandingPlusIcon } from "@/components/icons/landing-plus-icon";
import {
  forgetRecentTrip,
  readRecentTrips,
  type RecentTrip,
} from "@/lib/recent-trips";
import { waitForMotion } from "@/lib/motion";
import { ThemeImage } from "@/components/theme-image";

const HERO = `${import.meta.env.BASE_URL}landing-hero.webp`;
const DARK_HERO = `${import.meta.env.BASE_URL}landing-hero-dark.webp`;
const HERO_ALT = "German Shepherd puppy holding a large banknote";
export default function Landing() {
  const [tripName, setTripName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>(readRecentTrips);
  const [removingRecentTripId, setRemovingRecentTripId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  const removeRecentTrip = async (tripId: string) => {
    setRemovingRecentTripId(tripId);
    await waitForMotion(200);
    forgetRecentTrip(tripId);
    setRecentTrips(readRecentTrips());
    setRemovingRecentTripId(null);
  };

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      toast.error("Please enter a trip name", { id: "trip-create" });
      return;
    }
    setIsCreating(true);
    try {
      let eventCode = "";
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = generateEventCode();
        try {
          await createEvent(candidate, tripName.trim());
          eventCode = candidate;
          break;
        } catch (error) {
          const code =
            typeof error === "object" && error !== null && "code" in error
              ? String(error.code)
              : "";
          if (code !== "23505" || attempt === 4) throw error;
        }
      }
      if (!eventCode) throw new Error("Could not generate a unique trip code");
      toast.success(`Trip created! Access code: ${eventCode}`, {
        id: "trip-create",
      });
      navigate(`/bill/${eventCode}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip. Please try again.", {
        id: "trip-create",
      });
    } finally {
      setIsCreating(false);
    }
  };
  const handleJoinTrip = async () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code", { id: "trip-join" });
      return;
    }

    if (!/^\d{6}$/.test(accessCode.trim())) {
      toast.error("Please enter a valid 6-digit access code", { id: "trip-join" });
      return;
    }
    setIsJoining(true);
    try {
      const exists = await checkEventExists(accessCode.trim());
      if (exists) {
        navigate(`/bill/${accessCode.trim()}`);
      } else {
        toast.error("Trip not found. Please check the access code.", {
          id: "trip-join",
        });
      }
    } catch (error) {
      console.error("Error checking trip:", error);
      toast.error("Failed to join trip. Please try again.", { id: "trip-join" });
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <div className="min-h-screen bg-card">
      <main className="app-page">
        <header className="space-y-3 text-center">
          <div className="flex w-full justify-center">
            <ThemeImage
              src={HERO}
              darkSrc={DARK_HERO}
              alt={HERO_ALT}
              width={256}
              height={256}
              className="empty-state-illustration mx-auto block"
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
          {recentTrips.length > 0 ? (
            <section aria-labelledby="recent-trips-heading">
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-3">
                  <CardTitle
                    as="h2"
                    id="recent-trips-heading"
                    className="text-left text-xl font-semibold tracking-tight text-foreground"
                  >
                    Recent trips on this device
                  </CardTitle>
                  {recentTrips.length === 5 ? (
                    <CardDescription>
                      Only the 5 most recently opened trips are shown.
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="m-0 list-none space-y-2 p-0">
                    {recentTrips.map((trip, index) => (
                      <li
                        key={trip.id}
                        className="motion-list-enter motion-removable flex items-center gap-2 rounded-lg border border-border bg-muted/35 p-2 transition-colors hover:bg-muted/55"
                        data-removing={removingRecentTripId === trip.id ? "true" : "false"}
                        style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
                      >
                        <button
                          type="button"
                          className="motion-press min-h-12 min-w-0 flex-1 rounded-md px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => navigate(`/bill/${trip.id}`)}
                        >
                          <span className="block truncate font-semibold text-foreground">
                            {trip.name}
                          </span>
                          <span className="mt-0.5 block text-sm tabular-nums text-muted-foreground">
                            Trip ID: {trip.id}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive-action hover:bg-destructive/10 hover:text-destructive-action"
                          onClick={() => void removeRecentTrip(trip.id)}
                          aria-label={`Remove ${trip.name} from recent trips`}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ) : null}

          <section aria-labelledby="landing-create-heading">
            <Card>
              <CardHeader className="p-4 pb-4">
                <CardTitle
                  as="h2"
                  id="landing-create-heading"
                  className="text-left text-xl font-semibold tracking-tight text-foreground"
                >
                  Create a new trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="landing-trip-name">Trip name</Label>
                  <Input
                    id="landing-trip-name"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g., Weekend in Chiang Mai"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTrip();
                      }
                    }}
                  />
                </div>
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
                  className="text-left text-xl font-semibold tracking-tight text-foreground"
                >
                  Join an existing trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="landing-access-code">Access code</Label>
                  <Input
                    id="landing-access-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    placeholder="Enter the 6-digit code"
                    aria-describedby="landing-access-code-hint"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleJoinTrip();
                      }
                    }}
                    maxLength={6}
                  />
                  <p id="landing-access-code-hint" className="text-xs text-muted-foreground">
                    You’ll find this number in the shared trip link.
                  </p>
                </div>
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
      </main>
    </div>
  );
}
