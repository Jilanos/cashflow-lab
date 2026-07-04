// Date helpers. Canonical dates are ISO strings (YYYY-MM-DD).

/**
 * Parse a French/ISO date string into canonical ISO (YYYY-MM-DD).
 * Accepts DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, DD.MM.YYYY and YYYY-MM-DD.
 * Returns null when the value is not a recognizable date.
 */
export function parseDateToIso(input: string): string | null {
  if (!input) return null;
  const s = input.trim();

  // Already ISO.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return isValid(+iso[1], +iso[2], +iso[3]) ? s : null;

  const dmy = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/.exec(s);
  if (dmy) {
    const day = +dmy[1];
    const month = +dmy[2];
    let year = +dmy[3];
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    if (!isValid(year, month, day)) return null;
    return `${year.toString().padStart(4, "0")}-${pad(month)}-${pad(day)}`;
  }
  return null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isValid(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/** Return the YYYY-MM month key for an ISO date. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Add whole months to a YYYY-MM month key. */
export function addMonths(key: string, count: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + count;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny.toString().padStart(4, "0")}-${nm.toString().padStart(2, "0")}`;
}

/** True when the ISO date falls within the given month key. */
export function isInMonth(isoDate: string, key: string): boolean {
  return monthKey(isoDate) === key;
}
