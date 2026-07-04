import { describe, expect, it } from "vitest";
import {
  addDays,
  budgetMonthRange,
  calendarMonthRange,
  containsDate,
  filterTransactions,
  quickRange,
  shiftPeriod,
} from "./period";
import { toPieSlices, type Bucket } from "./analysis";
import type { Category, Transaction } from "./types";

function tx(over: Partial<Transaction>): Transaction {
  return {
    id: over.id ?? "t",
    accountId: over.accountId ?? "acc1",
    bank: "lcl",
    bookingDate: over.bookingDate ?? "2024-03-10",
    label: over.label ?? "achat",
    rawLabel: over.rawLabel ?? over.label ?? "achat",
    merchant: over.merchant,
    amountCents: over.amountCents ?? -1000,
    currency: "EUR",
    categoryId: over.categoryId,
    rowHash: "h",
    importBatchId: "b",
    transferGroupId: over.transferGroupId,
  };
}

const categories = new Map<string, Category>([
  ["cat_courses", { id: "cat_courses", name: "Courses", behavior: "spending" }],
  ["cat_revenus", { id: "cat_revenus", name: "Revenus", behavior: "income" }],
  ["cat_transfert", { id: "cat_transfert", name: "Virement", behavior: "transfer" }],
]);

describe("date primitives", () => {
  it("adds days across month/year boundaries", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29"); // leap year
    expect(addDays("2023-02-28", 1)).toBe("2023-03-01"); // non-leap
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
    expect(addDays("2024-01-01", -1)).toBe("2023-12-31");
  });

  it("tests inclusive membership", () => {
    const r = { start: "2024-03-01", end: "2024-03-31" };
    expect(containsDate(r, "2024-03-01")).toBe(true);
    expect(containsDate(r, "2024-03-31")).toBe(true);
    expect(containsDate(r, "2024-02-29")).toBe(false);
    expect(containsDate(r, "2024-04-01")).toBe(false);
  });
});

describe("calendarMonthRange", () => {
  it("spans the whole month", () => {
    expect(calendarMonthRange("2024-02")).toEqual({ start: "2024-02-01", end: "2024-02-29" });
    expect(calendarMonthRange("2023-02")).toEqual({ start: "2023-02-01", end: "2023-02-28" });
    expect(calendarMonthRange("2024-04-15")).toEqual({ start: "2024-04-01", end: "2024-04-30" });
  });
});

describe("budgetMonthRange", () => {
  it("delimits a budget month by start day", () => {
    // 10 March with start day 28 -> the period that began 28 Feb.
    expect(budgetMonthRange("2024-03-10", 28)).toEqual({ start: "2024-02-28", end: "2024-03-27" });
    // 28 March itself starts a new period.
    expect(budgetMonthRange("2024-03-28", 28)).toEqual({ start: "2024-03-28", end: "2024-04-27" });
  });

  it("handles February when start day exceeds the month length", () => {
    // Start day clamped to 28 (max), so no month can be too short for it.
    expect(budgetMonthRange("2024-02-15", 31)).toEqual({ start: "2024-01-28", end: "2024-02-27" });
  });

  it("produces contiguous non-overlapping ranges across a boundary", () => {
    const a = budgetMonthRange("2024-01-15", 28);
    const b = budgetMonthRange("2024-02-15", 28);
    expect(addDays(a.end, 1)).toBe(b.start);
  });

  it("wraps year boundaries", () => {
    expect(budgetMonthRange("2024-01-05", 28)).toEqual({ start: "2023-12-28", end: "2024-01-27" });
  });
});

describe("shiftPeriod & quickRange", () => {
  const opts = { mode: "budget" as const, budgetStartDay: 28 };

  it("shifts to previous and next periods", () => {
    const cur = budgetMonthRange("2024-03-10", 28);
    expect(shiftPeriod(cur, -1, "budget", 28)).toEqual({ start: "2024-01-28", end: "2024-02-27" });
    expect(shiftPeriod(cur, 1, "budget", 28)).toEqual({ start: "2024-03-28", end: "2024-04-27" });
    expect(shiftPeriod(cur, -2, "budget", 28)).toEqual({ start: "2023-12-28", end: "2024-01-27" });
  });

  it("resolves presets against an anchor", () => {
    expect(quickRange("current", "2024-03-10", opts)).toEqual({ start: "2024-02-28", end: "2024-03-27" });
    expect(quickRange("previous", "2024-03-10", opts)).toEqual({ start: "2024-01-28", end: "2024-02-27" });
    expect(quickRange("last3", "2024-03-10", opts)).toEqual({ start: "2023-12-28", end: "2024-03-27" });
    expect(quickRange("ytd", "2024-03-10", opts)).toEqual({ start: "2024-01-01", end: "2024-03-10" });
    expect(quickRange("custom", "2024-03-10", opts)).toBeNull();
    expect(quickRange("custom", "2024-03-10", { ...opts, custom: { start: "a", end: "b" } })).toEqual({
      start: "a",
      end: "b",
    });
  });
});

describe("filterTransactions", () => {
  const txs = [
    tx({ id: "1", bookingDate: "2024-03-05", label: "Carrefour", merchant: "Carrefour", categoryId: "cat_courses", amountCents: -3000 }),
    tx({ id: "2", bookingDate: "2024-03-20", label: "Salaire", categoryId: "cat_revenus", amountCents: 200000 }),
    tx({ id: "3", bookingDate: "2024-04-02", label: "Amazon", merchant: "Amazon", amountCents: -1500 }),
    tx({ id: "4", bookingDate: "2024-03-10", label: "Virement interne", categoryId: "cat_transfert", transferGroupId: "g1", amountCents: -5000 }),
  ];

  it("filters by range (inclusive)", () => {
    const out = filterTransactions(txs, { range: { start: "2024-03-01", end: "2024-03-31" } }, categories);
    expect(out.map((t) => t.id)).toEqual(["1", "2", "4"]);
  });

  it("combines type + text filters", () => {
    const out = filterTransactions(txs, { type: "spending", text: "carre" }, categories);
    expect(out.map((t) => t.id)).toEqual(["1"]);
  });

  it("filters income and excludes transfers", () => {
    expect(filterTransactions(txs, { type: "income" }, categories).map((t) => t.id)).toEqual(["2"]);
    expect(filterTransactions(txs, { type: "spending" }, categories).map((t) => t.id)).toEqual(["1", "3"]);
  });

  it("filters by categorized status and category/account", () => {
    expect(filterTransactions(txs, { categorized: "uncategorized" }, categories).map((t) => t.id)).toEqual(["3"]);
    expect(filterTransactions(txs, { categoryIds: ["cat_courses"] }, categories).map((t) => t.id)).toEqual(["1"]);
    expect(filterTransactions(txs, { accountIds: ["acc1"] }, categories)).toHaveLength(4);
    expect(filterTransactions(txs, { accountIds: ["other"] }, categories)).toHaveLength(0);
  });

  it("returns everything when filters are empty", () => {
    expect(filterTransactions(txs, {}, categories)).toHaveLength(4);
    expect(filterTransactions(txs, { categoryIds: [] }, categories)).toHaveLength(4);
  });
});

describe("toPieSlices", () => {
  const b = (key: string, amountCents: number): Bucket => ({ key, label: key, amountCents, count: 1 });

  it("computes fractions summing to 1", () => {
    const slices = toPieSlices([b("a", 75), b("b", 25)]);
    expect(slices.map((s) => s.fraction)).toEqual([0.75, 0.25]);
  });

  it("collapses the tail into Autres", () => {
    const buckets = [b("a", 40), b("b", 30), b("c", 20), b("d", 10)];
    const slices = toPieSlices(buckets, 2);
    expect(slices.map((s) => s.key)).toEqual(["a", "b", "__autres__"]);
    expect(slices[2].amountCents).toBe(30);
  });

  it("returns no slices for an empty/zero total", () => {
    expect(toPieSlices([])).toEqual([]);
    expect(toPieSlices([b("a", 0)])).toEqual([]);
  });
});
