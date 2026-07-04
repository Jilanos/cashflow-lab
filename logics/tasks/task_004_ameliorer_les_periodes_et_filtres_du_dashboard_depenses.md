## task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses - Ameliorer les periodes et filtres du dashboard depenses
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] A shared period/filter engine drives dashboard totals, buckets, charts and transaction table.
- [ ] Calendar month and configurable budget month are available.
- [ ] Quick ranges and custom date range are available.
- [ ] Category/account/type/text/categorized filters are available and combinable.
- [ ] Pie charts are shown for category, account and merchant distribution.
- [ ] Domain tests and validation commands pass.

# Backlog
- `item_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`

# Acceptance criteria
- AC1: Add a domain `DateRange`/period model with inclusive start/end ISO dates and tests.
- AC2: Add budget-month range calculation with configurable start day; test boundary cases around the 28/29/30/31 and February.
- AC3: Replace `summarizeMonth` dashboard usage with period-based summarization/filtering while preserving monthly behavior when calendar month is selected.
- AC4: Add quick range presets: current period, previous period, last 3 months, year to date, custom.
- AC5: Add dashboard filters for category, account, transaction type, free-text label/merchant, and categorized status.
- AC6: Add pie-chart data generation and UI for category/account/top merchants using the same filtered spending set.
- AC7: Ensure empty states, no-overlap ranges, and no-category filters behave predictably.

# Implementation plan
1. Domain period/filter engine:
   - Add functions for `calendarMonthRange`, `budgetMonthRange`, `quickRange`, `containsDate`, and `filterTransactions`.
   - Add `summarizePeriod` or adapt `summarizeMonth` so period filtering is first-class.
   - Keep date math deterministic and ISO-string based where possible.
2. Dashboard state and controls:
   - Replace month dropdown with period mode/preset controls.
   - Add budget start day input/select, custom start/end inputs, and filter controls.
   - Default to a budget month with start day 28 unless a better local default is chosen during implementation.
3. Visualizations:
   - Reuse existing bucket data for tables.
   - Add pie/camembert components for category, account and top merchants; avoid heavy dependency unless clearly justified.
4. Tests and validation:
   - Add tests for period boundaries, combined filters, and bucket consistency.
   - Run full test/build/lint workflow.

# Validation
- Run `npm test`.
- Run `npm run build`.
- Run `logics-manager lint --require-status`.
- Run `logics-manager audit --group-by-doc` if workflow docs are edited during implementation.
- Run `logics-manager flow validate task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses --fixable --explain` before closeout.
- Run `logics-manager flow finish task logics/tasks/task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses.md` after validation.

# Report
- Pending implementation.

# AI Context
- Summary: Implement period-based spending analytics, dashboard filters, and pie charts.
- Keywords: implementation, dashboard, date-range, budget-month, filters, pie-chart, spending
- Use when: Implementing the period/filter/chart dashboard task.
- Skip when: Work is about import parsers, category taxonomy, forecast, persistence, or unrelated UI cleanup.

# Links
- Request: `req_002_ameliorer_periodes_filtres_dashboard_depenses`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
