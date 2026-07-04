import { addMonths, monthKey } from "./dates";
import type { ForecastEvent, RecurringRule } from "./types";

export interface ForecastInput {
  /** First month to project, YYYY-MM. */
  startMonth: string;
  /** Number of months to project (clamped to 3..12). */
  horizonMonths: number;
  /** Starting balance in cents keyed by accountId. */
  openingBalances: Record<string, number>;
  recurringRules: RecurringRule[];
  events: ForecastEvent[];
}

export interface MonthForecast {
  month: string;
  inflowCents: number;
  outflowCents: number;
  netCents: number;
  /** Projected end-of-month balance across all accounts. */
  endBalanceCents: number;
  /** Projected end-of-month balance per account. */
  perAccountEndCents: Record<string, number>;
}

export interface ForecastResult {
  months: MonthForecast[];
}

/**
 * Deterministic monthly cashflow forecast. For each month we sum the occurrences
 * of every recurring rule plus one-off events, then roll the balance forward.
 * No randomness or opaque prediction — output depends only on the inputs.
 */
export function forecast(input: ForecastInput): ForecastResult {
  const horizon = Math.min(12, Math.max(3, Math.round(input.horizonMonths)));
  const balances: Record<string, number> = { ...input.openingBalances };
  const months: MonthForecast[] = [];

  for (let i = 0; i < horizon; i++) {
    const month = addMonths(input.startMonth, i);
    let inflow = 0;
    let outflow = 0;

    const apply = (accountId: string, amountCents: number) => {
      if (amountCents >= 0) inflow += amountCents;
      else outflow += Math.abs(amountCents);
      balances[accountId] = (balances[accountId] ?? 0) + amountCents;
    };

    for (const rule of input.recurringRules) {
      const occ = occurrencesInMonth(rule, month);
      if (occ > 0) apply(rule.accountId, rule.amountCents * occ);
    }
    for (const ev of input.events) {
      if (monthKey(ev.date) === month) apply(ev.accountId, ev.amountCents);
    }

    months.push({
      month,
      inflowCents: inflow,
      outflowCents: outflow,
      netCents: inflow - outflow,
      endBalanceCents: Object.values(balances).reduce((a, b) => a + b, 0),
      perAccountEndCents: { ...balances },
    });
  }

  return { months };
}

/** How many times a recurring rule fires within the given month. */
export function occurrencesInMonth(rule: RecurringRule, month: string): number {
  const start = monthKey(rule.startDate);
  if (month < start) return 0;
  if (rule.endDate && month > monthKey(rule.endDate)) return 0;

  const diff = monthDiff(start, month);
  switch (rule.cadence) {
    case "monthly":
      return 1;
    case "quarterly":
      return diff % 3 === 0 ? 1 : 0;
    case "yearly":
      return diff % 12 === 0 ? 1 : 0;
    case "weekly":
      return weeklyOccurrences(rule, month);
    default:
      return 0;
  }
}

function monthDiff(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return ty * 12 + (tm - 1) - (fy * 12 + (fm - 1));
}

function weeklyOccurrences(rule: RecurringRule, month: string): number {
  const [y, m] = month.split("-").map(Number);
  const monthStart = Date.UTC(y, m - 1, 1);
  const monthEnd = Date.UTC(y, m, 0); // last day of month
  let cursor = Date.parse(rule.startDate);
  if (Number.isNaN(cursor)) return 0;
  // Fast-forward to the first occurrence within or after the month start.
  if (cursor < monthStart) {
    const weeks = Math.ceil((monthStart - cursor) / (7 * 86_400_000));
    cursor += weeks * 7 * 86_400_000;
  }
  let count = 0;
  const end = rule.endDate ? Date.parse(rule.endDate) : Number.POSITIVE_INFINITY;
  while (cursor <= monthEnd && cursor <= end) {
    if (cursor >= monthStart) count++;
    cursor += 7 * 86_400_000;
  }
  return count;
}
