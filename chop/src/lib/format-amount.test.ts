import { describe, expect, it } from "vitest";
import { formatCurrencyAmount, getCurrencyFractionDigits } from "@/lib/format-amount";

describe("currency-aware amount formatting", () => {
  it("keeps two decimals for US dollars", () => {
    expect(getCurrencyFractionDigits("$")).toBe(2);
    expect(formatCurrencyAmount(1234.5, "$")).toBe("1,234.50");
  });

  it("uses zero decimals for Vietnamese dong", () => {
    expect(getCurrencyFractionDigits("₫")).toBe(0);
    expect(formatCurrencyAmount(1_234_567, "₫")).toBe("1,234,567");
  });
});
