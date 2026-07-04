import { monthKey } from "./dates";
import { calendarMonthRange, containsDate, isSpending, type DateRange } from "./period";
import type { Category, Transaction } from "./types";

export { isSpending };

export interface Bucket {
  key: string;
  label: string;
  amountCents: number; // positive magnitude of spending
  count: number;
}

export interface PeriodSummary {
  range: DateRange;
  totalSpendingCents: number;
  totalIncomeCents: number;
  byCategory: Bucket[];
  byAccount: Bucket[];
  topMerchants: Bucket[];
}

/** Back-compat alias: a monthly summary is just a period summary. */
export type MonthlySummary = PeriodSummary & { month: string };

export interface SummaryContext {
  categories: Map<string, Category>;
  accountName: (accountId: string) => string;
  topMerchantsLimit?: number;
}

/**
 * Build the dashboard payload for an inclusive date range. This is the
 * period-based primitive; {@link summarizeMonth} is a thin calendar-month
 * wrapper preserved for backward compatibility.
 *
 * When `preFiltered` is set the transactions are assumed to already match the
 * range and any active filters, so only the range's own membership test is
 * skipped — spending/income classification still applies.
 */
export function summarizePeriod(
  transactions: Transaction[],
  range: DateRange,
  ctx: SummaryContext,
  preFiltered = false,
): PeriodSummary {
  const inRange = preFiltered
    ? transactions
    : transactions.filter((t) => containsDate(range, t.bookingDate));
  const spending = inRange.filter((t) => isSpending(t, ctx.categories));

  const income = inRange
    .filter((t) => t.amountCents > 0 && !t.transferGroupId)
    .reduce((acc, t) => acc + t.amountCents, 0);

  const byCategory = bucketBy(
    spending,
    (t) => t.categoryId ?? "cat_autre",
    (id) => ctx.categories.get(id)?.name ?? "Autre",
  );
  const byAccount = bucketBy(
    spending,
    (t) => t.accountId,
    (id) => ctx.accountName(id),
  );
  const topMerchants = bucketBy(
    spending,
    (t) => t.merchant ?? "Inconnu",
    (m) => m,
  ).slice(0, ctx.topMerchantsLimit ?? 10);

  return {
    range,
    totalSpendingCents: spending.reduce((acc, t) => acc + Math.abs(t.amountCents), 0),
    totalIncomeCents: income,
    byCategory,
    byAccount,
    topMerchants,
  };
}

/** Build the default monthly dashboard payload for a single calendar month. */
export function summarizeMonth(
  transactions: Transaction[],
  month: string,
  ctx: SummaryContext,
): MonthlySummary {
  return { month, ...summarizePeriod(transactions, calendarMonthRange(month), ctx) };
}

export interface PieSlice {
  key: string;
  label: string;
  amountCents: number;
  /** Fraction of the total in [0, 1]. */
  fraction: number;
}

/**
 * Turn spending buckets into pie slices, collapsing the long tail beyond
 * `maxSlices` into a single "Autres" slice so charts stay readable.
 */
export function toPieSlices(buckets: Bucket[], maxSlices = 8): PieSlice[] {
  const total = buckets.reduce((acc, b) => acc + b.amountCents, 0);
  if (total === 0) return [];
  const head = buckets.slice(0, maxSlices);
  const tail = buckets.slice(maxSlices);
  const slices: PieSlice[] = head.map((b) => ({
    key: b.key,
    label: b.label,
    amountCents: b.amountCents,
    fraction: b.amountCents / total,
  }));
  if (tail.length) {
    const rest = tail.reduce((acc, b) => acc + b.amountCents, 0);
    slices.push({ key: "__autres__", label: "Autres", amountCents: rest, fraction: rest / total });
  }
  return slices;
}

/** List available month keys present in the data, most recent first. */
export function availableMonths(transactions: Transaction[]): string[] {
  const set = new Set(transactions.map((t) => monthKey(t.bookingDate)));
  return [...set].sort().reverse();
}

function bucketBy(
  txs: Transaction[],
  keyOf: (t: Transaction) => string,
  labelOf: (key: string) => string,
): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const t of txs) {
    const key = keyOf(t);
    const b = map.get(key) ?? { key, label: labelOf(key), amountCents: 0, count: 0 };
    b.amountCents += Math.abs(t.amountCents);
    b.count += 1;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => b.amountCents - a.amountCents);
}
