import { useState } from "react";
import type { StorageAdapter } from "../storage/adapter";
import { useAppStore } from "./store";
import { AccountsView } from "./views/AccountsView";
import { ImportView } from "./views/ImportView";
import { DashboardView } from "./views/DashboardView";
import { ForecastView } from "./views/ForecastView";
import { ExportView } from "./views/ExportView";

type Tab = "accounts" | "import" | "dashboard" | "forecast" | "export";

const TABS: { id: Tab; label: string }[] = [
  { id: "accounts", label: "Comptes" },
  { id: "import", label: "Import CSV" },
  { id: "dashboard", label: "Depenses" },
  { id: "forecast", label: "Prevision" },
  { id: "export", label: "Export" },
];

export function App({ storage }: { storage: StorageAdapter }) {
  const store = useAppStore(storage);
  const [tab, setTab] = useState<Tab>("accounts");

  return (
    <div className="app">
      <h1>Cashflow Lab</h1>
      <p className="subtitle">
        Agregez vos exports bancaires (CSV), controlez vos depenses et anticipez votre tresorerie. 100% local.
      </p>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {store.error && (
        <div className="notice warn">
          Erreur: {store.error}{" "}
          <button className="secondary" onClick={store.clearError}>Fermer</button>
        </div>
      )}

      {!store.ready ? (
        <div className="panel"><p className="muted">Chargement de la base locale...</p></div>
      ) : tab === "accounts" ? (
        <AccountsView store={store} />
      ) : tab === "import" ? (
        <ImportView store={store} />
      ) : tab === "dashboard" ? (
        <DashboardView store={store} />
      ) : tab === "forecast" ? (
        <ForecastView store={store} />
      ) : (
        <ExportView store={store} storage={storage} />
      )}
    </div>
  );
}
