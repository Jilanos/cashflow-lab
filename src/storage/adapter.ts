import type { AppState } from "../domain/state";
import { emptyState } from "../domain/state";

/**
 * Storage boundary. The MVP ships a SQLite (sql.js) adapter; this interface
 * lets a future encrypted or synced backend drop in without touching the app.
 */
export interface StorageAdapter {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
  /** Raw database bytes for backup/export, if the backend has them. */
  exportBytes?(): Promise<Uint8Array>;
  reset(): Promise<void>;
}

/** Simple in-memory adapter, used as a fallback and in tests. */
export class MemoryStorage implements StorageAdapter {
  private state: AppState = emptyState();
  async load(): Promise<AppState> {
    return structuredClone(this.state);
  }
  async save(state: AppState): Promise<void> {
    this.state = structuredClone(state);
  }
  async reset(): Promise<void> {
    this.state = emptyState();
  }
}
