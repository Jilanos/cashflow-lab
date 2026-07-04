import { describe, expect, it } from "vitest";
import { forecast, occurrencesInMonth } from "./forecast";
import type { ForecastEvent, RecurringRule } from "./types";

const salary: RecurringRule = {
  id: "r_sal",
  accountId: "acc",
  label: "Salaire",
  amountCents: 250000,
  cadence: "monthly",
  startDate: "2024-01-01",
};
const rent: RecurringRule = {
  id: "r_rent",
  accountId: "acc",
  label: "Loyer",
  amountCents: -90000,
  cadence: "monthly",
  startDate: "2024-01-01",
};

describe("occurrencesInMonth", () => {
  it("fires monthly rules every month within range", () => {
    expect(occurrencesInMonth(salary, "2024-05")).toBe(1);
  });
  it("respects start and end dates", () => {
    const r = { ...salary, startDate: "2024-03-01", endDate: "2024-06-30" };
    expect(occurrencesInMonth(r, "2024-02")).toBe(0);
    expect(occurrencesInMonth(r, "2024-07")).toBe(0);
    expect(occurrencesInMonth(r, "2024-05")).toBe(1);
  });
  it("fires quarterly and yearly on the right offsets", () => {
    const q: RecurringRule = { ...salary, cadence: "quarterly", startDate: "2024-01-01" };
    expect(occurrencesInMonth(q, "2024-01")).toBe(1);
    expect(occurrencesInMonth(q, "2024-02")).toBe(0);
    expect(occurrencesInMonth(q, "2024-04")).toBe(1);
    const y: RecurringRule = { ...salary, cadence: "yearly", startDate: "2024-02-01" };
    expect(occurrencesInMonth(y, "2025-02")).toBe(1);
    expect(occurrencesInMonth(y, "2024-03")).toBe(0);
  });
  it("counts weekly occurrences inside a month", () => {
    const w: RecurringRule = { ...salary, cadence: "weekly", startDate: "2024-03-01" };
    // Mar 1, 8, 15, 22, 29 -> 5 occurrences in March 2024.
    expect(occurrencesInMonth(w, "2024-03")).toBe(5);
  });
});

describe("forecast", () => {
  it("projects net cashflow and rolls balances forward", () => {
    const result = forecast({
      startMonth: "2024-04",
      horizonMonths: 3,
      openingBalances: { acc: 100000 },
      recurringRules: [salary, rent],
      events: [],
    });
    expect(result.months).toHaveLength(3);
    const first = result.months[0];
    expect(first.inflowCents).toBe(250000);
    expect(first.outflowCents).toBe(90000);
    expect(first.netCents).toBe(160000);
    // opening 1000 + net 1600 = 2600
    expect(first.endBalanceCents).toBe(260000);
    // third month: 1000 + 3*1600 = 5800
    expect(result.months[2].endBalanceCents).toBe(580000);
  });

  it("clamps the horizon to 3..12 months and applies one-off events", () => {
    const event: ForecastEvent = { id: "e", accountId: "acc", date: "2024-04-15", label: "Impots", amountCents: -120000 };
    const result = forecast({
      startMonth: "2024-04",
      horizonMonths: 24,
      openingBalances: { acc: 0 },
      recurringRules: [],
      events: [event],
    });
    expect(result.months).toHaveLength(12);
    expect(result.months[0].netCents).toBe(-120000);
    expect(result.months[1].netCents).toBe(0);
  });
});
