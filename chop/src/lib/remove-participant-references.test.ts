import { describe, expect, it } from "vitest";
import { removeParticipantFromBillItem } from "@/lib/remove-participant-references";
import type { BillItem } from "@/types";

const item: BillItem = {
  id: "bill-1",
  description: "Dinner",
  amount: 90,
  currency: "$",
  paidBy: "person-a",
  sharedWith: ["person-a", "person-b", "person-c"],
  date: "2026-07-22T01:00:00.000Z",
  personSplits: [
    { personId: "person-a", amount: 30 },
    { personId: "person-b", amount: 30 },
    { personId: "person-c", amount: 30 },
  ],
};

describe("participant reference cleanup", () => {
  it("detaches a removed payer from payer, shares, and stored splits", () => {
    expect(removeParticipantFromBillItem(item, "person-a")).toEqual({
      ...item,
      paidBy: null,
      sharedWith: ["person-b", "person-c"],
      personSplits: [
        { personId: "person-b", amount: 45 },
        { personId: "person-c", amount: 45 },
      ],
    });
  });

  it("removes an empty stored split list instead of retaining an empty array", () => {
    const singlePersonItem = {
      ...item,
      sharedWith: ["person-a"],
      personSplits: [{ personId: "person-a", amount: 90 }],
    };

    expect(
      removeParticipantFromBillItem(singlePersonItem, "person-a").personSplits,
    ).toBeUndefined();
  });
});
