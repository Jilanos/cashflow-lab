import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { StorageAdapter } from "./adapter";
import type { AppState } from "../domain/state";
import { initSchema, loadState, saveState } from "./sqlite";

const STORAGE_KEY = "cashflow-lab.sqlite.v1";

/**
 * Browser SQLite storage backed by sql.js. The database lives in memory and its
 * bytes are persisted to localStorage on every save. Data never leaves the
 * device, matching the local-first guardrail.
 */
export class LocalSqliteStorage implements StorageAdapter {
  private sql: SqlJsStatic | null = null;
  private db: Database | null = null;

  private async ready(): Promise<Database> {
    if (this.db) return this.db;
    this.sql = await initSqlJs({ locateFile: () => wasmUrl });
    const saved = readBytes();
    this.db = saved ? new this.sql.Database(saved) : new this.sql.Database();
    initSchema(this.db);
    return this.db;
  }

  async load(): Promise<AppState> {
    const db = await this.ready();
    return loadState(db);
  }

  async save(state: AppState): Promise<void> {
    const db = await this.ready();
    saveState(db, state);
    writeBytes(db.export());
  }

  async exportBytes(): Promise<Uint8Array> {
    const db = await this.ready();
    return db.export();
  }

  async reset(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.db = null;
  }
}

function readBytes(): Uint8Array | null {
  const b64 = localStorage.getItem(STORAGE_KEY);
  if (!b64) return null;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function writeBytes(bytes: Uint8Array): void {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  localStorage.setItem(STORAGE_KEY, btoa(bin));
}
