import type { AppStore } from "../store";
import type { StorageAdapter } from "../../storage/adapter";
import { buildBackup, serializeBackup, transactionsToCsv } from "../../domain/export";
import { categoryById } from "../../domain/categories";
import { download } from "../format";

export function ExportView({ store, storage }: { store: AppStore; storage: StorageAdapter }) {
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
    const bytes = await storage.exportBytes();
    download(`cashflow-lab-${stamp}.sqlite`, bytes, "application/octet-stream");
  };

  const reset = async () => {
    if (confirm("Effacer toutes les donnees locales ? Cette action est irreversible.")) {
      await store.reset();
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
      <div className="row" style={{ marginTop: 20 }}>
        <button className="danger" onClick={() => void reset()}>Reinitialiser les donnees</button>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>
        {store.state.transactions.length} transaction(s), {store.state.accounts.length} compte(s),
        {" "}{store.state.recurringRules.length} regle(s) recurrente(s).
      </p>
    </div>
  );
}
