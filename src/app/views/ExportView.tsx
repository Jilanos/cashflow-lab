import type { AppStore } from "../store";
import type { StorageAdapter } from "../../storage/adapter";
import { buildBackup, parseBackupJson, serializeBackup, transactionsToCsv } from "../../domain/export";
import { categoryById } from "../../domain/categories";
import { download } from "../format";
import { useState } from "react";

export function ExportView({ store, storage }: { store: AppStore; storage: StorageAdapter }) {
  const [message, setMessage] = useState<string | null>(null);
  const cats = categoryById(store.state.categories);
  const categoryName = (id?: string) => (id ? cats.get(id)?.name ?? id : "");
  const stamp = new Date().toISOString().slice(0, 10);

  const exportJson = () => {
    const backup = buildBackup(
      {
        accounts: store.state.accounts,
        categories: store.state.categories,
        categoryRules: store.state.categoryRules,
        transactions: store.state.transactions,
        batches: store.state.batches,
        recurringRules: store.state.recurringRules,
        events: store.state.events,
      },
      new Date().toISOString(),
    );
    download(`cashflow-lab-backup-${stamp}.json`, serializeBackup(backup), "application/json");
  };

  const exportCsv = () => {
    download(`cashflow-lab-transactions-${stamp}.csv`, transactionsToCsv(store.state.transactions, categoryName), "text/csv");
  };

  const exportDb = async () => {
    if (!storage.exportBytes) return;
    try {
      const bytes = await storage.exportBytes();
      download(`cashflow-lab-${stamp}.sqlite`, bytes, "application/octet-stream");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  };

  const reset = async () => {
    if (confirm("Effacer toutes les donnees locales ? Cette action est irreversible.")) {
      try {
        await store.reset();
        setMessage("Donnees locales reinitialisees.");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
      }
    }
  };

  const restoreJson = async (file: File) => {
    setMessage(null);
    try {
      const restored = parseBackupJson(await file.text());
      if (!confirm("Remplacer toutes les donnees locales par cette sauvegarde JSON ?")) return;
      await store.restoreState(restored);
      setMessage("Sauvegarde JSON restauree.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="panel">
      <h2>Export et sauvegarde</h2>
      <p className="small muted">
        Vos donnees restent locales. Exportez une sauvegarde JSON complete (transactions + hypotheses),
        un CSV des transactions normalisees, ou la base SQLite brute.
      </p>
      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={exportJson}>Sauvegarde JSON</button>
        <button className="secondary" onClick={exportCsv}>CSV transactions</button>
        {storage.exportBytes && <button className="secondary" onClick={() => void exportDb()}>Base SQLite</button>}
      </div>
      <div style={{ marginTop: 16 }}>
        <label>Restaurer une sauvegarde JSON</label>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void restoreJson(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        <button className="danger" onClick={() => void reset()}>Reinitialiser les donnees</button>
      </div>
      {message && <div className="notice small" style={{ marginTop: 12 }}>{message}</div>}
      <p className="small muted" style={{ marginTop: 16 }}>
        {store.state.transactions.length} transaction(s), {store.state.accounts.length} compte(s),
        {" "}{store.state.recurringRules.length} regle(s) recurrente(s).
      </p>
    </div>
  );
}
