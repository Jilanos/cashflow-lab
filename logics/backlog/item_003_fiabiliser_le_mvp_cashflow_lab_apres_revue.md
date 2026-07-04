## item_003_fiabiliser_le_mvp_cashflow_lab_apres_revue - Fiabiliser le MVP Cashflow Lab apres revue
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Le MVP Cashflow Lab fonctionne sur les fixtures et le build, mais cinq faiblesses peuvent degrader la confiance utilisateur avec de vrais exports:
- un import peut etre affiche en memoire sans etre durablement sauvegarde si `localStorage` echoue;
- un hash court peut dedupliquer a tort deux operations distinctes;
- certains CSV avec preambule peuvent etre rejetes alors que leur table est valide;
- des operations distinctes de meme montant peuvent etre marquees comme virements internes et sorties des depenses;
- une sauvegarde JSON peut etre exportee mais pas restauree.

# Scope
- In:
  - rendre la persistance locale observable et non silencieuse en cas d'echec;
  - remplacer la cle de deduplication par une strategie robuste et testee;
  - rendre la detection CSV multi-separateurs compatible avec les preambules;
  - durcir ou rendre controlable la detection de virements internes avant exclusion des depenses;
  - ajouter une restauration JSON de sauvegarde complete;
  - ajouter les tests de non-regression associes.
- Out:
  - ajout de nouveaux parsers bancaires, notamment LCL;
  - synchronisation cloud, multi-device, comptes utilisateurs ou chiffrement complet;
  - refonte UI globale ou design system;
  - migration exhaustive vers un backend serveur.

# Acceptance criteria
- AC1: Un echec de sauvegarde durable pendant ajout/import/modification ne met pas l'UI dans un etat trompeur; l'utilisateur voit une erreur et les tests couvrent le cas.
- AC2: Les transactions importees ont une cle stable suffisamment robuste pour deduplication; les tests prouvent re-import identique, overlap et absence de suppression sur collision simulee/ancienne limite.
- AC3: Le parsing CSV choisit le separateur a partir de la table detectable, pas seulement de la premiere ligne; un CSV avec preambule contenant des virgules et table `;` est teste.
- AC4: Les virements internes detectes automatiquement sont soit marques comme "a confirmer", soit limites par une logique plus stricte; les depenses ne sont pas exclues silencieusement en cas d'ambiguite.
- AC5: L'onglet Export permet d'importer/restaurer une sauvegarde JSON `version: 1`, avec validation minimale, confirmation utilisateur et message d'erreur sur fichier invalide.
- AC6: La validation de livraison inclut `npm test`, `npm run build`, `logics-manager lint --require-status` et, si des docs workflow sont modifiees, `logics-manager audit --group-by-doc`.

# AC Traceability
- request-AC1 -> AC1. Proof: durable persistence failures are explicit and tested.
- request-AC2 -> AC2. Proof: deduplication key is robust and covered by re-import/overlap tests.
- request-AC3 -> AC3. Proof: CSV delimiter detection is validated against preamble-heavy exports.
- request-AC4 -> AC4. Proof: ambiguous transfer detection no longer silently removes spending.
- request-AC5 -> AC5. Proof: JSON backup has a restore path with validation.
- request-AC6 -> AC6. Proof: automated validation commands are part of the delivery gate.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_001_fiabiliser_mvp_cashflow_lab_apres_revue`
- Primary task(s): `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`

# AI Context
- Summary: Fiabiliser le MVP Cashflow Lab apres revue
- Keywords: backlog-groom, request, fiabiliser le mvp cashflow lab apres revue, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Fiabiliser le MVP Cashflow Lab apres revue.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: These issues affect data durability, correctness, and recoverability before real personal finance usage.

# Notes
- Implementation order should reduce data-loss risk first: persistence error handling/storage, restore path, dedup key, CSV detection, then transfer ambiguity controls.
- Keep backwards compatibility for existing locally stored SQLite rows where practical; if a migration is needed, include a deterministic migration path.
- Hybrid rationale: Derived from request `req_001_fiabiliser_mvp_cashflow_lab_apres_revue` and kept bounded to one coherent reliability slice.
- Source file: `logics/request/req_001_fiabiliser_mvp_cashflow_lab_apres_revue.md`.
- Generated locally by logics-manager.
- Task `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue` was finished via `logics-manager flow finish task` on 2026-07-04.

# Tasks
- `task_003_fiabiliser_le_mvp_cashflow_lab_apres_revue`
