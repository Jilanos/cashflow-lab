import { monthKey } from "./dates";
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

export interface Bucket {
  key: string;
  label: string;
  amountCents: number; // positive magnitude of spending
  count: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalSpendingCents: number;
  totalIncomeCents: number;
  byCategory: Bucket[];
  byAccount: Bucket[];
  topMerchants: Bucket[];
}

export interface SummaryContext {
  categories: Map<string, Category>;
  accountName: (accountId: string) => string;
  topMerchantsLimit?: number;
}

/** Build the default monthly dashboard payload for a single month. */
export function summarizeMonth(
  transactions: Transaction[],
  month: string,
  ctx: SummaryContext,
): MonthlySummary {
  const inMonth = transactions.filter((t) => monthKey(t.bookingDate) === month);
  const spending = inMonth.filter((t) => isSpending(t, ctx.categories));

  const income = inMonth
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
    month,
    totalSpendingCents: spending.reduce((acc, t) => acc + Math.abs(t.amountCents), 0),
    totalIncomeCents: income,
    byCategory,
    byAccount,
    topMerchants,
  };
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
