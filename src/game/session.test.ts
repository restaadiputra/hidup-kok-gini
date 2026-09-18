import { test } from "vitest";
import assert from "node:assert/strict";
import { SAVE_KEY, SEEN_VERSION_KEY } from "../storage-keys";
import { loadStore, persistSession, storeReducer } from "./session";

function memoryStorage(entries: Record<string, string> = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

test("upgrade notice appears once per version and survives repeated initialization", () => {
  const storage = memoryStorage({ "hidup-kok-gini:v2": "old save" });
  const first = loadStore(storage);
  assert.ok(first.notice.includes("diperbarui"));
  assert.deepEqual(loadStore(storage), first, "initializer stays read-only for StrictMode");
  persistSession(first.session, storage);
  assert.equal(storage.getItem(SEEN_VERSION_KEY), SAVE_KEY);
  assert.equal(loadStore(storage).notice, "", "refresh does not repeat the notice");
  assert.equal(storage.getItem("hidup-kok-gini:v2"), "old save");
});

test("starting, resetting, and reloading do not repeat an acknowledged upgrade", () => {
  const storage = memoryStorage({ "hidup-kok-gini:v1": "old save" });
  let store = loadStore(storage);
  store = storeReducer(store, { type: "START", names: ["A", "B"], seed: 1 });
  persistSession(store.session, storage);
  assert.equal(loadStore(storage).notice, "");
  store = storeReducer(store, { type: "QUIT" });
  persistSession(store.session, storage);
  assert.equal(storage.getItem(SAVE_KEY), null);
  assert.equal(loadStore(storage).notice, "");
});

test("new players see no migration warning; a previously seen older version can show it", () => {
  assert.equal(loadStore(memoryStorage()).notice, "");
  const storage = memoryStorage({
    "hidup-kok-gini:v2": "old save",
    [SEEN_VERSION_KEY]: "hidup-kok-gini:v2",
  });
  assert.ok(loadStore(storage).notice.includes("diperbarui"));
});

test("notice dismissal keeps the game and session intact", () => {
  const store = loadStore(memoryStorage({ "hidup-kok-gini:v2": "old save" }));
  assert.deepEqual(storeReducer(store, { type: "DISMISS_NOTICE" }), { ...store, notice: "" });
});

test("acknowledged versions do not suppress corrupt-save or storage errors", () => {
  const storage = memoryStorage({ [SAVE_KEY]: "{}", [SEEN_VERSION_KEY]: SAVE_KEY });
  assert.ok(loadStore(storage).notice.includes("tidak cocok"));
  assert.ok(loadStore({ getItem: () => { throw new Error("Storage blocked"); } }).notice.includes("tidak bisa dibaca"));
  assert.throws(() => persistSession(null, {
    removeItem: () => {},
    setItem: () => { throw new Error("Storage blocked"); },
  }));
});
