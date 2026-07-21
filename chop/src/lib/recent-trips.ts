export interface RecentTrip {
  id: string;
  name: string;
  lastOpenedAt: string;
}

const STORAGE_KEY = "chop:recent-trips";
const MAX_RECENT_TRIPS = 5;

function isRecentTrip(value: unknown): value is RecentTrip {
  if (!value || typeof value !== "object") return false;
  const trip = value as Partial<RecentTrip>;
  return (
    typeof trip.id === "string" &&
    /^\d{6}$/.test(trip.id) &&
    typeof trip.name === "string" &&
    typeof trip.lastOpenedAt === "string"
  );
}

export function readRecentTrips(): RecentTrip[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecentTrip)
      .sort(
        (a, b) =>
          new Date(b.lastOpenedAt).getTime() -
          new Date(a.lastOpenedAt).getTime(),
      )
      .slice(0, MAX_RECENT_TRIPS);
  } catch {
    return [];
  }
}

export function rememberRecentTrip(id: string, name: string) {
  if (!/^\d{6}$/.test(id)) return;
  try {
    const nextTrip: RecentTrip = {
      id,
      name: name.trim() || "Trip",
      lastOpenedAt: new Date().toISOString(),
    };
    const next = [
      nextTrip,
      ...readRecentTrips().filter((trip) => trip.id !== id),
    ].slice(0, MAX_RECENT_TRIPS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The app still works when storage is unavailable or full.
  }
}

export function forgetRecentTrip(id: string) {
  try {
    const next = readRecentTrips().filter((trip) => trip.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore unavailable storage.
  }
}

export function getMostRecentTrip(): RecentTrip | null {
  return readRecentTrips()[0] ?? null;
}
