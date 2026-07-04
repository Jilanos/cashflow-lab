## task_002_creer_le_mvp_cashflow_lab - Creer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] Local browser app scaffold exists with tests.
- [ ] CSV import works for the MVP local exports without committing private data.
- [ ] Transactions are normalized, deduplicated, categorized, and attached to accounts.
- [ ] Balances are recalculated from transactions and enriched from CSV balances where possible.
- [ ] Monthly spending dashboard is available.
- [ ] Monthly 3 to 12 month cashflow forecast is available.
- [ ] Export/backup path exists for normalized data and assumptions.
- [ ] Validation passes.

# Backlog
- `item_002_creer_mvp_cashflow_lab`

# Acceptance criteria
- AC1: The app can import the local CSV exports used for the MVP without exposing raw data in Git.
- AC2: Imported transactions are normalized, deduplicated, and assigned to accounts.
- AC3: Balances are recalculated from transactions and enriched from CSV balances when present.
- AC4: Monthly spending can be viewed by category and account.
- AC5: Initial categories are available and editable.
- AC6: Internal transfers are excluded from spending totals by default.
- AC7: A 3 to 12 month monthly cashflow forecast is computed from recurring rules and one-off events.
- AC8: Data remains local and can be exported.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_002_creer_le_mvp_cashflow_lab.md` after implementation.

# Report
- Not started. This task is prepared for future implementation only.

# AI Context
- Summary: Implement the first local-first Cashflow Lab MVP from CSV imports to monthly cashflow forecast.
- Keywords: task, implementation, cashflow, csv import, local-first, forecast, expenses
- Use when: You are explicitly asked to start building the Cashflow Lab MVP.
- Skip when: The user only wants planning or discovery.

# Links
- Request: `req_000_cadrer_mvp_cashflow_lab`
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction`
