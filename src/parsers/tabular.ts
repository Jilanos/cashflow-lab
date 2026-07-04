import { parseAmountToCents } from "../domain/money";
import { parseDateToIso } from "../domain/dates";
import type { RawTransaction } from "../domain/types";
import { detectDelimiter, parseCsv } from "./csv";
import type { ParseResult } from "./types";

function norm(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop accents
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Column-name candidates (already accent-stripped) for each logical field. */
export interface ColumnSpec {
  bookingDate: string[];
  valueDate?: string[];
  label: string[];
  amount?: string[]; // single signed column
  debit?: string[]; // separate debit column (stored as negative)
  credit?: string[]; // separate credit column (stored as positive)
}

export interface TabularOptions {
  currency?: string;
  balanceMarkers?: string[]; // lines like "solde" carrying a closing balance
}

/**
 * Parse a bank export whose transactions live in a delimited table preceded by
 * an optional preamble. Locates the header row by matching known column names,
 * then maps each data row to a {@link RawTransaction}.
 */
export function parseTabular(
  text: string,
  spec: ColumnSpec,
  options: TabularOptions = {},
): ParseResult {
  const currency = options.currency ?? "EUR";
  const delimiter = detectDelimiter(text);
  const grid = parseCsv(text, delimiter);
  const warnings: string[] = [];

  // Scan the whole grid (preamble included) for a reported closing balance.
  let reportedBalanceCents: number | undefined;
  let reportedBalanceDate: string | undefined;
  if (options.balanceMarkers?.length) {
    for (const cells of grid) {
      const joined = cells.join(" ");
      if (!options.balanceMarkers.some((m) => norm(joined).includes(norm(m)))) continue;
      const amounts = cells.map(parseAmountToCents).filter((v): v is number => v != null);
      if (amounts.length === 0) continue;
      reportedBalanceCents = amounts[amounts.length - 1];
      const dateMatch = /\b\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/.exec(joined);
      reportedBalanceDate = dateMatch ? parseDateToIso(dateMatch[0]) ?? undefined : undefined;
      break;
    }
  }

  const headerIdx = findHeaderRow(grid, spec);
  if (headerIdx === -1) {
    return {
      rows: [],
      reportedBalanceCents,
      reportedBalanceDate,
      warnings: ["Impossible de localiser l'en-tete des colonnes."],
    };
  }
  const header = grid[headerIdx].map(norm);
  const col = (candidates?: string[]): number => {
    if (!candidates) return -1;
    for (const c of candidates) {
      const idx = header.indexOf(norm(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const iDate = col(spec.bookingDate);
  const iValue = col(spec.valueDate);
  const iLabel = col(spec.label);
  const iAmount = col(spec.amount);
  const iDebit = col(spec.debit);
  const iCredit = col(spec.credit);

  const rows: RawTransaction[] = [];

  for (let r = headerIdx + 1; r < grid.length; r++) {
    const cells = grid[r];
    const joined = cells.join(" ").trim();
    if (joined === "") continue;

    // Skip balance/summary lines interleaved with transactions.
    if (options.balanceMarkers?.some((m) => norm(joined).includes(norm(m)))) {
      continue;
    }

    const bookingDate = iDate >= 0 ? parseDateToIso(cells[iDate] ?? "") : null;
    if (!bookingDate) continue; // not a transaction row

    let amountCents: number | null = null;
    if (iAmount >= 0) {
      amountCents = parseAmountToCents(cells[iAmount] ?? "");
    } else {
      const debit = iDebit >= 0 ? parseAmountToCents(cells[iDebit] ?? "") : null;
      const credit = iCredit >= 0 ? parseAmountToCents(cells[iCredit] ?? "") : null;
      if (debit != null && debit !== 0) amountCents = -Math.abs(debit);
      else if (credit != null && credit !== 0) amountCents = Math.abs(credit);
    }
    if (amountCents == null) {
      warnings.push(`Ligne ${r + 1}: montant illisible (${joined}).`);
      continue;
    }

    const label = (iLabel >= 0 ? cells[iLabel] : "").trim() || "(sans libelle)";
    const valueDate = iValue >= 0 ? parseDateToIso(cells[iValue] ?? "") ?? undefined : undefined;

    rows.push({ bookingDate, valueDate, label, amountCents, currency });
  }

  return { rows, reportedBalanceCents, reportedBalanceDate, warnings };
}

function findHeaderRow(grid: string[][], spec: ColumnSpec): number {
  const need = spec.bookingDate.map(norm);
  const amountNames = [
    ...(spec.amount ?? []),
    ...(spec.debit ?? []),
    ...(spec.credit ?? []),
  ].map(norm);
  for (let i = 0; i < grid.length; i++) {
    const cells = grid[i].map(norm);
    const hasDate = cells.some((c) => need.includes(c));
    const hasAmount = cells.some((c) => amountNames.includes(c));
    if (hasDate && hasAmount) return i;
  }
  return -1;
}
