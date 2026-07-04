import { describe, expect, it } from "vitest";
import { creditAgricoleParser } from "../parsers/creditAgricole";
import { fortuneoParser } from "../parsers/fortuneo";
import {
  CREDIT_AGRICOLE_SAMPLE,
  CREDIT_AGRICOLE_SAMPLE_OVERLAP,
  FORTUNEO_SAMPLE,
} from "../parsers/fixtures";
import { buildImport } from "./import";
import { mergeImport } from "./dedup";
import { detectInternalTransfers } from "./transfers";
import { summarizeMonth } from "./analysis";
import { computeBalances } from "./balances";
import { legacyRowHash } from "./hash";
import { DEFAULT_CATEGORIES, DEFAULT_CATEGORY_RULES, categoryById } from "./categories";
import type { Account } from "./types";

const caAccount: Account = { id: "acc_ca", bank: "credit_agricole", type: "current", name: "CA Courant", currency: "EUR" };
const ftAccount: Account = { id: "acc_ft", bank: "fortuneo", type: "current", name: "Fortuneo", currency: "EUR" };

function importCa(text: string, file: string) {
  return buildImport({
    account: caAccount,
    parseResult: creditAgricoleParser.parse(text),
    fileName: file,
    importedAt: "2024-04-01T10:00:00.000Z",
    parserVersion: creditAgricoleParser.version,
    rules: DEFAULT_CATEGORY_RULES,
  });
}

describe("import pipeline", () => {
  it("normalizes, categorizes, and hashes transactions", () => {
    const { transactions, batch } = importCa(CREDIT_AGRICOLE_SAMPLE, "ca_mars.csv");
    expect(transactions).toHaveLength(5);
    expect(batch.reportedBalanceCents).toBe(125040);
    const courses = transactions.find((t) => t.label.includes("CARREFOUR"))!;
    expect(courses.categoryId).toBe("cat_courses");
    expect(courses.merchant).toBeTruthy();
      expect(courses.rowHash).toContain("row:v2:");
  });

  it("deduplicates on re-import of overlapping rows", () => {
    const first = importCa(CREDIT_AGRICOLE_SAMPLE, "ca_mars.csv");
    const second = importCa(CREDIT_AGRICOLE_SAMPLE_OVERLAP, "ca_mars_v2.csv");
    const { merged, added, skipped } = mergeImport(first.transactions, second.transactions);
    // Overlap file shares LOYER + CARREFOUR, adds LEROY MERLIN.
    expect(added).toBe(1);
    expect(skipped).toBe(2);
    expect(merged).toHaveLength(6);
  });

  it("does not deduplicate distinct rows that share an old short hash", () => {
    const first = importCa(CREDIT_AGRICOLE_SAMPLE, "ca_mars.csv");
    const second = importCa(CREDIT_AGRICOLE_SAMPLE_OVERLAP, "ca_mars_v2.csv");
    const incoming = {
      ...second.transactions.find((t) => t.label.includes("LEROY MERLIN"))!,
      rowHash: first.transactions[0].rowHash,
    };
    const { merged, added, skipped } = mergeImport(first.transactions, [incoming]);

    expect(added).toBe(1);
    expect(skipped).toBe(0);
    expect(merged).toHaveLength(6);
  });

  it("deduplicates rows imported before canonical row keys", () => {
    const first = importCa(CREDIT_AGRICOLE_SAMPLE, "ca_mars.csv");
    const legacy = first.transactions.map((t) => ({
      ...t,
      rowHash: legacyRowHash(t.bank, t.accountId, {
        bookingDate: t.bookingDate,
        valueDate: t.valueDate,
        label: t.rawLabel,
        amountCents: t.amountCents,
        currency: t.currency,
      }),
    }));
    const second = importCa(CREDIT_AGRICOLE_SAMPLE, "ca_mars_again.csv");
    const { added, skipped } = mergeImport(legacy, second.transactions);

    expect(added).toBe(0);
    expect(skipped).toBe(5);
  });
});

describe("internal transfers", () => {
  it("pairs opposite legs across accounts and excludes them from spending", () => {
    const ca = importCa(CREDIT_AGRICOLE_SAMPLE, "ca.csv");
    const ft = buildImport({
      account: ftAccount,
      parseResult: fortuneoParser.parse(FORTUNEO_SAMPLE),
      fileName: "ft.csv",
      importedAt: "2024-04-01T10:00:00.000Z",
      parserVersion: fortuneoParser.version,
      rules: DEFAULT_CATEGORY_RULES,
    });
    const all = detectInternalTransfers([...ca.transactions, ...ft.transactions]);

    const grouped = all.filter((t) => t.transferGroupId);
    // The -200 on CA and +200 on Fortuneo should form one transfer pair.
    expect(grouped).toHaveLength(2);
    expect(grouped[0].transferGroupId).toBe(grouped[1].transferGroupId);

    const cats = categoryById(DEFAULT_CATEGORIES);
    const summary = summarizeMonth(all, "2024-03", {
      categories: cats,
      accountName: (id) => (id === caAccount.id ? "CA" : "FT"),
    });
    // Spending excludes salary (income), both transfer legs, keeps expenses.
    // CA expenses: loyer 540 + carrefour 82.15 + pharmacie 23.90 = 646.05
    // FT expenses: lidl 45.30 + decathlon 59.99 + edf 89 = 194.29
    expect(summary.totalSpendingCents).toBe(64605 + 19429);
    expect(summary.totalIncomeCents).toBe(230000);
    expect(summary.byCategory.find((b) => b.key === "cat_transfert")).toBeUndefined();
  });

  it("does not mark unrelated same-amount movements as internal transfers", () => {
    const txs = detectInternalTransfers([
      {
        id: "debit",
        accountId: "acc_ca",
        bank: "credit_agricole",
        bookingDate: "2024-03-10",
        label: "PAIEMENT CB HOTEL",
        rawLabel: "PAIEMENT CB HOTEL",
        amountCents: -20000,
        currency: "EUR",
        rowHash: "debit",
        importBatchId: "imp",
      },
      {
        id: "credit",
        accountId: "acc_ft",
        bank: "fortuneo",
        bookingDate: "2024-03-11",
        label: "REMBOURSEMENT AMI",
        rawLabel: "REMBOURSEMENT AMI",
        amountCents: 20000,
        currency: "EUR",
        rowHash: "credit",
        importBatchId: "imp",
      },
    ]);

    expect(txs.some((t) => t.transferGroupId)).toBe(false);
  });
});

describe("balances", () => {
  it("recalculates from transactions and prefers the reported balance", () => {
    const ca = importCa(CREDIT_AGRICOLE_SAMPLE, "ca.csv");
    const balances = computeBalances([caAccount], ca.transactions, [ca.batch]);
    const b = balances[0];
    // computed sum: -540 -82.15 +2300 -23.90 -200 = 1453.95
    expect(b.computedCents).toBe(145395);
    // reported balance from the export wins as effective.
    expect(b.effectiveCents).toBe(125040);
  });
});
