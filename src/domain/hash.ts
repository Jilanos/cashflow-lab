// Deterministic, dependency-free string hash used for transaction row hashes.
// FNV-1a 32-bit rendered as hex. Stable across runs and environments, which is
// what deduplication across repeated imports needs.

export function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts to stay in integer range.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

import type { Bank, RawTransaction } from "./types";

/**
 * Row hash for deduplication. Two imports of the same underlying transaction
 * must produce the same hash, so it is built only from stable, source-derived
 * fields (bank, account, dates, label, amount) — never import metadata.
 */
export function rowHash(bank: Bank, accountId: string, raw: RawTransaction): string {
  const key = [
    bank,
    accountId,
    raw.bookingDate,
    raw.valueDate ?? "",
    raw.label.trim().toLowerCase().replace(/\s+/g, " "),
    raw.amountCents,
    raw.currency,
  ].join("|");
  return fnv1aHex(key);
}
