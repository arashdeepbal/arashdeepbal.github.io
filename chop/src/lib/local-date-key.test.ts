import { describe, expect, it } from "vitest";
import { getLocalDateKey } from "@/lib/local-date-key";

describe("local history date keys", () => {
  it("groups an ISO timestamp by the viewer's local calendar day", () => {
    const localTimestamp = new Date(2026, 6, 22, 1, 22).toISOString();
    expect(getLocalDateKey(localTimestamp)).toBe("2026-07-22");
  });

  it("preserves date-only values", () => {
    expect(getLocalDateKey("2026-07-22")).toBe("2026-07-22");
  });
});
