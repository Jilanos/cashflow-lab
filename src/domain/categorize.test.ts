import { describe, expect, it } from "vitest";
import { categorize } from "./categorize";
import {
  DEFAULT_CATEGORY_RULES,
  mergeDefaultCategoryRules,
} from "./categories";
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

  it("routes expanded spending categories from common merchant labels", () => {
    const cases: [string, string][] = [
      ["PAIEMENT CB SNCF CONNECT", "cat_voyages"],
      ["PAIEMENT CB ZARA PARIS", "cat_habits"],
      ["PRLV NETFLIX.COM", "cat_abonnements"],
      ["PAIEMENT CB RESTAURANT LE CHENE", "cat_restos"],
      ["DON HELLOASSO ASSOCIATION", "cat_dons"],
      ["VIR LEETCHI CAGNOTTE ANNIVERSAIRE", "cat_cagnottes"],
      ["PAIEMENT CB LEROY MERLIN", "cat_travaux"],
      ["CARTE 27/01 Swile 561 rue George", "cat_restos"],
      ["Prélèvement GC RE FONDATION LE REFUGE", "cat_dons"],
      ["Prélèvement INSTITUT PASTEUR", "cat_dons"],
      ["CARTE 01/07 LA LOUVE PARIS", "cat_courses"],
      ["Virement émis VIR INST vers Maison Pigot", "cat_travaux"],
      ["PRLV Navigo Liberte + passe", "cat_voyages"],
      ["Virement émis Wero vers MARTIN - ANNIVERSAIRE", "cat_cagnottes"],
      ["Virement émis VIR INST vers Paul Mondou", "cat_transfert"],
    ];

    for (const [label, categoryId] of cases) {
      expect(categorize(label, DEFAULT_CATEGORY_RULES).categoryId).toBe(categoryId);
    }
  });

  it("migrates old default rules to their latest targets", () => {
    const migrated = mergeDefaultCategoryRules([
      { id: "r_leroymerlin", pattern: "leroy merlin", isRegex: false, priority: 30, targetCategoryId: "cat_bricolage" },
      { id: "custom", pattern: "librairie", isRegex: false, priority: 80, targetCategoryId: "cat_loisirs" },
    ]);

    expect(categorize("PAIEMENT CB LEROY MERLIN", migrated).categoryId).toBe("cat_travaux");
    expect(categorize("PAIEMENT CB LIBRAIRIE", migrated).categoryId).toBe("cat_loisirs");
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
