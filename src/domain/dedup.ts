import type { Transaction } from "./types";

/**
 * Deduplicate transactions by their row hash. Re-importing the same file, or an
 * overlapping export window, must not create duplicates. The first occurrence
 * wins so existing ids/categories are preserved.
 */
export function dedupeByRowHash(transactions: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  const out: Transaction[] = [];
  for (const tx of transactions) {
    if (seen.has(tx.rowHash)) continue;
    seen.add(tx.rowHash);
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
  const seen = new Set(existing.map((t) => t.rowHash));
  const merged = [...existing];
  let added = 0;
  let skipped = 0;
  for (const tx of incoming) {
    if (seen.has(tx.rowHash)) {
      skipped++;
      continue;
    }
    seen.add(tx.rowHash);
    merged.push(tx);
    added++;
  }
  return { merged, added, skipped };
}
