import type { Bank } from "../domain/types";
import { creditAgricoleParser } from "./creditAgricole";
import { fortuneoParser } from "./fortuneo";
import type { BankParser } from "./types";

// Registry of available bank parsers. LCL is intentionally absent until a real
// LCL export is provided; the pipeline stays bank-agnostic so it plugs in here
// without touching the canonical model.
export const PARSERS: BankParser[] = [creditAgricoleParser, fortuneoParser];

export function getParser(bank: Bank): BankParser | undefined {
  return PARSERS.find((p) => p.bank === bank);
}

/** Guess the source bank from file contents. Returns undefined if unsure. */
export function detectParser(text: string): BankParser | undefined {
  return PARSERS.find((p) => p.detect(text));
}

export * from "./types";
