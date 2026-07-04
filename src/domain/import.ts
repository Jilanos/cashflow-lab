import { categorize } from "./categorize";
import { cleanLabel, guessMerchant } from "./labels";
import { rowHash } from "./hash";
import type {
  Account,
  CategoryRule,
  ImportBatch,
  RawTransaction,
  Transaction,
} from "./types";
import type { ParseResult } from "../parsers/types";

export interface BuildImportInput {
  account: Account;
  parseResult: ParseResult;
  fileName: string;
  importedAt: string; // ISO timestamp (passed in; keeps this pure/testable)
  parserVersion: string;
  rules: CategoryRule[];
}

export interface BuildImportOutput {
  batch: ImportBatch;
  transactions: Transaction[];
}

/**
 * Turn a parser result into a normalized import batch plus canonical
 * transactions: clean labels, guess merchants, apply category rules, and
 * compute stable row hashes for later deduplication.
 */
export function buildImport(input: BuildImportInput): BuildImportOutput {
  const { account, parseResult, fileName, importedAt, parserVersion, rules } = input;
  const batchId = `imp_${account.id}_${rowHash(account.bank, account.id, syntheticSeed(parseResult, fileName))}`;

  const transactions: Transaction[] = parseResult.rows.map((raw, i) => {
    const label = cleanLabel(raw.label);
    const { categoryId, merchant: ruleMerchant } = categorize(raw.label, rules);
    return {
      id: `${batchId}_${i}`,
      accountId: account.id,
      bank: account.bank,
      bookingDate: raw.bookingDate,
      valueDate: raw.valueDate,
      label,
      rawLabel: raw.label,
      merchant: ruleMerchant ?? guessMerchant(raw.label),
      amountCents: raw.amountCents,
      currency: raw.currency,
      categoryId,
      rowHash: rowHash(account.bank, account.id, raw),
      importBatchId: batchId,
    };
  });

  const batch: ImportBatch = {
    id: batchId,
    bank: account.bank,
    accountId: account.id,
    fileName,
    importedAt,
    parserVersion,
    rowCount: transactions.length,
    reportedBalanceCents: parseResult.reportedBalanceCents,
    reportedBalanceDate: parseResult.reportedBalanceDate,
  };

  return { batch, transactions };
}

// The batch id should be stable for the same file content so re-importing the
// exact same export is recognizable. Seed the hash from row extremes + count.
function syntheticSeed(parseResult: ParseResult, fileName: string): RawTransaction {
  const rows = parseResult.rows;
  const first = rows[0];
  const last = rows[rows.length - 1];
  return {
    bookingDate: first?.bookingDate ?? "0000-00-00",
    valueDate: last?.bookingDate ?? "",
    label: `${fileName}|${rows.length}`,
    amountCents: (first?.amountCents ?? 0) + (last?.amountCents ?? 0),
    currency: first?.currency ?? "EUR",
  };
}
