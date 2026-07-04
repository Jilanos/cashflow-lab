import type { BankParser, ParseResult } from "./types";
import { parseTabular } from "./tabular";

// Credit Agricole online exports vary, but the common CSV shape is a short
// preamble followed by a `;`-delimited table with French dates and either a
// single "Montant" column or split "Debit euros" / "Credit euros" columns.
export const creditAgricoleParser: BankParser = {
  bank: "credit_agricole",
  version: "ca-1",

  detect(text: string): boolean {
    const head = text.slice(0, 2000).toLowerCase();
    return (
      head.includes("credit agricole") ||
      head.includes("crédit agricole") ||
      (head.includes("debit euros") || head.includes("débit euros")) ||
      head.includes("credit euros") ||
      head.includes("crédit euros")
    );
  },

  parse(text: string): ParseResult {
    return parseTabular(
      text,
      {
        bookingDate: ["Date", "Date de comptabilisation", "Date operation", "Date de l'operation"],
        valueDate: ["Date de valeur", "Date valeur"],
        label: ["Libelle", "Libelle operation", "Libelle simplifie", "Intitule"],
        amount: ["Montant", "Montant euros"],
        debit: ["Debit euros", "Debit"],
        credit: ["Credit euros", "Credit"],
      },
      { currency: "EUR", balanceMarkers: ["solde"] },
    );
  },
};
