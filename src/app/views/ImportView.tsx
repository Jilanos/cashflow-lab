import { useState } from "react";
import type { AppStore, ImportOutcome } from "../store";

export function ImportView({ store }: { store: AppStore }) {
  const [accountId, setAccountId] = useState(store.state.accounts[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const text = await file.text();
      const result = await store.importText(accountId, file.name, text);
      setOutcome(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const hasAccounts = store.state.accounts.length > 0;

  return (
    <div className="panel">
      <h2>Importer un export CSV</h2>
      {!hasAccounts ? (
        <p className="muted">Ajoutez d'abord un compte dans l'onglet Comptes.</p>
      ) : (
        <>
          <p className="small muted">
            Les fichiers restent sur votre machine. Aucune donnee n'est envoyee sur un serveur.
            Le re-import d'un meme fichier ne cree pas de doublons.
          </p>
          <div className="grid cols-2">
            <div>
              <label>Compte cible</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {store.state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.bank})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Fichier CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={busy || !accountId}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          {busy && <p className="muted">Import en cours...</p>}
          {outcome && (
            <div className="notice ok">
              Import {outcome.bank}: {outcome.added} nouvelle(s) transaction(s), {outcome.skipped} doublon(s) ignore(s).
              {outcome.warnings.length > 0 && ` ${outcome.warnings.length} ligne(s) non lue(s).`}
            </div>
          )}
          {error && <div className="notice warn">Erreur: {error}</div>}
        </>
      )}
    </div>
  );
}
