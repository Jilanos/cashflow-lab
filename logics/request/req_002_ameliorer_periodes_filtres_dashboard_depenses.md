## req_002_ameliorer_periodes_filtres_dashboard_depenses - Ameliorer les periodes et filtres du dashboard depenses
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: Remplacer le mois calendrier strict par des periodes d'analyse plus utiles, ajouter filtres de depenses, plages libres et vues camemberts.
> Confidence: high
> Complexity: M
> Theme: analytics
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: Added AC traceability matrix after task_004 closeout (no scope/confidence change).

# Needs
- Ameliorer l'analyse des depenses pour eviter que le mois calendrier strict rende les revenus et depenses mensuels illisibles.
- Ajouter des periodes d'analyse plus utiles, notamment un mois budgetaire configurable, des plages rapides et une plage personnalisee.
- Ajouter des filtres de depenses pour isoler une categorie, un compte, un marchand/libelle, un type de flux ou les transactions non categorisees.
- Ajouter des vues camemberts pour visualiser rapidement la repartition des depenses.

# Context
- Aujourd'hui le dashboard utilise `monthKey(bookingDate) === month`, donc les vues dependent du mois calendrier.
- Un salaire entre le 29 et le 5 peut faire basculer fortement les revenus/net d'un mois a l'autre, sans reflet utile du cycle budgetaire.
- Les depenses ont maintenant davantage de categories; il faut pouvoir filtrer et visualiser ces regroupements sans modifier les donnees.
- La solution doit rester locale, simple et compatible avec les transactions deja importees.

# Acceptance criteria
- AC1: L'utilisateur peut analyser les transactions sur un mois budgetaire configurable par jour de debut, en plus du mois calendrier.
- AC2: L'utilisateur peut choisir une plage d'analyse autre qu'un mois: periode rapide et plage personnalisee date debut/date fin.
- AC3: Le dashboard depenses applique des filtres categorie, compte, type de flux, texte marchand/libelle et categorise/non categorise.
- AC4: Les tableaux, totaux et graphes utilisent le meme moteur de periode/filtres pour eviter les incoherences.
- AC5: Des vues camemberts montrent la repartition des depenses par categorie, compte et marchand/top marchands.
- AC6: Les changements sont couverts par tests de domaine et validations `npm test`, `npm run build`, `logics-manager lint --require-status`.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/domain/analysis.ts`
- `src/domain/dates.ts`
- `src/app/views/DashboardView.tsx`
- `src/domain/categories.ts`

# AC Traceability
- AC1 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `src/domain/period.ts` (`budgetMonthRange`, `calendarMonthRange`, `periodOf`), `src/domain/period.test.ts`.
- AC2 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `src/domain/period.ts` (`quickRange`, `shiftPeriod`, custom range), `src/app/views/DashboardView.tsx`, `src/domain/period.test.ts`.
- AC3 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `src/domain/period.ts` (`filterTransactions`), `src/app/views/DashboardView.tsx`, `src/domain/period.test.ts`.
- AC4 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `src/domain/analysis.ts` (`summarizePeriod`), `src/app/views/DashboardView.tsx` share one filtered set.
- AC5 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `src/domain/analysis.ts` (`toPieSlices`), `src/app/views/PieChart.tsx`, `src/domain/period.test.ts`.
- AC6 -> `task_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`. Proof: `npm test` passed 62 tests, `npm run build` passed, `logics-manager lint --require-status` passed.

# AI Context
- Summary: Add budget-month/date-range analytics, dashboard filters, and pie-chart views for spending analysis.
- Keywords: dashboard, spending, budget-month, date-range, filters, pie-chart, analytics
- Use when: Planning or implementing dashboard period/filter/chart improvements.
- Skip when: Work concerns import parsers, forecast assumptions, persistence, or category taxonomy changes only.

# Backlog
- none
- `item_004_ameliorer_les_periodes_et_filtres_du_dashboard_depenses`
