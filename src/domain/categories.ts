import type { Category, CategoryRule } from "./types";

/** Initial MVP categories agreed in the product brief. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_logement", name: "Logement", behavior: "spending" },
  { id: "cat_courses", name: "Courses", behavior: "spending" },
  { id: "cat_soirees", name: "Soirees", behavior: "spending" },
  { id: "cat_bricolage", name: "Bricolage", behavior: "spending" },
  { id: "cat_sante", name: "Sante", behavior: "spending" },
  { id: "cat_sport", name: "Sport", behavior: "spending" },
  { id: "cat_loisirs", name: "Loisirs", behavior: "spending" },
  { id: "cat_revenus", name: "Revenus", behavior: "income" },
  { id: "cat_transfert", name: "Virement interne", behavior: "transfer" },
  { id: "cat_autre", name: "Autre", behavior: "spending" },
];

/**
 * Starter rules. Ordered by `priority`; the first matching rule wins.
 * Users can edit, reorder, add, or remove rules — this is only a sensible seed.
 */
export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  { id: "r_loyer", pattern: "loyer", isRegex: false, priority: 10, targetCategoryId: "cat_logement" },
  { id: "r_edf", pattern: "edf", isRegex: false, priority: 10, targetCategoryId: "cat_logement" },
  { id: "r_carrefour", pattern: "carrefour", isRegex: false, priority: 20, targetCategoryId: "cat_courses" },
  { id: "r_leclerc", pattern: "leclerc", isRegex: false, priority: 20, targetCategoryId: "cat_courses" },
  { id: "r_lidl", pattern: "lidl", isRegex: false, priority: 20, targetCategoryId: "cat_courses" },
  { id: "r_leroymerlin", pattern: "leroy merlin", isRegex: false, priority: 30, targetCategoryId: "cat_bricolage" },
  { id: "r_pharma", pattern: "pharmacie", isRegex: false, priority: 40, targetCategoryId: "cat_sante" },
  { id: "r_decathlon", pattern: "decathlon", isRegex: false, priority: 50, targetCategoryId: "cat_sport" },
  { id: "r_salaire", pattern: "salaire", isRegex: false, priority: 5, targetCategoryId: "cat_revenus" },
  { id: "r_vir_interne", pattern: "virement interne", isRegex: false, priority: 1, targetCategoryId: "cat_transfert" },
];

export function categoryById(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]));
}
