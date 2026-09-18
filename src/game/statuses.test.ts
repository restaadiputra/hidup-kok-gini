import assert from "node:assert/strict";
import { test } from "vitest";
import { clearStatuses, expireStatuses, gainStatuses, paydayEffects, statusChanges, syncAutomatic } from "./statuses";
import type { ActiveStatus, StatusCatalog, Stats } from "./types";

const CATALOG: StatusCatalog = {
  gig: { id: "gig", label: "Gig", icon: "briefcase", months: 3, payday: { dompet: 300_000 }, trigger: null },
  burnout: { id: "burnout", label: "Burnout", icon: "brain", months: null, payday: {}, trigger: { stat: "kewarasan", atMost: 0, clearAbove: 20 } },
  "dicari-debt-collector": { id: "dicari-debt-collector", label: "Dicari", icon: "receipt", months: null, payday: {}, trigger: { stat: "hutang", above: 1_000_000 } },
};
const stats = (patch: Partial<Stats> = {}): Stats => ({ dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0, ...patch });

test("timed statuses refresh, expire and clear", () => {
  const once = gainStatuses([], ["gig"], 3, CATALOG);
  assert.deepEqual(once, [{ id: "gig", untilMonth: 6 }]);
  assert.deepEqual(gainStatuses(once, ["gig"], 5, CATALOG), [{ id: "gig", untilMonth: 8 }]);
  assert.equal(expireStatuses(once, 5), once);
  assert.deepEqual(expireStatuses(once, 6), []);
  assert.deepEqual(clearStatuses(once, ["gig"]), []);
});

test("automatic statuses follow trigger hysteresis", () => {
  const burnt = syncAutomatic([], stats({ kewarasan: 0 }), CATALOG);
  assert.deepEqual(burnt, [{ id: "burnout", untilMonth: null }]);
  assert.equal(syncAutomatic(burnt, stats({ kewarasan: 20 }), CATALOG), burnt);
  assert.deepEqual(syncAutomatic(burnt, stats({ kewarasan: 21 }), CATALOG), []);
  assert.deepEqual(syncAutomatic([], stats({ hutang: 1_000_001 }), CATALOG), [{ id: "dicari-debt-collector", untilMonth: null }]);
});

test("payday effects and status diffs retain status order", () => {
  const active: ActiveStatus[] = [{ id: "gig", untilMonth: 4 }];
  assert.deepEqual(paydayEffects(active, CATALOG), [{ status: "gig", effects: { dompet: 300_000 } }]);
  assert.deepEqual(statusChanges(active, []), { gained: [], lost: ["gig"] });
});
