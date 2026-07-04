## task_001_cadrer_le_mvp_cashflow_lab - Cadrer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] User answers are captured for CSV formats, card handling, categories, balances, forecast granularity, and local privacy.
- [x] The request, product brief, ADR, and backlog are updated from those answers.
- [x] The first implementation slice is promoted or ready to promote.
- [x] Logics validation passes.

# Backlog
- `item_001_cadrer_le_mvp_cashflow_lab`

# Acceptance criteria
- AC1: The refined request records decisions for CSV imports, cards, categories, balances, and forecast granularity.
- AC2: The first implementation slice is small enough to build and test end to end.
- AC3: Dependencies and risks from the product brief and ADR are reflected in the backlog.
- AC4: The next task can be promoted without needing additional product discovery.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager audit --group-by-doc`.
- Run `python3 -m logics_manager flow finish task task_001_cadrer_le_mvp_cashflow_lab.md` after the discovery task is complete.
- logics-manager lint --require-status passed; logics-manager audit --group-by-doc OK (0 blocking)
- Finish workflow executed on 2026-07-04.
- Linked backlog/request close verification passed.

# Report
- Discovery complete on 2026-07-04. User answers captured and propagated to the request, product brief, ADR, and backlog.
- CSV coverage: Credit Agricole and Fortuneo exports available locally; LCL export pending, its parser deferred until provided.
- Storage: SQLite (sql.js/WASM) from the first slice, behind a storage adapter boundary.
- Default monthly dashboard: total spending, category split, account split, and top merchants.
- Card model debit immediate, monthly forecast, transfers excluded from spending, encryption deferred (confirmed).
- First implementation slice (item_002 / task_002) is promoted and implementation-ready.
- Finished on 2026-07-04.
- Linked backlog item(s): `item_001_cadrer_le_mvp_cashflow_lab`
- Related request(s): `req_000_cadrer_mvp_cashflow_lab`

# AI Context
- Summary: Refine the Cashflow Lab MVP request from user answers before implementation.
- Keywords: task, discovery, cashflow, csv import, forecast, local-first
- Use when: You need to capture product and architecture answers before building Cashflow Lab.
- Skip when: The MVP is already implementation-ready.

# Links
- Request: `req_000_cadrer_mvp_cashflow_lab`
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`

# AC Traceability
- request-AC1 -> This task. Proof: request `# Resolved questions` now records CSV coverage (CA + Fortuneo), card model, categories, balance source, and forecast granularity decisions.
- request-AC2 -> This task. Proof: request `# Needs` and product brief `# Non-goals` defer paid aggregation, cloud sync, mobile access, and investment tracking.
- request-AC3 -> This task. Proof: all four open questions are resolved; `# Remaining questions` now lists none blocking implementation.
- request-AC4 -> This task. Proof: request `# Companion docs` links the product brief and ADR, both now Accepted.
- request-AC5 -> This task. Proof: backlog item_002 and task_002 are promoted and implementation-ready with no pending product discovery.
