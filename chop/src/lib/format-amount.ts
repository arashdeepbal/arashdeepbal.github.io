import { getCurrencyByValue } from "@/lib/currencies";

const displayAmountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

/** Format a stored price for display while preserving the app's two-decimal convention. */
export function formatAmount(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? displayAmountFormatter.format(value)
    : "";
}

const currencyFractionDigits = new Map<string, number>();

/** Return the ISO 4217 minor-unit precision for a stored currency value. */
export function getCurrencyFractionDigits(currencyValue: string): number {
  const cached = currencyFractionDigits.get(currencyValue);
  if (cached != null) return cached;

  const iso = getCurrencyByValue(currencyValue)?.iso ?? currencyValue;
  let digits = 2;
  try {
    digits = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: iso,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    // Preserve the existing two-decimal convention for unknown legacy values.
  }
  currencyFractionDigits.set(currencyValue, digits);
  return digits;
}

/** Format a stored value with thousands separators and its currency's precision. */
export function formatCurrencyAmount(
  value: number | null | undefined,
  currencyValue: string,
): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const digits = getCurrencyFractionDigits(currencyValue);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: true,
  }).format(value);
}

/** Parse a price input that may contain thousands separators. */
export function parseAmountInput(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ""));
}

/**
 * Strip visual separators while a price is being edited.
 * Returns null when the proposed value is not a valid in-progress decimal.
 */
export function normalizeAmountInput(value: string): string | null {
  const normalized = value.replace(/,/g, "").trim();
  return /^\d*(?:\.\d*)?$/.test(normalized) ? normalized : null;
}

/** Add thousands separators to an editable price without forcing trailing zeroes. */
export function formatAmountInput(value: string): string {
  const normalized = normalizeAmountInput(value);
  if (normalized == null || normalized === "") return value;

  const [rawInteger, fraction] = normalized.split(".");
  const integer = (rawInteger || "0").replace(/^0+(?=\d)/, "");
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fraction === undefined
    ? groupedInteger
    : `${groupedInteger}.${fraction}`;
}
