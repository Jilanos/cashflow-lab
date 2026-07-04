// Period & filter engine for the dashboard.
// A period is an inclusive ISO date range [start, end]. All date math is
// deterministic and driven by explicit anchors so the domain stays pure and
// testable (no reliance on the ambient clock).

import type { Category, Transaction } from "./types";

/**
 * A transaction counts as spending when money leaves the account, it is not an
 * internal transfer, and its category (if any) is not income/transfer.
 * Internal transfers are excluded from spending totals by default per the
 * product guardrail, while remaining available for balance calculations.
 */
export function isSpending(tx: Transaction, categories: Map<string, Category>): boolean {
  if (tx.transferGroupId) return false;
  if (tx.amountCents >= 0) return false;
  const behavior = tx.categoryId ? categories.get(tx.categoryId)?.behavior : undefined;
  if (behavior === "transfer" || behavior === "income") return false;
  return true;
}

export interface DateRange {
  /** Inclusive start, YYYY-MM-DD. */
  start: string;
  /** Inclusive end, YYYY-MM-DD. */
  end: string;
}

/** How a "month" period is delimited. */
export type PeriodMode = "calendar" | "budget";

/** Relative range presets, resolved against an anchor date. */
export type QuickPreset = "current" | "previous" | "last3" | "ytd" | "custom";

/** Which transactions a filter keeps by direction. */
export type TypeFilter = "all" | "spending" | "income";

/** Categorization status filter. */
export type CategorizedFilter = "all" | "categorized" | "uncategorized";

export interface TransactionFilter {
  range?: DateRange;
  /** Keep only these category ids; empty/undefined means all. */
  categoryIds?: string[];
  /** Keep only these account ids; empty/undefined means all. */
  accountIds?: string[];
  type?: TypeFilter;
  /** Case-insensitive substring matched against label/rawLabel/merchant. */
  text?: string;
  categorized?: CategorizedFilter;
}

// --- Low-level date helpers (UTC-based, ISO in / ISO out) --------------------

function daysInMonth(year: number, month1: number): number {
  // month1 is 1-based; day 0 of next month is the last day of this month.
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function iso(year: number, month1: number, day: number): string {
  return `${year.toString().padStart(4, "0")}-${pad(month1)}-${pad(day)}`;
}

/** Add whole days to an ISO date, returning an ISO date. */
export function addDays(isoDate: string, count: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + count));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** True when `isoDate` falls within the inclusive range. */
export function containsDate(range: DateRange, isoDate: string): boolean {
  return isoDate >= range.start && isoDate <= range.end;
}

// --- Range builders ----------------------------------------------------------

/** Full calendar month for a YYYY-MM key (or any ISO date within it). */
export function calendarMonthRange(monthOrIso: string): DateRange {
  const [y, m] = monthOrIso.split("-").map(Number);
  return { start: iso(y, m, 1), end: iso(y, m, daysInMonth(y, m)) };
}

/**
 * Budget month containing `anchorIso`, delimited by `startDay`.
 * A budget month starting on day 28 runs 28 Jan → 27 Feb, and so on.
 * When a month is shorter than `startDay` (e.g. day 31 in February) the
 * boundary is clamped to that month's last day, so ranges never overlap or gap.
 */
export function budgetMonthRange(anchorIso: string, startDay: number): DateRange {
  const day = Math.min(Math.max(Math.trunc(startDay), 1), 28);
  const [y, m, d] = anchorIso.split("-").map(Number);

  // The period starts this month if we're on/after the start day, else last month.
  let startYear = y;
  let startMonth = m; // 1-based
  if (d < clampDay(y, m, day)) {
    startMonth -= 1;
    if (startMonth === 0) {
      startMonth = 12;
      startYear -= 1;
    }
  }
  const start = iso(startYear, startMonth, clampDay(startYear, startMonth, day));

  // End is the day before the next period's start.
  let nextYear = startYear;
  let nextMonth = startMonth + 1;
  if (nextMonth === 13) {
    nextMonth = 1;
    nextYear += 1;
  }
  const nextStart = iso(nextYear, nextMonth, clampDay(nextYear, nextMonth, day));
  return { start, end: addDays(nextStart, -1) };
}

function clampDay(year: number, month1: number, day: number): number {
  return Math.min(day, daysInMonth(year, month1));
}

/** The period (calendar or budget month) containing `anchorIso`. */
export function periodOf(anchorIso: string, mode: PeriodMode, budgetStartDay: number): DateRange {
  return mode === "budget"
    ? budgetMonthRange(anchorIso, budgetStartDay)
    : calendarMonthRange(anchorIso);
}

/** Shift a period by `count` whole periods (previous/next month). */
export function shiftPeriod(
  range: DateRange,
  count: number,
  mode: PeriodMode,
  budgetStartDay: number,
): DateRange {
  // Anchor a day inside the neighbouring period and re-resolve.
  const anchor = count >= 0 ? addDays(range.end, 1) : addDays(range.start, -1);
  let current = periodOf(anchor, mode, budgetStartDay);
  const step = count >= 0 ? 1 : -1;
  for (let i = 1; i < Math.abs(count); i++) {
    const a = step > 0 ? addDays(current.end, 1) : addDays(current.start, -1);
    current = periodOf(a, mode, budgetStartDay);
  }
  return current;
}

export interface QuickRangeOptions {
  mode: PeriodMode;
  budgetStartDay: number;
  /** Only used for the "custom" preset. */
  custom?: DateRange;
}

/**
 * Resolve a preset against an anchor date (typically "today").
 * Returns null for "custom" when no explicit range is provided.
 */
export function quickRange(
  preset: QuickPreset,
  anchorIso: string,
  opts: QuickRangeOptions,
): DateRange | null {
  const current = periodOf(anchorIso, opts.mode, opts.budgetStartDay);
  switch (preset) {
    case "current":
      return current;
    case "previous":
      return shiftPeriod(current, -1, opts.mode, opts.budgetStartDay);
    case "last3": {
      const first = shiftPeriod(current, -2, opts.mode, opts.budgetStartDay);
      return { start: first.start, end: current.end };
    }
    case "ytd": {
      const year = anchorIso.slice(0, 4);
      return { start: `${year}-01-01`, end: anchorIso };
    }
    case "custom":
      return opts.custom ?? null;
  }
}

// --- Filtering ---------------------------------------------------------------

/** Apply a combinable filter to a transaction list. */
export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
  categories: Map<string, Category>,
): Transaction[] {
  const cats = filter.categoryIds && filter.categoryIds.length ? new Set(filter.categoryIds) : null;
  const accts = filter.accountIds && filter.accountIds.length ? new Set(filter.accountIds) : null;
  const needle = filter.text?.trim().toLowerCase() ?? "";
  const type = filter.type ?? "all";
  const categorized = filter.categorized ?? "all";

  return transactions.filter((t) => {
    if (filter.range && !containsDate(filter.range, t.bookingDate)) return false;
    if (accts && !accts.has(t.accountId)) return false;
    if (cats && !(t.categoryId && cats.has(t.categoryId))) return false;

    if (categorized === "categorized" && !t.categoryId) return false;
    if (categorized === "uncategorized" && t.categoryId) return false;

    if (type === "spending" && !isSpending(t, categories)) return false;
    if (type === "income" && !(t.amountCents > 0 && !t.transferGroupId)) return false;

    if (needle) {
      const hay = `${t.label} ${t.rawLabel} ${t.merchant ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}
