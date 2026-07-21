import { describe, expect, it } from "vitest";
import { parseStoredSplitMode } from "@/lib/bill-form-preferences";

describe("bill form split-mode preferences", () => {
  it.each(["equal", "amount", "percentage"] as const)(
    "accepts the stored %s mode",
    (mode) => {
      expect(parseStoredSplitMode(mode)).toBe(mode);
    },
  );

  it("falls back safely for missing or invalid values", () => {
    expect(parseStoredSplitMode(null)).toBe("equal");
    expect(parseStoredSplitMode("other")).toBe("equal");
  });
});
