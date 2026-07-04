import { describe, expect, it } from "vitest";
import { categorize } from "./categorize";
import { DEFAULT_CATEGORY_RULES } from "./categories";
import type { CategoryRule } from "./types";

describe("categorize", () => {
  it("matches default rules case-insensitively", () => {
    expect(categorize("PAIEMENT CB CARREFOUR MARKET", DEFAULT_CATEGORY_RULES).categoryId).toBe("cat_courses");
    expect(categorize("PRLV LOYER FONCIA", DEFAULT_CATEGORY_RULES).categoryId).toBe("cat_logement");
    expect(categorize("VIREMENT SALAIRE DEMO SA", DEFAULT_CATEGORY_RULES).categoryId).toBe("cat_revenus");
  });

  it("returns no category when nothing matches", () => {
    expect(categorize("PAIEMENT CB LIBRAIRIE", DEFAULT_CATEGORY_RULES).categoryId).toBeUndefined();
  });

  it("respects priority ordering (lowest first)", () => {
    const rules: CategoryRule[] = [
      { id: "a", pattern: "market", isRegex: false, priority: 50, targetCategoryId: "cat_a" },
      { id: "b", pattern: "carrefour", isRegex: false, priority: 10, targetCategoryId: "cat_b" },
    ];
    expect(categorize("CARREFOUR MARKET", rules).categoryId).toBe("cat_b");
  });

  it("supports regex rules and ignores invalid patterns", () => {
    const rules: CategoryRule[] = [
      { id: "bad", pattern: "(unclosed", isRegex: true, priority: 1, targetCategoryId: "cat_x" },
      { id: "ok", pattern: "uber\\s?eats", isRegex: true, priority: 2, targetCategoryId: "cat_loisirs" },
    ];
    expect(categorize("PAIEMENT UBER EATS", rules).categoryId).toBe("cat_loisirs");
  });
});
