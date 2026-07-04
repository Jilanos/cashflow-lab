// Deterministic, dependency-free helpers used for transaction deduplication.

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
 * Stable canonical row key for deduplication. This intentionally stores the
 * normalized source fields instead of a short hash, so deduplication does not
 * drop distinct rows because of a hash collision.
 */
export function rowHash(bank: Bank, accountId: string, raw: RawTransaction): string {
  return canonicalRowKey(bank, accountId, raw);
}

export function canonicalRowKey(bank: Bank, accountId: string, raw: RawTransaction): string {
  return `row:v2:${JSON.stringify(rowKeyParts(bank, accountId, raw))}`;
}

/** Legacy 32-bit key kept only to dedupe rows imported before v2 keys. */
export function legacyRowHash(bank: Bank, accountId: string, raw: RawTransaction): string {
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

function rowKeyParts(bank: Bank, accountId: string, raw: RawTransaction): unknown[] {
  return [
    bank,
    accountId,
    raw.bookingDate,
    raw.valueDate ?? "",
    raw.label.trim().toLowerCase().replace(/\s+/g, " "),
    raw.amountCents,
    raw.currency,
  ];
}
