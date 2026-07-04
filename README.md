# Cashflow Lab

Cashflow Lab is a personal finance planning tool focused on local-first expense tracking and forward-looking cashflow forecasting.

## Initial Scope

- Import transactions from CSV exports for Credit Agricole, LCL, Fortuneo, current accounts, cards, Livret A, and LDDS.
- Normalize bank exports into a common transaction model.
- Track spending by month, account, merchant, and category.
- Forecast upcoming months from recurring income, recurring expenses, known one-off events, and manual assumptions.
- Keep the first version local and browser-based, with optional mobile/cloud access considered later.

## Current Status

The first local-first MVP is implemented (Vite + React + TypeScript, SQLite via sql.js).

- Import CSV exports from Credit Agricole and Fortuneo (LCL parser to follow once an export is available).
- Normalize, deduplicate, categorize, and attach transactions to accounts.
- Recalculate balances from transactions, enriched by CSV-reported balances.
- Monthly spending dashboard (total, category, account, top merchants) with editable categories.
- Deterministic 3-12 month cashflow forecast from recurring rules and one-off events.
- Export a JSON backup, a transactions CSV, or the raw SQLite database. Data stays on your machine.

Logics workflow docs:

- Product brief: `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture and requirements direction: `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`

## Getting started

```bash
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # typecheck + production build
```

Real bank exports are private and must never be committed. `DATA_banques/`, `data/raw/`, and `*.csv`
are gitignored. Import your files through the app UI; they are stored locally in your browser only.
