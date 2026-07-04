import type {
  Account,
  Category,
  CategoryRule,
  ForecastEvent,
  ImportBatch,
  RecurringRule,
  Transaction,
} from "./types";
import type { AppState } from "./state";
import { withDefaultTaxonomy } from "./state";

export interface Backup {
  version: 1;
  exportedAt: string;
  accounts: Account[];
  categories: Category[];
  categoryRules: CategoryRule[];
  transactions: Transaction[];
  batches: ImportBatch[];
  recurringRules: RecurringRule[];
  events: ForecastEvent[];
}

export function buildBackup(data: Omit<Backup, "version" | "exportedAt">, exportedAt: string): Backup {
  return { version: 1, exportedAt, ...data };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2);
}

export function parseBackupJson(text: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Sauvegarde JSON illisible.");
  }
  return validateBackup(parsed);
}

export function validateBackup(value: unknown): AppState {
  if (!isRecord(value)) throw new Error("Sauvegarde invalide: objet attendu.");
  if (value.version !== 1) throw new Error("Sauvegarde invalide: version non supportee.");

  const state: AppState = {
    accounts: expectArray<Account>(value, "accounts"),
    categories: expectArray<Category>(value, "categories"),
    categoryRules: expectArray<CategoryRule>(value, "categoryRules"),
    transactions: expectArray<Transaction>(value, "transactions"),
    batches: expectArray<ImportBatch>(value, "batches"),
    recurringRules: expectArray<RecurringRule>(value, "recurringRules"),
    events: expectArray<ForecastEvent>(value, "events"),
  };

  for (const account of state.accounts) {
    if (!isRecord(account) || typeof account.id !== "string" || typeof account.name !== "string") {
      throw new Error("Sauvegarde invalide: compte mal forme.");
    }
  }
  for (const tx of state.transactions) {
    if (
      !isRecord(tx) ||
      typeof tx.id !== "string" ||
      typeof tx.accountId !== "string" ||
      typeof tx.bookingDate !== "string" ||
      typeof tx.amountCents !== "number"
    ) {
      throw new Error("Sauvegarde invalide: transaction mal formee.");
    }
  }

  return withDefaultTaxonomy(state);
}

/** Export normalized transactions as CSV (safe to share; no bank credentials). */
export function transactionsToCsv(transactions: Transaction[], categoryName: (id?: string) => string): string {
  const header = [
    "id",
    "compte",
    "banque",
    "date",
    "date_valeur",
    "libelle",
    "marchand",
    "montant_eur",
    "devise",
    "categorie",
    "virement_interne",
  ];
  const escape = (v: string): string => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = transactions.map((t) =>
    [
      t.id,
      t.accountId,
      t.bank,
      t.bookingDate,
      t.valueDate ?? "",
      t.label,
      t.merchant ?? "",
      (t.amountCents / 100).toFixed(2),
      t.currency,
      categoryName(t.categoryId),
      t.transferGroupId ? "oui" : "non",
    ]
      .map((c) => escape(String(c)))
      .join(";"),
  );
  return [header.join(";"), ...lines].join("\n");
}

function expectArray<T>(record: Record<string, unknown>, key: string): T[] {
  const value = record[key];
  if (!Array.isArray(value)) throw new Error(`Sauvegarde invalide: champ ${key} manquant.`);
  return value as T[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
