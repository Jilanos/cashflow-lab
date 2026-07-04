## item_001_cadrer_le_mvp_cashflow_lab - Cadrer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The project needs a precise MVP backlog before implementation starts. The current product direction is clear at a high level, but several decisions remain open: CSV formats, card modeling, forecast granularity, category defaults, balance source, and local data protection.

# Scope
- In:
  - refine the MVP request from user answers
  - choose the first parser target bank and account type
  - define the minimal category set and transfer behavior
  - decide the first forecast granularity
  - decide local storage and encryption expectations for the MVP
  - turn the refined request into implementable tasks
- Out:
  - implementing the app
  - adding paid bank aggregation
  - cloud sync or mobile access
  - investment portfolio modeling beyond simple balances

# Acceptance criteria
- AC1: The refined request records decisions for CSV imports, cards, categories, balances, and forecast granularity.
- AC2: The first implementation slice is small enough to build and test end to end.
- AC3: Dependencies and risks from the product brief and ADR are reflected in the backlog.
- AC4: The next task can be promoted without needing additional product discovery.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: MVP scope refinement covers CSV import, normalization, analysis, and forecast.
- request-AC2 -> This backlog slice. Proof: deferred items stay out of the first implementation slice.
- request-AC3 -> This backlog slice. Proof: open questions drive the refinement checklist.
- request-AC4 -> This backlog slice. Proof: companion docs are linked below.
- request-AC5 -> This backlog slice. Proof: completion should produce implementation-ready tasks.

# Decision framing
- Product framing: Required
- Product signals: CSV-first, local-first, expense control, cashflow forecast, no paid aggregation in MVP.
- Product follow-up: Update `prod_001_cashflow_lab_product_brief` after user answers.
- Architecture framing: Required
- Architecture signals: parser contracts, canonical transaction model, deduplication, storage boundary, forecast engine.
- Architecture follow-up: Update `adr_001_cashflow_lab_architecture_direction` after technical decisions.

# Links
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`
- Request: `logics/request/req_000_cadrer_mvp_cashflow_lab.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Cadrer le MVP Cashflow Lab
- Keywords: backlog-groom, request, cadrer le mvp cashflow lab, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Cadrer le MVP Cashflow Lab.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: This is the gating discovery slice before implementation can start safely.

# Notes
- Hybrid rationale: Derived from request `req_000_cadrer_mvp_cashflow_lab` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_000_cadrer_mvp_cashflow_lab.md`.
- Generated locally by logics-manager.

# Tasks
- `task_001_cadrer_le_mvp_cashflow_lab`
