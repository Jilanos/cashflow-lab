import { describe, expect, it } from "vitest";
import { parseAmountToCents, formatCents, sumCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses French decimals with comma", () => {
    expect(parseAmountToCents("12,34")).toBe(1234);
    expect(parseAmountToCents("-12,00")).toBe(-1200);
  });

  it("parses French thousands separators", () => {
    expect(parseAmountToCents("1 234,56")).toBe(123456);
    expect(parseAmountToCents("1.234,56")).toBe(123456);
  });

  it("parses plain dot decimals", () => {
    expect(parseAmountToCents("1234.56")).toBe(123456);
    expect(parseAmountToCents("1,234.56")).toBe(123456);
  });

  it("handles signs, parentheses and currency noise", () => {
    expect(parseAmountToCents("(45,00)")).toBe(-4500);
    expect(parseAmountToCents("45,00 EUR")).toBe(4500);
    expect(parseAmountToCents("-0,99 €")).toBe(-99);
  });

  it("rounds to the nearest cent", () => {
    expect(parseAmountToCents("0,005")).toBe(1);
  });

  it("returns null for empty or non-numeric input", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("   ")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
  });
});

describe("formatCents / sumCents", () => {
  it("formats euros", () => {
    expect(formatCents(123456).replace(/ | /g, " ")).toContain("1 234,56");
  });
  it("sums", () => {
    expect(sumCents([100, -50, 25])).toBe(75);
  });
});
