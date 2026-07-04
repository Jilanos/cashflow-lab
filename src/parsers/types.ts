import type { Bank, RawTransaction } from "../domain/types";

export interface ParseResult {
  rows: RawTransaction[];
  /** Closing balance if the export exposes one. */
  reportedBalanceCents?: number;
  reportedBalanceDate?: string;
  /** Rows that could not be parsed, kept for user review. */
  warnings: string[];
}

export interface BankParser {
  bank: Bank;
  version: string;
  /** Cheap heuristic: does this text look like an export from this bank? */
  detect(text: string): boolean;
  parse(text: string): ParseResult;
}
