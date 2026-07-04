import type { Database } from "sql.js";
import { SCHEMA_SQL } from "./schema";
import type { AppState } from "../domain/state";
import { emptyState } from "../domain/state";
import type {
  Account,
  Category,
  CategoryRule,
  ForecastEvent,
  ImportBatch,
  RecurringRule,
  Transaction,
} from "../domain/types";

interface TableSpec<T> {
  table: string;
  columns: string[];
  toRow: (item: T) => unknown[];
  fromRow: (row: Record<string, unknown>) => T;
}

const bool = (v: unknown): boolean => v === 1 || v === true || v === "1";
const opt = (v: unknown): string | undefined => (v == null || v === "" ? undefined : String(v));
const num = (v: unknown): number => Number(v ?? 0);
const optNum = (v: unknown): number | undefined => (v == null ? undefined : Number(v));

const accounts: TableSpec<Account> = {
  table: "accounts",
  columns: ["id", "bank", "type", "name", "currency"],
  toRow: (a) => [a.id, a.bank, a.type, a.name, a.currency],
  fromRow: (r) => ({ id: String(r.id), bank: r.bank as Account["bank"], type: r.type as Account["type"], name: String(r.name), currency: String(r.currency) }),
};

const categories: TableSpec<Category> = {
  table: "categories",
  columns: ["id", "name", "behavior", "parentId"],
  toRow: (c) => [c.id, c.name, c.behavior, c.parentId ?? null],
  fromRow: (r) => ({ id: String(r.id), name: String(r.name), behavior: r.behavior as Category["behavior"], parentId: opt(r.parentId) }),
};

const categoryRules: TableSpec<CategoryRule> = {
  table: "category_rules",
  columns: ["id", "pattern", "isRegex", "priority", "targetCategoryId", "merchant"],
  toRow: (r) => [r.id, r.pattern, r.isRegex ? 1 : 0, r.priority, r.targetCategoryId, r.merchant ?? null],
  fromRow: (r) => ({ id: String(r.id), pattern: String(r.pattern), isRegex: bool(r.isRegex), priority: num(r.priority), targetCategoryId: String(r.targetCategoryId), merchant: opt(r.merchant) }),
};

const batches: TableSpec<ImportBatch> = {
  table: "batches",
  columns: ["id", "bank", "accountId", "fileName", "importedAt", "parserVersion", "rowCount", "reportedBalanceCents", "reportedBalanceDate"],
  toRow: (b) => [b.id, b.bank, b.accountId, b.fileName, b.importedAt, b.parserVersion, b.rowCount, b.reportedBalanceCents ?? null, b.reportedBalanceDate ?? null],
  fromRow: (r) => ({ id: String(r.id), bank: r.bank as ImportBatch["bank"], accountId: String(r.accountId), fileName: String(r.fileName), importedAt: String(r.importedAt), parserVersion: String(r.parserVersion), rowCount: num(r.rowCount), reportedBalanceCents: optNum(r.reportedBalanceCents), reportedBalanceDate: opt(r.reportedBalanceDate) }),
};

const transactions: TableSpec<Transaction> = {
  table: "transactions",
  columns: ["id", "accountId", "bank", "bookingDate", "valueDate", "label", "rawLabel", "merchant", "amountCents", "currency", "categoryId", "rowHash", "importBatchId", "transferGroupId"],
  toRow: (t) => [t.id, t.accountId, t.bank, t.bookingDate, t.valueDate ?? null, t.label, t.rawLabel, t.merchant ?? null, t.amountCents, t.currency, t.categoryId ?? null, t.rowHash, t.importBatchId, t.transferGroupId ?? null],
  fromRow: (r) => ({ id: String(r.id), accountId: String(r.accountId), bank: r.bank as Transaction["bank"], bookingDate: String(r.bookingDate), valueDate: opt(r.valueDate), label: String(r.label), rawLabel: String(r.rawLabel), merchant: opt(r.merchant), amountCents: num(r.amountCents), currency: String(r.currency), categoryId: opt(r.categoryId), rowHash: String(r.rowHash), importBatchId: String(r.importBatchId), transferGroupId: opt(r.transferGroupId) }),
};

const recurringRules: TableSpec<RecurringRule> = {
  table: "recurring_rules",
  columns: ["id", "accountId", "label", "categoryId", "amountCents", "cadence", "startDate", "endDate"],
  toRow: (r) => [r.id, r.accountId, r.label, r.categoryId ?? null, r.amountCents, r.cadence, r.startDate, r.endDate ?? null],
  fromRow: (r) => ({ id: String(r.id), accountId: String(r.accountId), label: String(r.label), categoryId: opt(r.categoryId), amountCents: num(r.amountCents), cadence: r.cadence as RecurringRule["cadence"], startDate: String(r.startDate), endDate: opt(r.endDate) }),
};

const events: TableSpec<ForecastEvent> = {
  table: "events",
  columns: ["id", "accountId", "date", "label", "amountCents", "categoryId"],
  toRow: (e) => [e.id, e.accountId, e.date, e.label, e.amountCents, e.categoryId ?? null],
  fromRow: (r) => ({ id: String(r.id), accountId: String(r.accountId), date: String(r.date), label: String(r.label), amountCents: num(r.amountCents), categoryId: opt(r.categoryId) }),
};

export function initSchema(db: Database): void {
  db.run(SCHEMA_SQL);
}

function replaceAll<T>(db: Database, spec: TableSpec<T>, items: T[]): void {
  db.run(`DELETE FROM ${spec.table}`);
  if (items.length === 0) return;
  const placeholders = spec.columns.map(() => "?").join(", ");
  const stmt = db.prepare(`INSERT INTO ${spec.table} (${spec.columns.join(", ")}) VALUES (${placeholders})`);
  try {
    for (const item of items) {
      stmt.run(spec.toRow(item) as never);
    }
  } finally {
    stmt.free();
  }
}

function readAll<T>(db: Database, spec: TableSpec<T>): T[] {
  const stmt = db.prepare(`SELECT ${spec.columns.join(", ")} FROM ${spec.table}`);
  const out: T[] = [];
  try {
    while (stmt.step()) {
      out.push(spec.fromRow(stmt.getAsObject() as Record<string, unknown>));
    }
  } finally {
    stmt.free();
  }
  return out;
}

/** Persist the entire application state into the SQLite database. */
export function saveState(db: Database, state: AppState): void {
  db.run("BEGIN");
  try {
    replaceAll(db, accounts, state.accounts);
    replaceAll(db, categories, state.categories);
    replaceAll(db, categoryRules, state.categoryRules);
    replaceAll(db, batches, state.batches);
    replaceAll(db, transactions, state.transactions);
    replaceAll(db, recurringRules, state.recurringRules);
    replaceAll(db, events, state.events);
    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
}

/** Load the entire application state from the SQLite database. */
export function loadState(db: Database): AppState {
  const base = emptyState();
  const loaded: AppState = {
    accounts: readAll(db, accounts),
    categories: readAll(db, categories),
    categoryRules: readAll(db, categoryRules),
    batches: readAll(db, batches),
    transactions: readAll(db, transactions),
    recurringRules: readAll(db, recurringRules),
    events: readAll(db, events),
  };
  // Seed defaults on a fresh database.
  if (loaded.categories.length === 0) loaded.categories = base.categories;
  if (loaded.categoryRules.length === 0) loaded.categoryRules = base.categoryRules;
  return loaded;
}
