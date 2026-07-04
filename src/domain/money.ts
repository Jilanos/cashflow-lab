// Money helpers. Amounts are integer cents everywhere in the domain.

/**
 * Parse a monetary string into signed integer cents.
 * Handles French (`1 234,56`, `-12,00`, `1.234,56`) and plain (`1234.56`) forms.
 * Returns null if the string holds no parseable number.
 */
export function parseAmountToCents(input: string): number | null {
  if (input == null) return null;
  let s = input.trim();
  if (s === "") return null;

  // Detect a trailing/leading sign, including parenthesised negatives.
  let sign = 1;
  if (/^\(.*\)$/.test(s)) {
    sign = -1;
    s = s.slice(1, -1);
  }
  s = s.replace(/[+\s ]|eur|€/gi, "");
  if (s.startsWith("-")) {
    sign = -1;
    s = s.slice(1);
  }

  // Remove thousands separators, normalize decimal separator to ".".
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // The rightmost separator is the decimal one.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }

  if (!/^\d*(\.\d+)?$/.test(s) || s === "" || s === ".") return null;
  const value = Number(s);
  if (!Number.isFinite(value)) return null;
  return sign * Math.round(value * 100);
}

/** Format signed integer cents as a localized amount string. */
export function formatCents(cents: number, currency = "EUR", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
