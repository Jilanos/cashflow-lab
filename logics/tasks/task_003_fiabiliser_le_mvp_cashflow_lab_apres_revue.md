## task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue - Fiabiliser le MVP Cashflow Lab apres revue
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] Persistence failures are handled without optimistic UI drift and are covered by tests.
- [x] Deduplication no longer relies on a short collision-prone hash alone.
- [x] CSV delimiter detection handles preambles and remains compatible with current fixtures.
- [x] Internal transfer detection cannot silently hide ambiguous spending.
- [x] JSON backup restoration is available from the UI and validates input.
- [x] `npm test`, `npm run build`, `logics-manager lint --require-status`, and applicable audit checks pass.

# Backlog
- `item_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`

# Acceptance criteria
- AC1: `useAppStore`/storage mutations only update React state after durable save succeeds, or roll back/report the error in a user-visible way.
- AC2: Storage quota/save failures are surfaced in the UI during account add, import, category edits, forecast rule/event edits, reset/restore where relevant.
- AC3: Transaction deduplication uses a stronger stable key, with migration/backwards compatibility for existing `rowHash` rows where necessary.
- AC4: CSV parsing attempts candidate delimiters or otherwise scores against expected headers; parser tests include a preamble whose first non-empty line would mislead old detection.
- AC5: Transfer detection is conservative enough to avoid excluding ambiguous same-amount transactions, or records an explicit confirmation/review state before exclusion from dashboards.
- AC6: Export view supports JSON restore from a previously exported backup and rejects invalid/unsupported payloads safely.
- AC7: Tests cover the five fixes and existing parser/pipeline/forecast/storage tests continue to pass.

# Implementation plan
1. Persistence and storage:
   - Review `src/app/store.ts`, `src/storage/localSqlite.ts`, and storage tests.
   - Make save failures explicit before committing UI state, or add rollback/error propagation if optimistic state is kept.
   - Consider IndexedDB/OPFS if needed for practical SQLite byte size; otherwise document `localStorage` limitation and fail visibly.
2. Deduplication:
   - Replace `fnv1aHex`/`rowHash` usage with a stronger deterministic key, preferably Web Crypto or a library-free SHA implementation usable in tests/build.
   - Keep import/re-import stable for identical rows and overlapping exports.
   - Add migration handling if stored transactions keep old hash length.
3. CSV detection:
   - Update `parseTabular`/`detectDelimiter` flow to try `;`, `,`, and tab, then choose the delimiter whose parsed grid contains the expected header.
   - Preserve current Credit Agricole and Fortuneo fixtures.
4. Internal transfers:
   - Tighten matching with labels/categories/account types/date direction, or introduce a review/confirmed flag before dashboard exclusion.
   - Add tests for false-positive pairs with same amount on different accounts.
5. JSON restore:
   - Add backup validation helpers next to `src/domain/export.ts`.
   - Add UI file input/action in `src/app/views/ExportView.tsx`.
   - Persist restored state through the storage adapter and report success/failure.

# Validation
- Run `npm test`.
- Run `npm run build`.
- Run `logics-manager lint --require-status`.
- Run `logics-manager audit --group-by-doc` if workflow docs are edited during implementation.
- Run `logics-manager flow validate task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue --fixable --explain` before closeout.
- Run `logics-manager flow finish task logics/tasks/task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue.md` after implementation and validation.
- Passed: `npm test` (43 tests).
- Passed: `npm run build`.
- Passed: `logics-manager lint --require-status`.
- Passed: `logics-manager audit --group-by-doc` with no blocking issues.
- Passed: `logics-manager flow validate task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue --fixable --explain`.
- Finish workflow executed on 2026-07-04.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Persistence: `saveThenCommit` commits only after durable save; store-level errors are displayed in the app.
- Deduplication: row identity is now a canonical source-field key with legacy 32-bit compatibility.
- CSV: tabular parsing tries candidate delimiters and selects the one with a valid header.
- Transfers: automatic matching now requires internal-transfer-like labels on both legs.
- Restore: JSON backup restoration is available from Export and validates unsupported/invalid files.
- Finished on 2026-07-04.
- Linked backlog item(s): `item_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`
- Related request(s): `req_001_fiabiliser_mvp_cashflow_lab_apres_revue`

# AI Context
- Summary: Implement the five post-review reliability fixes for the local-first Cashflow Lab MVP.
- Keywords: implementation, local-first, persistence, sqlite, csv, deduplication, internal-transfers, json-restore
- Use when: Implementing or reviewing the reliability hardening task linked to item_003.
- Skip when: Work concerns unrelated UI redesign, new bank support, cloud sync, encryption, or product discovery.

# Links
- Request: `req_001_fiabiliser_mvp_cashflow_lab_apres_revue`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `src/app/persistence.ts`, `src/app/store.ts`, `src/app/persistence.test.ts`.
- request-AC2 -> This task. Proof: `src/domain/hash.ts`, `src/domain/dedup.ts`, `src/domain/pipeline.test.ts`.
- request-AC3 -> This task. Proof: `src/parsers/tabular.ts`, `src/parsers/parsers.test.ts`.
- request-AC4 -> This task. Proof: `src/domain/transfers.ts`, `src/domain/pipeline.test.ts`.
- request-AC5 -> This task. Proof: `src/domain/export.ts`, `src/app/views/ExportView.tsx`, `src/domain/export.test.ts`.
- request-AC6 -> This task. Proof: `npm test`, `npm run build`, `logics-manager lint --require-status`.
