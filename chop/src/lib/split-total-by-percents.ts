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
  let rem = total - base * count;
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
  entries: { personId: string; percent: number }[]
): PersonSplit[] {
  if (entries.length === 0) return [];
  const totalCents = Math.round(total * 100);
  const weights = entries.map((e) => e.percent);
  const wSum = weights.reduce((a, b) => a + b, 0);
  if (wSum <= 0) {
    return entries.map((e) => ({ personId: e.personId, amount: 0 }));
  }

  const raw = weights.map((w) => (totalCents * w) / wSum);
  const floors = raw.map((r) => Math.floor(r + 1e-9));
  let diff = totalCents - floors.reduce((a, b) => a + b, 0);
  const order = entries.map((_, i) => i).sort((i, j) => {
    const fi = raw[i]! - floors[i]!;
    const fj = raw[j]! - floors[j]!;
    return fj - fi;
  });
  const cents = [...floors];
  for (let k = 0; k < diff; k++) {
    cents[order[k]!]! += 1;
  }

  return entries.map((e, i) => ({
    personId: e.personId,
    amount: cents[i]! / 100,
  }));
}
