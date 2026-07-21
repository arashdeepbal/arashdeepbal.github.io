export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export async function shareTrip({
  tripName,
  tripUrl,
}: {
  tripName: string;
  tripUrl: string;
}): Promise<"shared" | "copied" | "cancelled"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `${tripName || "Trip"} · Chop Chop!`,
        text: `Open our ${tripName || "trip"} bill on Chop Chop!`,
        url: tripUrl,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyText(tripUrl);
  return "copied";
}
