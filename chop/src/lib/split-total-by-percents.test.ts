import { describe, expect, it } from "vitest";
import {
  amountsEqually,
  amountsFromPercents,
  equalSplitPercents,
} from "@/lib/split-total-by-percents";

describe("currency allocation", () => {
  it("splits an amount equally without losing a cent", () => {
    const splits = amountsEqually(10, ["a", "b", "c"]);

    expect(splits).toEqual([
      { personId: "a", amount: 3.34 },
      { personId: "b", amount: 3.33 },
      { personId: "c", amount: 3.33 },
    ]);
    expect(splits.reduce((total, split) => total + split.amount, 0)).toBe(10);
  });

  it("allocates percentages to the exact currency total", () => {
    const splits = amountsFromPercents(10.01, [
      { personId: "a", percent: 33.33 },
      { personId: "b", percent: 33.33 },
      { personId: "c", percent: 33.34 },
    ]);

    expect(splits).toEqual([
      { personId: "a", amount: 3.34 },
      { personId: "b", amount: 3.33 },
      { personId: "c", amount: 3.34 },
    ]);
    expect(splits.reduce((total, split) => total + split.amount, 0)).toBe(10.01);
  });

  it("creates equal percentages that add up to exactly 100", () => {
    const percentages = equalSplitPercents(6);

    expect(percentages).toEqual([16.67, 16.67, 16.67, 16.67, 16.66, 16.66]);
    expect(percentages.reduce((total, percent) => total + percent, 0)).toBe(100);
  });

  it("allocates zero-decimal currencies without fractional minor units", () => {
    const splits = amountsEqually(10, ["a", "b", "c"], 0);

    expect(splits).toEqual([
      { personId: "a", amount: 4 },
      { personId: "b", amount: 3 },
      { personId: "c", amount: 3 },
    ]);
  });
});
