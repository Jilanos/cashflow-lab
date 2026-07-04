import { useMemo, useState } from "react";
import type { AppStore } from "../store";
import { availableMonths, summarizeMonth, type Bucket } from "../../domain/analysis";
import { categoryById } from "../../domain/categories";
import { monthKey } from "../../domain/dates";
import { formatCents } from "../format";

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

export function DashboardView({ store }: { store: AppStore }) {
  const months = useMemo(() => availableMonths(store.state.transactions), [store.state.transactions]);
  const [month, setMonth] = useState(months[0] ?? "");
  const cats = useMemo(() => categoryById(store.state.categories), [store.state.categories]);
  const accountName = (id: string) => store.state.accounts.find((a) => a.id === id)?.name ?? id;

  const selected = month || months[0] || "";
  const summary = useMemo(
    () =>
      selected
        ? summarizeMonth(store.state.transactions, selected, { categories: cats, accountName })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.state.transactions, selected, cats],
  );

  const monthTx = useMemo(
    () => store.state.transactions.filter((t) => monthKey(t.bookingDate) === selected),
    [store.state.transactions, selected],
  );

  if (months.length === 0) {
    return <div className="panel"><p className="muted">Importez des transactions pour voir le tableau de bord.</p></div>;
  }

  return (
    <>
      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <label>Mois</label>
            <select value={selected} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        {summary && (
          <div className="grid cols-2" style={{ marginTop: 14 }}>
            <div className="stat">
              <div className="lbl">Depenses du mois</div>
              <div className="big neg">{formatCents(summary.totalSpendingCents)}</div>
            </div>
            <div className="stat">
              <div className="lbl">Revenus du mois</div>
              <div className="big pos">{formatCents(summary.totalIncomeCents)}</div>
            </div>
          </div>
        )}
      </div>

      {summary && (
        <>
          <BucketTable title="Par categorie" buckets={summary.byCategory} total={summary.totalSpendingCents} />
          <BucketTable title="Par compte" buckets={summary.byAccount} total={summary.totalSpendingCents} />
          <BucketTable title="Top marchands" buckets={summary.topMerchants} total={summary.totalSpendingCents} />
        </>
      )}

      <div className="panel">
        <h2>Transactions ({monthTx.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Libelle</th><th className="num">Montant</th><th>Categorie</th>
            </tr>
          </thead>
          <tbody>
            {monthTx.map((t) => (
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
      </div>
    </>
  );
}
