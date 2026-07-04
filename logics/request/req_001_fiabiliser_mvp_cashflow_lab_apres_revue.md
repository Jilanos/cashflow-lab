## req_001_fiabiliser_mvp_cashflow_lab_apres_revue - Fiabiliser le MVP Cashflow Lab apres revue
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: Durcir le MVP local-first apres revue de code en traitant les risques de persistance, deduplication, parsing CSV, virements internes et restauration.
> Confidence: high
> Complexity: M
> Theme: reliability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Fiabiliser le MVP local-first avant usage avec de vrais exports bancaires volumineux.
- Corriger les 5 risques identifies en revue post-MVP:
  - persistance SQLite fragile dans `localStorage` et risque de perte silencieuse;
  - deduplication basee sur un hash 32 bits collisionnable;
  - detection CSV trop dependante de la premiere ligne non vide;
  - detection de virements internes trop agressive, pouvant masquer des depenses;
  - export JSON sans flux de restauration.

# Context
- Le MVP actuel passe les tests et le build, mais plusieurs chemins critiques restent insuffisamment robustes pour des donnees personnelles reelles.
- L'application est locale: le navigateur est la source de verite. Les erreurs de persistance, de restauration ou de deduplication ont donc un impact direct sur la confiance utilisateur.
- La tranche doit rester centree sur la fiabilisation; elle ne doit pas ajouter de nouvelles banques, de cloud sync, ni de chiffrement complet.

# Acceptance criteria
- AC1: Les sauvegardes locales ne peuvent plus donner l'impression d'avoir reussi si la persistance durable echoue; une erreur visible et testee est produite.
- AC2: La deduplication utilise une cle robuste aux collisions pratiques et conserve la prevention des doublons sur re-import/overlap.
- AC3: La detection du separateur CSV fonctionne avec preambule bancaire et selectionne le separateur qui permet de trouver un en-tete valide.
- AC4: Les virements internes detectes automatiquement ne peuvent plus exclure silencieusement de vraies depenses sans possibilite de controle utilisateur ou regle plus stricte.
- AC5: Une sauvegarde JSON exportee par l'application peut etre restauree dans l'application, avec validation de schema minimal et message d'erreur exploitable.
- AC6: Les corrections sont couvertes par tests automatises pertinents et `npm test`, `npm run build`, `logics-manager lint --require-status` passent.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- Review findings from MVP code review.
- `src/app/store.ts`
- `src/storage/localSqlite.ts`
- `src/domain/hash.ts`
- `src/domain/dedup.ts`
- `src/parsers/csv.ts`
- `src/parsers/tabular.ts`
- `src/domain/transfers.ts`
- `src/domain/export.ts`

# AI Context
- Summary: Durcir le MVP Cashflow Lab apres revue en traitant persistance, deduplication, CSV, virements internes et restauration JSON.
- Keywords: reliability, local-first, sqlite, csv, deduplication, internal-transfers, restore
- Use when: Planning or implementing post-MVP reliability fixes before real bank usage.
- Skip when: The work adds unrelated product features, new bank parsers, cloud sync, encryption, or visual redesign.

# Backlog
- none
- `item_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`

# AC Traceability
- AC1 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `src/app/persistence.ts`, `src/app/store.ts`, `src/app/persistence.test.ts`.
- AC2 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `src/domain/hash.ts`, `src/domain/dedup.ts`, `src/domain/pipeline.test.ts`.
- AC3 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `src/parsers/tabular.ts`, `src/parsers/parsers.test.ts`.
- AC4 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `src/domain/transfers.ts`, `src/domain/pipeline.test.ts`.
- AC5 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `src/domain/export.ts`, `src/app/views/ExportView.tsx`, `src/domain/export.test.ts`.
- AC6 -> `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`. Proof: `npm test` passed 43 tests, `npm run build` passed, `logics-manager lint --require-status` passed.
