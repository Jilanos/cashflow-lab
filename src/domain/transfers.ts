import type { Transaction } from "./types";

export interface TransferOptions {
  /** Max whole-day gap between the two legs to still be considered a pair. */
  maxDayGap?: number;
}

/**
 * Detect internal transfers between owned accounts: an outgoing amount on one
 * account paired with the exact opposite amount on another account within a
 * small date window. Both legs receive a shared `transferGroupId`.
 *
 * Transfers are preserved (they still affect balances) but callers exclude them
 * from spending totals via {@link import("./analysis").isSpending}.
 */
export function detectInternalTransfers(
  transactions: Transaction[],
  options: TransferOptions = {},
): Transaction[] {
  const maxDayGap = options.maxDayGap ?? 3;
  const result = transactions.map((t) => ({ ...t, transferGroupId: undefined as string | undefined }));

  // Index unmatched negative legs by absolute amount for quick lookup.
  const byAmount = new Map<number, number[]>(); // |amount| -> indexes
  result.forEach((tx, i) => {
    if (tx.amountCents < 0) {
      const key = Math.abs(tx.amountCents);
      const list = byAmount.get(key) ?? [];
      list.push(i);
      byAmount.set(key, list);
    }
  });

  let group = 0;
  result.forEach((credit) => {
    if (credit.amountCents <= 0 || credit.transferGroupId) return;
    const candidates = byAmount.get(credit.amountCents);
    if (!candidates) return;
    for (const di of candidates) {
      const debit = result[di];
      if (debit.transferGroupId) continue;
      if (debit.accountId === credit.accountId) continue;
      if (dayGap(debit.bookingDate, credit.bookingDate) > maxDayGap) continue;
      const id = `xfer_${group++}`;
      debit.transferGroupId = id;
      credit.transferGroupId = id;
      break;
    }
  });

  return result;
}

function dayGap(a: string, b: string): number {
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (Number.isNaN(da) || Number.isNaN(db)) return Number.POSITIVE_INFINITY;
  return Math.abs(da - db) / 86_400_000;
}
