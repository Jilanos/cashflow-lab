## item_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses - Ameliorer les periodes et filtres du dashboard depenses
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
Le dashboard depenses est limite au mois calendrier. Cela rend l'analyse instable lorsque le salaire tombe autour de la fin/debut de mois et empeche d'explorer les categories nouvellement enrichies. L'utilisateur doit pouvoir raisonner sur un cycle budgetaire, comparer des plages libres, filtrer les transactions et visualiser les repartitions.

# Scope
- In:
  - moteur domaine de periode d'analyse: mois calendrier, mois budgetaire configurable, plages rapides et plage personnalisee;
  - remplacement de la logique dashboard `monthKey` par une logique de `DateRange` partagee;
  - filtres dashboard: categorie, compte, type de flux, texte marchand/libelle, categorise/non categorise;
  - vues camemberts pour depenses par categorie, compte et top marchands;
  - tests de domaine sur les periodes, filtres et agregations;
  - UI dashboard utilisable sans modifier les transactions importees.
- Out:
  - edition avancee des regles de categorie;
  - prevision/cashflow forecast;
  - comparaison multi-periodes avancee ou budgets objectifs;
  - persistance de preferences utilisateur au-dela du necessaire localement;
  - refonte globale de navigation.

# Acceptance criteria
- AC1: Un mois budgetaire peut etre calcule a partir d'un jour de debut configurable; par defaut, proposer un debut autour du 28 pour lisser les salaires fin/debut de mois.
- AC2: Le dashboard propose des plages rapides utiles, au minimum mois courant, mois precedent, 3 derniers mois, annee en cours et personnalise.
- AC3: Une plage personnalisee date debut/date fin filtre correctement les transactions, totaux, tableaux et aggregats.
- AC4: Les filtres categorie, compte, type de flux, texte et statut categorise/non categorise sont combinables.
- AC5: Les camemberts s'appuient sur les memes transactions filtrees que les tableaux et montrent categorie, compte et top marchands.
- AC6: Les revenus et virements internes sont visibles/filtrables, mais la vue depenses reste centree sur les sorties reelles par defaut.
- AC7: Les tests automatises couvrent les bornes de periode, le mois budgetaire, les filtres combines et les agregations.

# AC Traceability
- request-AC1 -> AC1. Proof: budget-month analysis is the primary period change.
- request-AC2 -> AC2 and AC3. Proof: quick ranges and custom ranges cover non-month analysis.
- request-AC3 -> AC4. Proof: dashboard filter controls cover category/account/type/text/status.
- request-AC4 -> AC3, AC4, AC5. Proof: shared filtered transaction set feeds all views.
- request-AC5 -> AC5. Proof: pie charts visualize category/account/merchant splits.
- request-AC6 -> AC7. Proof: validation gates require tests and build/lint.

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
- Request: `logics/request/req_002_ameliorer_periodes_filtres_dashboard_depenses.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Ameliorer les periodes et filtres du dashboard depenses
- Keywords: backlog-groom, request, ameliorer les periodes et filtres du dashboard depenses, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Ameliorer les periodes et filtres du dashboard depenses.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Current calendar-month analysis can materially mislead personal spending review when salary timing crosses month boundaries.

# Notes
- Prefer a small domain module for periods/filters so charts, totals and transaction table cannot drift.
- If a chart library is added, keep it lightweight and justify the dependency; an SVG/CSS pie implementation is acceptable for the MVP.
- Hybrid rationale: Derived from request `req_002_ameliorer_periodes_filtres_dashboard_depenses` and kept bounded to one coherent analytics slice.
- Source file: `logics/request/req_002_ameliorer_periodes_filtres_dashboard_depenses.md`.
- Generated locally by logics-manager.
- Task `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses` was finished via `logics-manager flow finish task` on 2026-07-05.

# Tasks
- `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`
