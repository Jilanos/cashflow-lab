import { useCallback, useEffect, useMemo, useState } from "react";
import type { StorageAdapter } from "../storage/adapter";
import type { AppState } from "../domain/state";
import { emptyState } from "../domain/state";
import type {
  Account,
  ForecastEvent,
  RecurringRule,
  Transaction,
} from "../domain/types";
import { detectParser, getParser } from "../parsers";
import { buildImport } from "../domain/import";
import { mergeImport } from "../domain/dedup";
import { detectInternalTransfers } from "../domain/transfers";

export interface ImportOutcome {
  added: number;
  skipped: number;
  warnings: string[];
  bank: Account["bank"];
}

export interface AppStore {
  state: AppState;
  ready: boolean;
  addAccount(account: Account): Promise<void>;
  importText(accountId: string, fileName: string, text: string): Promise<ImportOutcome>;
  setCategory(txId: string, categoryId: string | undefined): Promise<void>;
  addRecurringRule(rule: RecurringRule): Promise<void>;
  removeRecurringRule(id: string): Promise<void>;
  addEvent(event: ForecastEvent): Promise<void>;
  removeEvent(id: string): Promise<void>;
  reset(): Promise<void>;
}

export function useAppStore(storage: StorageAdapter): AppStore {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    storage.load().then((loaded) => {
      if (alive) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [storage]);

  const persist = useCallback(
    async (next: AppState) => {
      setState(next);
      await storage.save(next);
    },
    [storage],
  );

  const addAccount = useCallback(
    async (account: Account) => {
      await persist({ ...state, accounts: [...state.accounts, account] });
    },
    [persist, state],
  );

  const importText = useCallback(
    async (accountId: string, fileName: string, text: string): Promise<ImportOutcome> => {
      const account = state.accounts.find((a) => a.id === accountId);
      if (!account) throw new Error(`Compte inconnu: ${accountId}`);
      const parser = getParser(account.bank) ?? detectParser(text);
      if (!parser) throw new Error("Aucun parser ne reconnait ce fichier.");

      const parseResult = parser.parse(text);
      const { batch, transactions } = buildImport({
        account,
        parseResult,
        fileName,
        importedAt: new Date().toISOString(),
        parserVersion: parser.version,
        rules: state.categoryRules,
      });

      const { merged, added, skipped } = mergeImport(state.transactions, transactions);
      const withTransfers = detectInternalTransfers(merged);

      await persist({
        ...state,
        transactions: withTransfers,
        batches: [...state.batches.filter((b) => b.id !== batch.id), batch],
      });

      return { added, skipped, warnings: parseResult.warnings, bank: account.bank };
    },
    [persist, state],
  );

  const setCategory = useCallback(
    async (txId: string, categoryId: string | undefined) => {
      const transactions = state.transactions.map((t): Transaction =>
        t.id === txId ? { ...t, categoryId } : t,
      );
      await persist({ ...state, transactions });
    },
    [persist, state],
  );

  const addRecurringRule = useCallback(
    async (rule: RecurringRule) => {
      await persist({ ...state, recurringRules: [...state.recurringRules, rule] });
    },
    [persist, state],
  );

  const removeRecurringRule = useCallback(
    async (id: string) => {
      await persist({ ...state, recurringRules: state.recurringRules.filter((r) => r.id !== id) });
    },
    [persist, state],
  );

  const addEvent = useCallback(
    async (event: ForecastEvent) => {
      await persist({ ...state, events: [...state.events, event] });
    },
    [persist, state],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      await persist({ ...state, events: state.events.filter((e) => e.id !== id) });
    },
    [persist, state],
  );

  const reset = useCallback(async () => {
    await storage.reset();
    const fresh = emptyState();
    setState(fresh);
  }, [storage]);

  return useMemo(
    () => ({
      state,
      ready,
      addAccount,
      importText,
      setCategory,
      addRecurringRule,
      removeRecurringRule,
      addEvent,
      removeEvent,
      reset,
    }),
    [state, ready, addAccount, importText, setCategory, addRecurringRule, removeRecurringRule, addEvent, removeEvent, reset],
  );
}
