## task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses - Ameliorer les periodes et filtres du dashboard depenses
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [x] A shared period/filter engine drives dashboard totals, buckets, charts and transaction table.
- [x] Calendar month and configurable budget month are available.
- [x] Quick ranges and custom date range are available.
- [x] Category/account/type/text/categorized filters are available and combinable.
- [x] Pie charts are shown for category, account and merchant distribution.
- [x] Domain tests and validation commands pass.

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
- Finish workflow executed on 2026-07-05.
- Linked backlog/request close verification passed.

# Report
- Added `src/domain/period.ts`: `DateRange` model, `calendarMonthRange`,
- Finished on 2026-07-05.
- Linked backlog item(s): `item_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`
- Related request(s): `req_002_ameliorer_periodes_filtres_dashboard_depenses`
  `budgetMonthRange` (configurable start day, clamped to <=28 and to month
  length), `quickRange`/`shiftPeriod` presets (current/previous/last3/ytd/custom),
  `containsDate`, `addDays`, and a combinable `filterTransactions`
  (range + category + account + type + free-text + categorized status).
  `isSpending` moved here to avoid an analysis<->period import cycle and is
  re-exported from `analysis.ts`.
- `analysis.ts`: added `summarizePeriod` (range-based, with a `preFiltered`
  fast path) and `toPieSlices` (tail collapsed into "Autres");
  `summarizeMonth` now delegates to `summarizePeriod(calendarMonthRange(...))`,
  preserving monthly behaviour (AC3).
- Dashboard (`DashboardView.tsx`): period mode (budget/calendar) + start-day
  selector, quick-range presets, custom date range, and combinable filters;
  totals, buckets, transaction table and new SVG donut charts
  (`PieChart.tsx`) all share the same filtered set. Empty states handled for
  no data, no results, and zero-total charts.
- Tests: `src/domain/period.test.ts` (17 tests) covering date arithmetic,
  budget/calendar ranges, Feb/boundary/year-wrap cases, presets, combined
  filters and pie slices. `npm test` 62 passing; `npm run build` green.

# AI Context
- Summary: Implement period-based spending analytics, dashboard filters, and pie charts.
- Keywords: implementation, dashboard, date-range, budget-month, filters, pie-chart, spending
- Use when: Implementing the period/filter/chart dashboard task.
- Skip when: Work is about import parsers, category taxonomy, forecast, persistence, or unrelated UI cleanup.

# Links
- Request: `req_002_ameliorer_periodes_filtres_dashboard_depenses`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `src/domain/period.ts` (`budgetMonthRange`, `calendarMonthRange`, `periodOf`), `src/domain/period.test.ts`.
- request-AC2 -> This task. Proof: `src/domain/period.ts` (`quickRange`, `shiftPeriod`, custom range), `src/app/views/DashboardView.tsx`, `src/domain/period.test.ts`.
- request-AC3 -> This task. Proof: `src/domain/period.ts` (`filterTransactions`), `src/app/views/DashboardView.tsx`, `src/domain/period.test.ts`.
- request-AC4 -> This task. Proof: `src/domain/analysis.ts` (`summarizePeriod`), `src/app/views/DashboardView.tsx` (single shared filtered set).
- request-AC5 -> This task. Proof: `src/domain/analysis.ts` (`toPieSlices`), `src/app/views/PieChart.tsx`, `src/domain/period.test.ts`.
- request-AC6 -> This task. Proof: `npm test` (62 tests), `npm run build`, `logics-manager lint --require-status`.
