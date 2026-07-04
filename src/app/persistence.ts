import type { AppState } from "../domain/state";
import type { StorageAdapter } from "../storage/adapter";

export async function saveThenCommit(
  storage: StorageAdapter,
  next: AppState,
  commit: (state: AppState) => void,
): Promise<void> {
  await storage.save(next);
  commit(next);
}
