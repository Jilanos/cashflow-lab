import { useState } from "react";
import type { AppStore } from "../store";
import type { Account, AccountType, Bank } from "../../domain/types";
import { computeBalances } from "../../domain/balances";
import { formatCents } from "../format";

const BANKS: { value: Bank; label: string }[] = [
  { value: "credit_agricole", label: "Credit Agricole" },
  { value: "fortuneo", label: "Fortuneo" },
  { value: "lcl", label: "LCL (parser a venir)" },
];
const TYPES: { value: AccountType; label: string }[] = [
  { value: "current", label: "Compte courant" },
  { value: "card", label: "Carte" },
  { value: "livret_a", label: "Livret A" },
  { value: "ldds", label: "LDDS" },
];

export function AccountsView({ store }: { store: AppStore }) {
  const [bank, setBank] = useState<Bank>("credit_agricole");
  const [type, setType] = useState<AccountType>("current");
  const [name, setName] = useState("");

  const balances = computeBalances(store.state.accounts, store.state.transactions, store.state.batches);
  const balanceOf = (id: string) => balances.find((b) => b.accountId === id);

  const add = async () => {
    const account: Account = {
      id: `acc_${bank}_${Date.now()}`,
      bank,
      type,
      name: name.trim() || `${bank} ${type}`,
      currency: "EUR",
    };
    await store.addAccount(account);
    setName("");
  };

  return (
    <>
      <div className="panel">
        <h2>Ajouter un compte</h2>
        <div className="grid cols-2">
          <div>
            <label>Banque</label>
            <select value={bank} onChange={(e) => setBank(e.target.value as Bank)}>
              {BANKS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Nom affiche</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: CA Courant commun" />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button onClick={add}>Ajouter le compte</button>
        </div>
      </div>

      <div className="panel">
        <h2>Comptes ({store.state.accounts.length})</h2>
        {store.state.accounts.length === 0 ? (
          <p className="muted">Aucun compte. Ajoutez-en un pour commencer.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th><th>Banque</th><th>Type</th>
                <th className="num">Solde calcule</th><th className="num">Solde effectif</th>
              </tr>
            </thead>
            <tbody>
              {store.state.accounts.map((a) => {
                const b = balanceOf(a.id);
                return (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.bank}</td>
                    <td>{a.type}</td>
                    <td className="num">{formatCents(b?.computedCents ?? 0)}</td>
                    <td className="num">{formatCents(b?.effectiveCents ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
