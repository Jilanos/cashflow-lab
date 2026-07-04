import type { CategoryRule } from "./types";

export interface CategorizeResult {
  categoryId?: string;
  merchant?: string;
}

/**
 * Apply category rules to a label. Rules are evaluated in ascending priority;
 * the first match wins. Matching is case-insensitive. Regex rules with an
 * invalid pattern are skipped rather than throwing.
 */
export function categorize(label: string, rules: CategoryRule[]): CategorizeResult {
  const haystack = normalizeForMatch(label);
  const ordered = [...rules].sort((a, b) => a.priority - b.priority);
  for (const rule of ordered) {
    if (matches(haystack, rule)) {
      return { categoryId: rule.targetCategoryId, merchant: rule.merchant };
    }
  }
  return {};
}

function matches(haystack: string, rule: CategoryRule): boolean {
  const pattern = normalizeForMatch(rule.pattern);
  if (rule.isRegex) {
    try {
      return new RegExp(pattern, "i").test(haystack);
    } catch {
      return false;
    }
  }
  return haystack.includes(pattern);
}

function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
