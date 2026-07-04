// Canonical domain model for Cashflow Lab.
// All monetary amounts are stored as integer cents to avoid float drift.
// Signed convention: negative = money leaving the account (expense / debit),
// positive = money entering (income / credit).

export type Bank = "credit_agricole" | "lcl" | "fortuneo";

export type AccountType = "current" | "card" | "livret_a" | "ldds";

export interface Account {
  id: string;
  bank: Bank;
  type: AccountType;
  name: string;
  currency: string; // ISO 4217, e.g. "EUR"
}

/** A category behavior drives how a transaction is treated in analysis. */
export type CategoryBehavior = "spending" | "income" | "transfer";

export interface Category {
  id: string;
  name: string;
  behavior: CategoryBehavior;
  parentId?: string;
}

/** A raw row as produced by a bank parser, before normalization. */
export interface RawTransaction {
  /** ISO date (YYYY-MM-DD) of the booking date. */
  bookingDate: string;
  /** Optional ISO value date. */
  valueDate?: string;
  /** Original label from the export. */
  label: string;
  /** Signed amount in integer cents. */
  amountCents: number;
  currency: string;
}

/** A normalized, deduplicated transaction attached to an account. */
export interface Transaction {
  id: string;
  accountId: string;
  bank: Bank;
  bookingDate: string; // YYYY-MM-DD
  valueDate?: string;
  label: string; // cleaned label
  rawLabel: string; // original label as imported
  merchant?: string;
  amountCents: number; // signed, integer cents
  currency: string;
  categoryId?: string;
  /** Stable hash of the source row, used for cross-import deduplication. */
  rowHash: string;
  importBatchId: string;
  /** Group id shared by both legs of a detected internal transfer. */
  transferGroupId?: string;
}

export interface ImportBatch {
  id: string;
  bank: Bank;
  accountId: string;
  fileName: string;
  importedAt: string; // ISO timestamp
  parserVersion: string;
  rowCount: number;
  /** Closing balance parsed from the export, if the format provides one. */
  reportedBalanceCents?: number;
  reportedBalanceDate?: string;
}

export type Cadence = "monthly" | "quarterly" | "yearly" | "weekly";

export interface RecurringRule {
  id: string;
  accountId: string;
  label: string;
  categoryId?: string;
  amountCents: number; // signed
  cadence: Cadence;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
}

export interface ForecastEvent {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  label: string;
  amountCents: number; // signed
  categoryId?: string;
}

export interface CategoryRule {
  id: string;
  /** Case-insensitive substring or regex source matched against the label. */
  pattern: string;
  isRegex: boolean;
  priority: number; // lower runs first
  targetCategoryId: string;
  /** Optional normalized merchant name to attach when the rule matches. */
  merchant?: string;
}
