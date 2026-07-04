import { useMemo, useState } from "react";
import type { AppStore } from "../store";
import type { Cadence, ForecastEvent, RecurringRule } from "../../domain/types";
import { computeBalances } from "../../domain/balances";
import { forecast } from "../../domain/forecast";
import { formatCents, currentMonth } from "../format";

const CADENCES: { value: Cadence; label: string }[] = [
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "yearly", label: "Annuel" },
  { value: "weekly", label: "Hebdomadaire" },
];

export function ForecastView({ store }: { store: AppStore }) {
  const [horizon, setHorizon] = useState(6);
  const accounts = store.state.accounts;

  const openingBalances = useMemo(() => {
    const balances = computeBalances(accounts, store.state.transactions, store.state.batches);
    return Object.fromEntries(balances.map((b) => [b.accountId, b.effectiveCents]));
  }, [accounts, store.state.transactions, store.state.batches]);

  const result = useMemo(
    () =>
      forecast({
        startMonth: currentMonth(),
        horizonMonths: horizon,
        openingBalances,
        recurringRules: store.state.recurringRules,
        events: store.state.events,
      }),
    [horizon, openingBalances, store.state.recurringRules, store.state.events],
  );

  return (
    <>
      <div className="panel">
        <h2>Horizon de prevision</h2>
        <div className="row">
          <input
            type="range" min={3} max={12} value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            style={{ maxWidth: 240 }}
          />
          <span>{horizon} mois</span>
        </div>
        {accounts.length === 0 && <p className="muted small">Ajoutez un compte pour ancrer les soldes de depart.</p>}
      </div>

      <div className="panel">
        <h2>Projection mensuelle</h2>
        <table>
          <thead>
            <tr>
              <th>Mois</th><th className="num">Entrees</th><th className="num">Sorties</th>
              <th className="num">Net</th><th className="num">Solde projete</th>
            </tr>
          </thead>
          <tbody>
            {result.months.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td className="num pos">{formatCents(m.inflowCents)}</td>
                <td className="num neg">{formatCents(m.outflowCents)}</td>
                <td className={`num ${m.netCents < 0 ? "neg" : "pos"}`}>{formatCents(m.netCents)}</td>
                <td className={`num ${m.endBalanceCents < 0 ? "neg" : ""}`}>{formatCents(m.endBalanceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RecurringRulesEditor store={store} cadences={CADENCES} />
      <EventsEditor store={store} />
    </>
  );
}

function RecurringRulesEditor({ store, cadences }: { store: AppStore; cadences: { value: Cadence; label: string }[] }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [accountId, setAccountId] = useState(store.state.accounts[0]?.id ?? "");
  const [startDate, setStartDate] = useState(`${currentMonth()}-01`);

  const add = async () => {
    const euros = Number(amount.replace(",", "."));
    if (!Number.isFinite(euros) || euros === 0 || !accountId) return;
    const rule: RecurringRule = {
      id: `rec_${Date.now()}`,
      accountId,
      label: label.trim() || "Mouvement recurrent",
      amountCents: Math.round(euros * 100),
      cadence,
      startDate,
    };
    try {
      await store.addRecurringRule(rule);
      setLabel("");
      setAmount("");
    } catch {
      // Store-level error banner explains the persistence failure.
    }
  };

  return (
    <div className="panel">
      <h2>Regles recurrentes</h2>
      <p className="small muted">Montant positif = entree, negatif = depense (ex: -900 pour un loyer).</p>
      <div className="grid cols-2">
        <div><label>Libelle</label><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Salaire, Loyer..." /></div>
        <div><label>Montant (EUR)</label><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2300 ou -900" /></div>
        <div>
          <label>Cadence</label>
          <select value={cadence} onChange={(e) => setCadence(e.target.value as Cadence)}>
            {cadences.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label>Compte</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {store.state.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div><label>A partir du</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={() => void add()} disabled={!accountId}>Ajouter la regle</button>
      </div>
      {store.state.recurringRules.length > 0 && (
        <table style={{ marginTop: 14 }}>
          <thead><tr><th>Libelle</th><th>Cadence</th><th className="num">Montant</th><th></th></tr></thead>
          <tbody>
            {store.state.recurringRules.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.cadence}</td>
                <td className={`num ${r.amountCents < 0 ? "neg" : "pos"}`}>{formatCents(r.amountCents)}</td>
                <td className="num"><button className="secondary" onClick={() => void store.removeRecurringRule(r.id).catch(() => undefined)}>Suppr</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EventsEditor({ store }: { store: AppStore }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(`${currentMonth()}-15`);
  const [accountId, setAccountId] = useState(store.state.accounts[0]?.id ?? "");

  const add = async () => {
    const euros = Number(amount.replace(",", "."));
    if (!Number.isFinite(euros) || euros === 0 || !accountId) return;
    const event: ForecastEvent = {
      id: `evt_${Date.now()}`,
      accountId,
      date,
      label: label.trim() || "Evenement",
      amountCents: Math.round(euros * 100),
    };
    try {
      await store.addEvent(event);
      setLabel("");
      setAmount("");
    } catch {
      // Store-level error banner explains the persistence failure.
    }
  };

  return (
    <div className="panel">
      <h2>Evenements ponctuels</h2>
      <div className="grid cols-2">
        <div><label>Libelle</label><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Impots, prime..." /></div>
        <div><label>Montant (EUR)</label><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-1200" /></div>
        <div><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div>
          <label>Compte</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {store.state.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={() => void add()} disabled={!accountId}>Ajouter l'evenement</button>
      </div>
      {store.state.events.length > 0 && (
        <table style={{ marginTop: 14 }}>
          <thead><tr><th>Date</th><th>Libelle</th><th className="num">Montant</th><th></th></tr></thead>
          <tbody>
            {store.state.events.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.label}</td>
                <td className={`num ${e.amountCents < 0 ? "neg" : "pos"}`}>{formatCents(e.amountCents)}</td>
                <td className="num"><button className="secondary" onClick={() => void store.removeEvent(e.id).catch(() => undefined)}>Suppr</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
