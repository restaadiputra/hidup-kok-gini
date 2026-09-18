import assert from "node:assert/strict";
import { test } from "vitest";
import { choiceAvailability } from "./availability";
import { createGame } from "./create-game";
import type { ActiveStatus, Choice, Player, Stats } from "./types";

const choice = (extra: Partial<Choice> = {}): Choice => ({
  label: "Pilih", effects: { dompet: -100_100 }, result: "Akibat.", requires: {},
  requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], ...extra,
});
const player = (stats: Partial<Stats> = {}, statuses: ActiveStatus[] = []): Player => {
  const base = createGame(["A", "B"], 1).players[0];
  return { ...base, stats: { ...base.stats, ...stats }, statuses };
};

test("availability distinguishes wallet payment and debt", () => {
  assert.deepEqual(choiceAvailability(player({ dompet: 200_000 }), choice(), { dompet: -100_100 }), { kind: "ok" });
  assert.deepEqual(choiceAvailability(player({ dompet: 100_000 }), choice(), { dompet: -100_100 }), { kind: "debt", shortfall: 100, added: 120 });
});

test("requirements and ghosting lock before debt", () => {
  assert.equal(choiceAvailability(player({ dompet: 0, relasi: 10 }), choice({ requires: { relasi: 30 } }), { dompet: -100_100 }).kind, "locked");
  assert.equal(choiceAvailability(player({}, [{ id: "ghosted", untilMonth: null }]), choice({ tags: ["minta-tolong"] }), {}).kind, "locked");
});
