## req_000_cadrer_mvp_cashflow_lab - Cadrer le MVP Cashflow Lab
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: Initialiser Cashflow Lab comme app desktop navigateur local-first pour agreger manuellement via CSV les comptes courants, cartes, Livret A et LDDS de Credit Agricole, LCL et Fortuneo. Le premier objectif est le controle des depenses passees et la prevision mensuelle de cashflow futur, sans agregateur bancaire payant. Des CSV reels non anonymises existent localement hors repo public. Le MVP part sur debit immediat, soldes recalcules depuis les transactions et enrichis depuis les CSV si possible, categories initiales logement/courses/soirees/bricolage/sante/sport/loisirs, virements internes exclus des depenses, chiffrement reporte en second temps.
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
- Data source: real non-anonymized CSV exports are available locally outside the public repository; they must not be committed.
- Card model: debit immediate only at first.
- Forecast model: monthly at first.
- Balance model: recalculate from transactions and use CSV-provided balances when available.
- Initial categories: logement, courses, soirees, bricolage, sante, sport, loisirs.
- Internal transfers: exclude from spending totals by default while preserving them for balances.
- Encryption: defer local data-at-rest encryption to a second phase.
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
- [x] Sample CSV exports are available locally outside the public repository.
- [x] Forecast granularity and card modeling choices are decided.

# Companion docs
- Product brief(s): `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture decision(s): `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`

# Resolved questions
- Data source: use local non-anonymized CSV exports, without committing them.
- Card behavior: debit immediate first.
- Forecast granularity: monthly first.
- Balance source: recalculate from transactions and use CSV balances if possible.
- Categories: logement, courses, soirees, bricolage, sante, sport, loisirs.
- Internal transfers: exclude from spending totals by default.
- Encryption: second phase.

# Remaining questions
- Which local CSV corresponds to each bank and account type?
- Are LCL and Fortuneo represented in the current local CSV set, or should additional exports be added before parser work starts?
- Should the first implementation use SQLite immediately or browser storage for the fastest prototype?
- What should the first monthly dashboard show by default: total spending, category split, account split, merchant list, or all of these?

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
- `item_002_creer_mvp_cashflow_lab`
