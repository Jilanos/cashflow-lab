# Cashflow Lab

A local-first web app that turns French bank CSV exports into a monthly spending review and a 3 to 12 month cashflow forecast.

## Problem and audience

Anyone who keeps several bank accounts and wants to see where the money goes, and what the next months look like, without paying for a bank aggregation service or sending data to a cloud. You import the CSV files your banks let you download. Everything stays in your browser.

## Features

- CSV import for Credit Agricole and Fortuneo, with automatic encoding detection and parser diagnostics. An LCL parser is planned once an export is available.
- Common transaction model: normalization, deduplication, categorization, account attachment, transfer detection.
- Balances recalculated from transactions, cross-checked with balances reported in the CSV.
- Monthly spending dashboard by category, account and top merchants, with budget periods, filters, pie charts and editable categories.
- Deterministic forecast from recurring rules and one-off events.
- Export as JSON backup, transactions CSV, or the raw SQLite database.

## Quick start

Requires Node.js and npm.

```bash
npm install
npm run dev      # local dev server (Vite)
npm test         # Vitest suite
npm run build    # typecheck and production build
```

Then open the URL printed by Vite and import a CSV from the UI.

## Privacy

Data is stored locally in your browser (SQLite compiled to WebAssembly through sql.js). Real bank exports are private and must never be committed: `DATA_banques/`, `data/raw/` and `*.csv` are gitignored.

## Tech stack

React 18, TypeScript, Vite, sql.js, Vitest.

## Status

Working local MVP, personal project. No hosted demo. Cloud sync, mobile access and data-at-rest encryption are out of scope for now.

## Project docs

The project uses Logics workflow docs:

- Product brief: `logics/product/prod_001_cashflow_lab_product_brief.md`
- Architecture direction: `logics/architecture/adr_001_cashflow_lab_architecture_direction.md`
