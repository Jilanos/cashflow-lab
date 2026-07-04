import type {
  Account,
  Category,
  CategoryRule,
  ForecastEvent,
  ImportBatch,
  RecurringRule,
  Transaction,
} from "./types";

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
