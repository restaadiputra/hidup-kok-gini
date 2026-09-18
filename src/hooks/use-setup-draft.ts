import { useState } from "react";
import { DEFAULT_NAMES, INITIAL_STATS } from "../data/players";
import { MIN_PLAYERS } from "../game/limits";
import type { Player } from "../game/types";

// The lobby form before a game starts: how many players, and their names.
export function useSetupDraft() {
  const [count, setCount] = useState(MIN_PLAYERS);
  const [names, setNames] = useState([...DEFAULT_NAMES]);

  const visibleNames = names.slice(0, count);
  const previews: Player[] = visibleNames.map((name, id) => ({
    id,
    name: name.trim() || DEFAULT_NAMES[id],
    position: 0,
    stats: INITIAL_STATS,
    statuses: [],
  }));

  function rename(index: number, value: string) {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  }

  return { count, setCount, names: visibleNames, previews, rename };
}

export type SetupDraft = ReturnType<typeof useSetupDraft>;
