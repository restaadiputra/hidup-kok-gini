import { createGame } from "./create-game";
import { gameReducer } from "./reducer";
import { replaySession, SAVE_VERSION } from "./replay";
import type { Action, GameState, Session } from "./types";
import { LEGACY_SAVE_KEYS, SAVE_KEY, SEEN_VERSION_KEY } from "../storage-keys";

export interface Store {
  game: GameState | null;
  session: Session | null;
  notice: string;
}
export type StoreAction =
  | { type: "START"; names: string[]; seed: number }
  | { type: "QUIT" }
  | { type: "DISMISS_NOTICE" }
  | { type: "PLAY"; action: Action };

export function loadStore(savedStorage?: Pick<Storage, "getItem">): Store {
  try {
    const storage = savedStorage ?? localStorage;
    const saved = storage.getItem(SAVE_KEY);
    if (!saved) return {
      game: null, session: null,
      notice: storage.getItem(SEEN_VERSION_KEY) !== SAVE_KEY &&
        LEGACY_SAVE_KEYS.some((key) => storage.getItem(key))
        ? "Kartu dan aturan sudah diperbarui. Mulai permainan baru, ya; simpanan versi lama tidak bisa dilanjutkan."
        : "",
    };
    const restored = replaySession(JSON.parse(saved));
    if (restored) return { ...restored, notice: "" };
    return {
      game: null,
      session: null,
      notice: "Simpanan lama tidak cocok. Yuk, mulai cerita baru.",
    };
  } catch {
    return {
      game: null,
      session: null,
      notice:
        "Simpanan tidak bisa dibaca. Kamu tetap bisa bermain di sesi ini.",
    };
  }
}

// Mark the version after mounting, not in loadStore: React can call initializers twice.
// Keep this marker on reset so retained legacy saves cannot retrigger the notice.
export function persistSession(
  session: Session | null,
  storage: Pick<Storage, "setItem" | "removeItem"> = localStorage,
) {
  if (session) storage.setItem(SAVE_KEY, JSON.stringify(session));
  else storage.removeItem(SAVE_KEY);
  storage.setItem(SEEN_VERSION_KEY, SAVE_KEY);
}

export function storeReducer(store: Store, action: StoreAction): Store {
  if (action.type === "DISMISS_NOTICE") return { ...store, notice: "" };
  if (action.type === "START")
    return {
      game: createGame(action.names, action.seed),
      session: {
        version: SAVE_VERSION,
        names: action.names,
        seed: action.seed,
        actions: [],
      },
      notice: "",
    };
  if (action.type === "QUIT") return { game: null, session: null, notice: "" };
  if (!store.game || !store.session) return store;
  const game = gameReducer(store.game, action.action);
  if (game === store.game) return store;
  return {
    ...store,
    game,
    session: {
      ...store.session,
      actions: [...store.session.actions, action.action],
    },
  };
}
