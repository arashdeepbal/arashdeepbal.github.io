import type { PersonSplit } from "@/types";

/**
 * Split 100% across `count` people as decimal percentages that sum to exactly 100
 * (two decimal places, remainder on earlier slots when needed).
 */
export function equalSplitPercents(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [100];
  // Work in hundredths of a percent (basis points of 1%) so 100% = 10_000 units
  const total = 10_000;
  const base = Math.floor(total / count);
  const out = Array.from({ length: count }, () => base);
  const rem = total - base * count;
  for (let i = 0; i < rem; i++) {
    out[i % count] += 1;
  }
  return out.map((u) => u / 100);
}

/**
 * Turn per-person percentages into currency amounts that sum to `total`
 * (largest-remainder on cent fractions). `percent` values should sum to ~100.
 */
export function amountsFromPercents(
  total: number,
  entries: { personId: string; percent: number }[],
  fractionDigits = 2,
): PersonSplit[] {
  return amountsFromWeights(
    total,
    entries.map((entry) => ({
      personId: entry.personId,
      weight: entry.percent,
    })),
    fractionDigits,
  );
}

/** Divide a currency total equally while keeping every minor unit accounted for. */
export function amountsEqually(
  total: number,
  personIds: string[],
  fractionDigits = 2,
): PersonSplit[] {
  return amountsFromWeights(
    total,
    personIds.map((personId) => ({ personId, weight: 1 })),
    fractionDigits,
  );
}

/** Allocate a currency total by relative weights using largest-remainder minor units. */
export function amountsFromWeights(
  total: number,
  entries: { personId: string; weight: number }[],
  fractionDigits = 2,
): PersonSplit[] {
  if (entries.length === 0) return [];
  const factor = 10 ** fractionDigits;
  const totalUnits = Math.round(total * factor);
  const weights = entries.map((entry) => Math.max(0, entry.weight));
  const wSum = weights.reduce((a, b) => a + b, 0);
  if (wSum <= 0) {
    return entries.map((e) => ({ personId: e.personId, amount: 0 }));
  }

  const raw = weights.map((w) => (totalUnits * w) / wSum);
  const floors = raw.map((r) => Math.floor(r + 1e-9));
  const diff = totalUnits - floors.reduce((a, b) => a + b, 0);
  const order = entries.map((_, i) => i).sort((i, j) => {
    const fi = raw[i]! - floors[i]!;
    const fj = raw[j]! - floors[j]!;
    return fj - fi;
  });
  const units = [...floors];
  for (let k = 0; k < diff; k++) {
    units[order[k]!]! += 1;
  }

  return entries.map((entry, i) => ({
    personId: entry.personId,
    amount: units[i]! / factor,
  }));
}
