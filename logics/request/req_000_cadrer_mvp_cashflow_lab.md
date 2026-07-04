## req_000_cadrer_mvp_cashflow_lab - Cadrer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: Initialiser Cashflow Lab comme app desktop navigateur local-first pour agreger manuellement via CSV les comptes courants, cartes, Livret A et LDDS de Credit Agricole, LCL et Fortuneo. Le premier objectif est le controle des depenses passees et la prevision de cashflow futur, sans agregateur bancaire payant. Les docs de cadrage initiales sont logics/product/prod_001_cashflow_lab_product_brief.md et logics/architecture/adr_001_cashflow_lab_architecture_direction.md. Les prochaines etapes doivent affiner les formats CSV, le modele des cartes, les categories, le stockage local, et la granularite de forecast.
> Confidence: medium
> Complexity: medium
> Theme: product
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Frame the first Cashflow Lab MVP around CSV-based aggregation, expense review, and cashflow forecasting.
- Keep the first release local-first and browser-based.
- Defer mobile/cloud access and paid bank aggregation until the core import and forecast workflow is useful.

# Context
- Target banks: Credit Agricole, LCL, and Fortuneo.
- Target account types: current accounts, cards, Livret A, and LDDS.
- Primary user value: understand past spending and anticipate future balances.
- Cost constraint: avoid paid aggregation for the first version.
- Source product framing: `logics/product/prod_001_cashflow_lab_product_brief.md`.
- Source architecture direction: `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`.

# Acceptance criteria
- AC1: The MVP scope clearly includes CSV import, transaction normalization, expense analysis, and cashflow forecasting.
- AC2: Scope boundaries clearly defer paid aggregation, cloud sync, mobile access, and investment tracking.
- AC3: Open questions identify the decisions required before implementation starts.
- AC4: The request is linked to product and architecture companion docs.
- AC5: The request is ready to be refined into implementation tasks after answers to the open questions.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed in companion docs.
- [ ] Sample CSV exports or representative anonymized extracts are available.
- [ ] Forecast granularity and card modeling choices are decided.

# Companion docs
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`

# Open questions
- Which CSV exports will be used as the parser contract for each bank?
- How should deferred debit cards be represented in the transaction and forecast model?
- Should the forecast be daily, weekly, or monthly in the first usable version?
- Which default categories should be included?
- Should account balances be manually entered, imported from CSV, or derived from transaction history?
- Should local encryption be required before importing real financial data?

# References
- `logics/product/prod_001_cashflow_lab_product_brief.md`
- `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`

# AI Context
- Summary: Draft a bounded request for cadrer le mvp cashflow lab.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_001_cadrer_le_mvp_cashflow_lab`
