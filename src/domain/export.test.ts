import { describe, expect, it } from "vitest";
import { emptyState } from "./state";
import { buildBackup, parseBackupJson, serializeBackup } from "./export";

describe("backup restore", () => {
  it("restores a serialized v1 backup into app state", () => {
    const state = emptyState();
    state.accounts = [
      { id: "acc1", bank: "fortuneo", type: "current", name: "Compte test", currency: "EUR" },
    ];
    const backup = buildBackup({ ...state }, "2024-04-01T10:00:00.000Z");

    const restored = parseBackupJson(serializeBackup(backup));

    expect(restored.accounts).toEqual(state.accounts);
    expect(restored.categories.length).toBeGreaterThan(0);
  });

  it("rejects invalid or unsupported backups", () => {
    expect(() => parseBackupJson("{")).toThrow("Sauvegarde JSON illisible");
    expect(() => parseBackupJson(JSON.stringify({ version: 2 }))).toThrow("version non supportee");
    expect(() => parseBackupJson(JSON.stringify({ version: 1, accounts: [] }))).toThrow("champ categories");
  });
});
