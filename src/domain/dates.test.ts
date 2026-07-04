import { describe, expect, it } from "vitest";
import { parseDateToIso, monthKey, addMonths, isInMonth } from "./dates";

describe("parseDateToIso", () => {
  it("parses DD/MM/YYYY", () => {
    expect(parseDateToIso("07/03/2024")).toBe("2024-03-07");
  });
  it("parses DD-MM-YY and DD.MM.YYYY", () => {
    expect(parseDateToIso("07-03-24")).toBe("2024-03-07");
    expect(parseDateToIso("31.12.2023")).toBe("2023-12-31");
  });
  it("passes through ISO", () => {
    expect(parseDateToIso("2024-03-07")).toBe("2024-03-07");
  });
  it("rejects invalid dates", () => {
    expect(parseDateToIso("32/01/2024")).toBeNull();
    expect(parseDateToIso("07/13/2024")).toBeNull();
    expect(parseDateToIso("not a date")).toBeNull();
  });
});

describe("month helpers", () => {
  it("computes month keys and offsets", () => {
    expect(monthKey("2024-03-07")).toBe("2024-03");
    expect(addMonths("2024-11", 3)).toBe("2025-02");
    expect(addMonths("2024-01", -2)).toBe("2023-11");
    expect(isInMonth("2024-03-31", "2024-03")).toBe(true);
    expect(isInMonth("2024-04-01", "2024-03")).toBe(false);
  });
});
