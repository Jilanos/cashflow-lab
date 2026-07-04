import { describe, expect, it, vi } from "vitest";
import { emptyState } from "../domain/state";
import type { StorageAdapter } from "../storage/adapter";
import { saveThenCommit } from "./persistence";

describe("saveThenCommit", () => {
  it("commits only after durable save succeeds", async () => {
    const state = emptyState();
    const storage: StorageAdapter = {
      load: async () => emptyState(),
      save: async () => undefined,
      reset: async () => undefined,
    };
    const commit = vi.fn();

    await saveThenCommit(storage, state, commit);

    expect(commit).toHaveBeenCalledWith(state);
  });

  it("does not commit when durable save fails", async () => {
    const state = emptyState();
    const storage: StorageAdapter = {
      load: async () => emptyState(),
      save: async () => {
        throw new Error("quota exceeded");
      },
      reset: async () => undefined,
    };
    const commit = vi.fn();

    await expect(saveThenCommit(storage, state, commit)).rejects.toThrow("quota exceeded");
    expect(commit).not.toHaveBeenCalled();
  });
});
