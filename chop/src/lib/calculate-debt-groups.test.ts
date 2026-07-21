import { describe, expect, it } from "vitest";
import { calculateDebtGroups } from "@/lib/calculate-debt-groups";
import type { BillItem, Person } from "@/types";

const people: Person[] = [
  { id: "a", name: "Alex", avatarSeed: "1" },
  { id: "b", name: "Blake", avatarSeed: "2" },
];

function bill(overrides: Partial<BillItem>): BillItem {
  return {
    id: crypto.randomUUID(),
    description: "Expense",
    amount: 30,
    paidBy: "a",
    sharedWith: ["a", "b"],
    currency: "USD",
    date: "2026-07-21T12:00:00.000Z",
    ...overrides,
  };
}

describe("calculateDebtGroups", () => {
  it("groups multiple currencies owed by the same pair into one debt card", () => {
    const debts = calculateDebtGroups({
      people,
      billItems: [bill({ amount: 30, currency: "USD" }), bill({ amount: 20, currency: "EUR" })],
      settlements: [],
    });

    expect(debts).toEqual([
      {
        fromPerson: "b",
        toPerson: "a",
        amounts: [
          { currency: "USD", amount: 15 },
          { currency: "EUR", amount: 10 },
        ],
      },
    ]);
  });

  it("applies a partial settlement only to its matching currency", () => {
    const debts = calculateDebtGroups({
      people,
      billItems: [bill({ amount: 30, currency: "USD" }), bill({ amount: 20, currency: "EUR" })],
      settlements: [
        {
          from_person_id: "b",
          to_person_id: "a",
          currency: "USD",
          amount: 5,
        },
      ],
    });

    expect(debts[0]?.amounts).toEqual([
      { currency: "USD", amount: 10 },
      { currency: "EUR", amount: 10 },
    ]);
  });

  it("keeps debt involving a removed participant when stored splits retain the person", () => {
    const debts = calculateDebtGroups({
      people: [people[1]!],
      billItems: [
        bill({
          amount: 100,
          sharedWith: ["b"],
          personSplits: [
            { personId: "a", amount: 50 },
            { personId: "b", amount: 50 },
          ],
        }),
      ],
      settlements: [],
    });

    expect(debts).toEqual([
      {
        fromPerson: "b",
        toPerson: "a",
        amounts: [{ currency: "USD", amount: 50 }],
      },
    ]);
  });

  it("keeps a stored split when its only shared participant was removed", () => {
    const debts = calculateDebtGroups({
      people: [people[0]!],
      billItems: [
        bill({
          amount: 40,
          sharedWith: [],
          personSplits: [{ personId: "b", amount: 40 }],
        }),
      ],
      settlements: [],
    });

    expect(debts).toEqual([
      {
        fromPerson: "b",
        toPerson: "a",
        amounts: [{ currency: "USD", amount: 40 }],
      },
    ]);
  });

  it("uses integer cents across multiple expenses", () => {
    const debts = calculateDebtGroups({
      people,
      billItems: [bill({ amount: 10.01 }), bill({ amount: 0.02 })],
      settlements: [],
    });

    expect(debts[0]?.amounts).toEqual([{ currency: "USD", amount: 5.01 }]);
  });

  it("uses currency-specific precision for zero-decimal currencies", () => {
    const debts = calculateDebtGroups({
      people,
      billItems: [bill({ amount: 160_475, currency: "₫" })],
      settlements: [],
    });

    expect(debts[0]?.amounts).toEqual([{ currency: "₫", amount: 80_237 }]);
  });

  it("suppresses negligible residuals left by older settlements", () => {
    const debts = calculateDebtGroups({
      people,
      billItems: [bill({ amount: 30, currency: "$" })],
      settlements: [
        {
          from_person_id: "b",
          to_person_id: "a",
          currency: "$",
          amount: 14.98,
        },
      ],
    });

    expect(debts).toEqual([]);
  });
});
