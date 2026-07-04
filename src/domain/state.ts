import type {
  Account,
  Category,
  CategoryRule,
  ForecastEvent,
  ImportBatch,
  RecurringRule,
  Transaction,
} from "./types";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_RULES,
  mergeDefaultCategories,
  mergeDefaultCategoryRules,
} from "./categories";

/** The full persisted application state. */
export interface AppState {
  accounts: Account[];
  categories: Category[];
  categoryRules: CategoryRule[];
  transactions: Transaction[];
  batches: ImportBatch[];
  recurringRules: RecurringRule[];
  events: ForecastEvent[];
}

export function emptyState(): AppState {
  return {
    accounts: [],
    categories: [...DEFAULT_CATEGORIES],
    categoryRules: [...DEFAULT_CATEGORY_RULES],
    transactions: [],
    batches: [],
    recurringRules: [],
    events: [],
  };
}

export function withDefaultTaxonomy(state: AppState): AppState {
  return {
    ...state,
    categories: mergeDefaultCategories(state.categories),
    categoryRules: mergeDefaultCategoryRules(state.categoryRules),
  };
}
