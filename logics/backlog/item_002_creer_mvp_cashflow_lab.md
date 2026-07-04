## item_002_creer_mvp_cashflow_lab - Creer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: Construire le premier MVP local-first de Cashflow Lab: importer les CSV disponibles, normaliser les transactions, recalculer les soldes depuis les transactions lorsque possible, presenter une analyse mensuelle des depenses et produire une prevision mensuelle de cashflow. Debit immediat uniquement au debut, categories initiales logement/courses/soirees/bricolage/sante/sport/loisirs, virements internes exclus des depenses, chiffrement differe.
> Confidence: medium
> Progress: 100%
> Complexity: high
> Theme: product
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Build the first usable Cashflow Lab MVP without paid bank aggregation. The MVP should import the available local CSV exports, normalize transactions, calculate useful monthly expense views, and project future cashflow monthly from deterministic assumptions.

# Scope
- In:
  - scaffold the local browser app and test setup
  - import real local CSV exports without committing private data
  - detect bank/export format and normalize transactions into a common model
  - recalculate balances from transactions and use CSV-provided balances when available
  - support current accounts, cards, Livret A, and LDDS where CSV data permits
  - support debit-immediate card flows first
  - implement deduplication for repeated imports
  - provide initial categories: logement, courses, soirees, bricolage, sante, sport, loisirs
  - exclude internal transfers from spending totals by default
  - show monthly spending by category and account
  - provide a simple monthly cashflow forecast for 3 to 12 months
  - keep data local and exportable
- Out:
  - paid bank aggregation
  - cloud sync and mobile access
  - local encryption at rest
  - deferred debit card modeling
  - investment portfolio tracking beyond simple balances
  - committing raw private CSV exports or filenames containing private identifiers

# Acceptance criteria
- AC1: The app can import the local CSV exports used for the MVP without exposing raw data in Git.
- AC2: Imported transactions are normalized, deduplicated, and assigned to accounts.
- AC3: Balances are recalculated from transactions and enriched from CSV balances when present.
- AC4: Monthly spending can be viewed by category and account.
- AC5: Initial categories are available and editable.
- AC6: Internal transfers are excluded from spending totals by default.
- AC7: A 3 to 12 month monthly cashflow forecast is computed from recurring rules and one-off events.
- AC8: Data remains local and can be exported.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: MVP includes CSV import, normalization, analysis, and forecast.
- request-AC2 -> This backlog slice. Proof: aggregation, cloud, mobile, encryption, and investments are deferred.
- request-AC3 -> This backlog slice. Proof: remaining decisions are bounded to implementation details.
- request-AC4 -> This backlog slice. Proof: product and architecture docs are linked.
- request-AC5 -> This backlog slice. Proof: this item is promoted into task `task_002_creer_le_mvp_cashflow_lab`.

# Decision framing
- Product framing: Required
- Product signals: CSV-first, local-first, monthly forecast, debit immediate first, simple category set.
- Architecture framing: Required
- Architecture signals: parser modules, canonical transaction model, deduplication, local storage boundary, deterministic forecast engine.

# Links
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`
- Request: `req_000_cadrer_mvp_cashflow_lab`
- Primary task(s): `task_002_creer_le_mvp_cashflow_lab`

# AI Context
- Summary: Creer le MVP Cashflow Lab
- Keywords: backlog, promote, slice, creer le mvp cashflow lab
- Use when: You need a bounded backlog item for Creer le MVP Cashflow Lab.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: This is the main implementation slice after MVP framing.

# Notes
- Generated locally by logics-manager.
- Do not start implementation until explicitly requested.
- Raw bank CSV exports are local-only and must stay out of the public repository.
- Task `task_002_creer_le_mvp_cashflow_lab` was finished via `logics-manager flow finish task` on 2026-07-04.

# Tasks
- `task_002_creer_le_mvp_cashflow_lab`
