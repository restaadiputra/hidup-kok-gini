import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "vitest";
import { measureDynamics } from "./simulation";

const REPORT = process.env.DYNAMICS_REPORT;

test.runIf(!REPORT)("every sampled game contains a sudden event", () => {
  const metrics = measureDynamics(10);
  assert.equal(metrics.suddenCoverage, 1);
  assert.ok(metrics.averageScoreSpread >= 0);
  assert.ok(metrics.averageRecentThemeCount <= 2);
});

test.runIf(!!REPORT)("write deterministic dynamics report", () => {
  writeFileSync(REPORT!, JSON.stringify(measureDynamics(100), null, 2));
});
