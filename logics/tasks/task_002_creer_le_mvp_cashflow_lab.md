## task_002_creer_le_mvp_cashflow_lab - Creer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] Local browser app scaffold exists with tests. (Vite + React + TypeScript; 35 vitest tests pass.)
- [x] CSV import works for the MVP local exports without committing private data. (Credit Agricole + Fortuneo parsers; raw data gitignored.)
- [x] Transactions are normalized, deduplicated, categorized, and attached to accounts.
- [x] Balances are recalculated from transactions and enriched from CSV balances where possible.
- [x] Monthly spending dashboard is available. (Total, by category, by account, top merchants.)
- [x] Monthly 3 to 12 month cashflow forecast is available.
- [x] Export/backup path exists for normalized data and assumptions. (JSON backup, CSV, SQLite bytes.)
- [x] Validation passes.

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
- 35 vitest tests pass (parsers, import pipeline, dedup, transfers, balances, forecast, SQLite roundtrip); npm run build (tsc + vite) succeeds; preview server serves app and assets HTTP 200
- Finish workflow executed on 2026-07-04.
- Linked backlog/request close verification passed.

# Report
- MVP implemented on 2026-07-04. Stack: Vite + React + TypeScript, SQLite via sql.js (WASM) behind a storage adapter boundary.
- Domain core (pure, tested): canonical model, money/date parsing, FNV-1a row hashing, label cleaning, category rules engine, dedup, internal-transfer detection, monthly analysis, balance recalculation, deterministic 3-12 month forecast, JSON/CSV/SQLite export.
- Parsers: Credit Agricole (preamble + split Debit/Credit + reported balance) and Fortuneo (value-date + split Debit/Credit); LCL deferred until an export is provided. Registry stays bank-agnostic.
- UI: tabs for Comptes, Import CSV, Depenses (dashboard), Prevision, Export. Categories editable per transaction.
- Privacy: raw CSV and local data are gitignored (DATA_banques/, data/raw/, *.csv); nothing private is committed. Synthetic fixtures only, embedded in TS.
- Validation: 35 vitest tests pass (parsers, pipeline, dedup, transfers, balances, forecast, SQLite roundtrip); `npm run build` (tsc + vite) succeeds; preview server serves the app and all assets (HTTP 200).
- Follow-ups: add the LCL parser when an export is available; consider local-at-rest encryption (deferred phase 2).
- Finished on 2026-07-04.
- Linked backlog item(s): `item_002_creer_mvp_cashflow_lab`
- Related request(s): `req_000_cadrer_mvp_cashflow_lab`

# AI Context
- Summary: Implement the first local-first Cashflow Lab MVP from CSV imports to monthly cashflow forecast.
- Keywords: task, implementation, cashflow, csv import, local-first, forecast, expenses
- Use when: You are explicitly asked to start building the Cashflow Lab MVP.
- Skip when: The user only wants planning or discovery.

# Links
- Request: `req_000_cadrer_mvp_cashflow_lab`
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction`

# AC Traceability
- request-AC1 -> This task. Proof: implemented CSV import (src/parsers), normalization + categorization (src/domain/import.ts), monthly expense analysis (src/domain/analysis.ts), and forecast (src/domain/forecast.ts). Covers own AC1/AC2/AC4/AC7.
- request-AC2 -> This task. Proof: no paid aggregation, cloud, mobile, or investment code; app is local-first browser-only with SQLite in-browser. Covers own AC8.
- request-AC3 -> This task. Proof: LCL parser intentionally deferred and documented as a follow-up; all other decisions were resolved in task_001 and implemented here.
- request-AC4 -> This task. Proof: implementation follows the linked product brief and ADR (SQLite, bank-agnostic model, deterministic forecast, transfers excluded from spending — own AC6).
- request-AC5 -> This task. Proof: task_001 discovery produced these implementation-ready ACs; this task realizes them with 35 passing tests and a green build. Covers own AC3/AC5.
