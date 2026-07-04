import type { Transaction } from "./types";
import { canonicalRowKey, legacyRowHash } from "./hash";

/**
 * Deduplicate transactions by their row hash. Re-importing the same file, or an
 * overlapping export window, must not create duplicates. The first occurrence
 * wins so existing ids/categories are preserved.
 */
export function dedupeByRowHash(transactions: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  const out: Transaction[] = [];
  for (const tx of transactions) {
    const keys = transactionDedupKeys(tx);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    out.push(tx);
  }
  return out;
}

/**
 * Merge freshly imported transactions into an existing set, dropping any whose
 * row hash already exists. Returns the merged list and how many were added.
 */
export function mergeImport(
  existing: Transaction[],
  incoming: Transaction[],
): { merged: Transaction[]; added: number; skipped: number } {
  const seen = new Set(existing.flatMap(transactionDedupKeys));
  const merged = [...existing];
  let added = 0;
  let skipped = 0;
  for (const tx of incoming) {
    const keys = transactionDedupKeys(tx);
    if (keys.some((key) => seen.has(key))) {
      skipped++;
      continue;
    }
    keys.forEach((key) => seen.add(key));
    merged.push(tx);
    added++;
  }
  return { merged, added, skipped };
}

function transactionDedupKeys(tx: Transaction): string[] {
  const raw = {
    bookingDate: tx.bookingDate,
    valueDate: tx.valueDate,
    label: tx.rawLabel,
    amountCents: tx.amountCents,
    currency: tx.currency,
  };
  const keys = [
    canonicalRowKey(tx.bank, tx.accountId, raw),
    legacyRowHash(tx.bank, tx.accountId, raw),
  ];
  if (!tx.rowHash.startsWith("row:v2:")) keys.push(tx.rowHash);
  return keys;
}
