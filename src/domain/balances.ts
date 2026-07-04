import type { Account, ImportBatch, Transaction } from "./types";

export interface AccountBalance {
  accountId: string;
  /** Balance computed by summing all transactions on the account. */
  computedCents: number;
  /** Closing balance reported by the most recent import, if any. */
  reportedCents?: number;
  reportedDate?: string;
  /**
   * Preferred balance: the reported closing balance when available (banks
   * report the true figure including pre-history), otherwise the computed sum.
   */
  effectiveCents: number;
}

/**
 * Recalculate balances from transactions and enrich them with reported closing
 * balances from import batches. When a bank reports a closing balance we trust
 * it as the effective balance, since transaction history may not reach account
 * opening; otherwise we fall back to the transaction sum.
 */
export function computeBalances(
  accounts: Account[],
  transactions: Transaction[],
  batches: ImportBatch[],
): AccountBalance[] {
  return accounts.map((account) => {
    const computedCents = transactions
      .filter((t) => t.accountId === account.id)
      .reduce((acc, t) => acc + t.amountCents, 0);

    const reported = latestReported(batches, account.id);

    return {
      accountId: account.id,
      computedCents,
      reportedCents: reported?.cents,
      reportedDate: reported?.date,
      effectiveCents: reported?.cents ?? computedCents,
    };
  });
}

function latestReported(
  batches: ImportBatch[],
  accountId: string,
): { cents: number; date?: string } | undefined {
  const candidates = batches
    .filter((b) => b.accountId === accountId && b.reportedBalanceCents != null)
    .sort((a, b) => (a.reportedBalanceDate ?? a.importedAt).localeCompare(b.reportedBalanceDate ?? b.importedAt));
  const last = candidates[candidates.length - 1];
  return last ? { cents: last.reportedBalanceCents!, date: last.reportedBalanceDate } : undefined;
}
