import { useMemo, useState } from "react";
import type { AppStore } from "../store";
import { summarizePeriod, toPieSlices, type Bucket } from "../../domain/analysis";
import {
  filterTransactions,
  quickRange,
  type CategorizedFilter,
  type DateRange,
  type PeriodMode,
  type QuickPreset,
  type TransactionFilter,
  type TypeFilter,
} from "../../domain/period";
import { categoryById } from "../../domain/categories";
import { formatCents, todayIso } from "../format";
import { PieChart } from "./PieChart";

function BucketTable({ title, buckets, total }: { title: string; buckets: Bucket[]; total: number }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {buckets.length === 0 ? (
        <p className="muted small">Aucune depense.</p>
      ) : (
        <table>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.key}>
                <td style={{ width: "34%" }}>{b.label}</td>
                <td style={{ width: "40%" }}>
                  <div className="bar">
                    <span style={{ width: `${total ? (b.amountCents / total) * 100 : 0}%` }} />
                  </div>
                </td>
                <td className="num">{formatCents(b.amountCents)}</td>
                <td className="num muted small">{b.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const PRESET_LABELS: Record<QuickPreset, string> = {
  current: "Periode courante",
  previous: "Periode precedente",
  last3: "3 derniers mois",
  ytd: "Depuis le 1er janvier",
  custom: "Personnalise",
};

export function DashboardView({ store }: { store: AppStore }) {
  const cats = useMemo(() => categoryById(store.state.categories), [store.state.categories]);
  const accountName = (id: string) => store.state.accounts.find((a) => a.id === id)?.name ?? id;

  // Period controls.
  const [mode, setMode] = useState<PeriodMode>("budget");
  const [budgetStartDay, setBudgetStartDay] = useState(28);
  const [preset, setPreset] = useState<QuickPreset>("current");
  const anchor = todayIso();
  const [customStart, setCustomStart] = useState(`${anchor.slice(0, 7)}-01`);
  const [customEnd, setCustomEnd] = useState(anchor);

  // Filter controls.
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [text, setText] = useState("");
  const [categorized, setCategorized] = useState<CategorizedFilter>("all");

  const range: DateRange | null = useMemo(() => {
    if (preset === "custom") {
      return customStart && customEnd ? { start: customStart, end: customEnd } : null;
    }
    return quickRange(preset, anchor, { mode, budgetStartDay });
  }, [preset, anchor, mode, budgetStartDay, customStart, customEnd]);

  const filter: TransactionFilter = useMemo(
    () => ({
      range: range ?? undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      accountIds: accountId ? [accountId] : undefined,
      type,
      text,
      categorized,
    }),
    [range, categoryId, accountId, type, text, categorized],
  );

  const filtered = useMemo(
    () => filterTransactions(store.state.transactions, filter, cats),
    [store.state.transactions, filter, cats],
  );

  const summary = useMemo(
    () =>
      range
        ? summarizePeriod(filtered, range, { categories: cats, accountName }, true)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, range, cats],
  );

  if (store.state.transactions.length === 0) {
    return <div className="panel"><p className="muted">Importez des transactions pour voir le tableau de bord.</p></div>;
  }

  return (
    <>
      <div className="panel">
        <div className="row">
          <div>
            <label>Type de periode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as PeriodMode)}>
              <option value="budget">Mois budgetaire</option>
              <option value="calendar">Mois calendaire</option>
            </select>
          </div>
          {mode === "budget" && (
            <div>
              <label>Jour de debut</label>
              <select value={budgetStartDay} onChange={(e) => setBudgetStartDay(Number(e.target.value))}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>Plage</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value as QuickPreset)}>
              {(Object.keys(PRESET_LABELS) as QuickPreset[]).map((p) => (
                <option key={p} value={p}>{PRESET_LABELS[p]}</option>
              ))}
            </select>
          </div>
          {preset === "custom" && (
            <>
              <div>
                <label>Du</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div>
                <label>Au</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </>
          )}
        </div>

        {range && (
          <p className="muted small" style={{ marginTop: 10 }}>
            Periode analysee : {range.start} → {range.end}
          </p>
        )}

        <div className="row" style={{ marginTop: 10 }}>
          <div>
            <label>Categorie</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Toutes</option>
              {store.state.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Compte</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Tous</option>
              {store.state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
              <option value="all">Tout</option>
              <option value="spending">Depenses</option>
              <option value="income">Revenus</option>
            </select>
          </div>
          <div>
            <label>Statut</label>
            <select value={categorized} onChange={(e) => setCategorized(e.target.value as CategorizedFilter)}>
              <option value="all">Tous</option>
              <option value="categorized">Categorises</option>
              <option value="uncategorized">Non categorises</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Libelle ou marchand"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {summary && (
          <div className="grid cols-2" style={{ marginTop: 14 }}>
            <div className="stat">
              <div className="lbl">Depenses de la periode</div>
              <div className="big neg">{formatCents(summary.totalSpendingCents)}</div>
            </div>
            <div className="stat">
              <div className="lbl">Revenus de la periode</div>
              <div className="big pos">{formatCents(summary.totalIncomeCents)}</div>
            </div>
          </div>
        )}
      </div>

      {summary && (
        <>
          <div className="grid cols-2">
            <PieChart title="Repartition par categorie" slices={toPieSlices(summary.byCategory)} />
            <PieChart title="Repartition par compte" slices={toPieSlices(summary.byAccount)} />
          </div>
          <PieChart title="Top marchands" slices={toPieSlices(summary.topMerchants)} />

          <BucketTable title="Par categorie" buckets={summary.byCategory} total={summary.totalSpendingCents} />
          <BucketTable title="Par compte" buckets={summary.byAccount} total={summary.totalSpendingCents} />
          <BucketTable title="Top marchands" buckets={summary.topMerchants} total={summary.totalSpendingCents} />
        </>
      )}

      <div className="panel">
        <h2>Transactions ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <p className="muted small">Aucune transaction pour ces filtres.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Libelle</th><th className="num">Montant</th><th>Categorie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="small">{t.bookingDate}</td>
                  <td>{t.label}{t.transferGroupId ? <span className="muted small"> (virement)</span> : null}</td>
                  <td className={`num ${t.amountCents < 0 ? "neg" : "pos"}`}>{formatCents(t.amountCents)}</td>
                  <td>
                    <select
                      value={t.categoryId ?? ""}
                      onChange={(e) => void store.setCategory(t.id, e.target.value || undefined).catch(() => undefined)}
                    >
                      <option value="">(non categorise)</option>
                      {store.state.categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
