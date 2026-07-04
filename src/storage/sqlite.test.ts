import { describe, expect, it } from "vitest";
import initSqlJs from "sql.js";
import { initSchema, loadState, saveState } from "./sqlite";
import { emptyState } from "../domain/state";
import type { Account, Transaction } from "../domain/types";

const account: Account = { id: "acc1", bank: "fortuneo", type: "current", name: "Test", currency: "EUR" };
const tx: Transaction = {
  id: "t1",
  accountId: "acc1",
  bank: "fortuneo",
  bookingDate: "2024-03-06",
  label: "CARTE LIDL",
  rawLabel: "CARTE LIDL",
  merchant: "Lidl",
  amountCents: -4530,
  currency: "EUR",
  categoryId: "cat_courses",
  rowHash: "deadbeef",
  importBatchId: "imp1",
};

describe("sqlite storage roundtrip", () => {
  it("persists and reloads full state", async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    initSchema(db);

    const state = emptyState();
    state.accounts = [account];
    state.transactions = [tx];

    saveState(db, state);
    const bytes = db.export();

    // Reopen from exported bytes to simulate a browser reload.
    const db2 = new SQL.Database(bytes);
    const loaded = loadState(db2);

    expect(loaded.accounts).toEqual([account]);
    expect(loaded.transactions).toEqual([tx]);
    // Default categories/rules seeded and preserved.
    expect(loaded.categories.length).toBeGreaterThan(0);
    expect(loaded.categoryRules.length).toBeGreaterThan(0);
  });
});
