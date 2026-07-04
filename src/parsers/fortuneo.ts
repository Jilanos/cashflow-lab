import type { BankParser, ParseResult } from "./types";
import { parseTabular } from "./tabular";

// Fortuneo CSV exports use a `;` delimiter with columns
// "Date operation;Date valeur;libelle;Debit;Credit" (French dates, split
// debit/credit). Some exports use a single "Montant" column instead.
export const fortuneoParser: BankParser = {
  bank: "fortuneo",
  version: "fortuneo-1",

  detect(text: string): boolean {
    const head = text.slice(0, 2000).toLowerCase();
    if (head.includes("fortuneo")) return true;
    // Signature header combination used by Fortuneo current-account exports.
    return (
      (head.includes("date operation") || head.includes("date opération")) &&
      head.includes("date valeur")
    );
  },

  parse(text: string): ParseResult {
    return parseTabular(
      text,
      {
        bookingDate: ["Date operation", "Date de l'operation", "Date"],
        valueDate: ["Date valeur", "Date de valeur"],
        label: ["libelle", "Libelle", "Intitule"],
        amount: ["Montant", "Montant operation"],
        debit: ["Debit"],
        credit: ["Credit"],
      },
      { currency: "EUR", balanceMarkers: ["solde"] },
    );
  },
};
