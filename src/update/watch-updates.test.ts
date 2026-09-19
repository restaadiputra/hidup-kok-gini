import assert from "node:assert/strict";
import { test } from "vitest";
import { watchForUpdates } from "./watch-updates";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function fakes(controller: unknown, stale = true) {
  const container = Object.assign(new EventTarget(), { controller });
  const page = Object.assign(new EventTarget(), { visibilityState: "visible" as DocumentVisibilityState });
  let updates = 0;
  const registration = { update: async () => { updates++; } };
  let ready = 0;
  const timers: (() => void)[] = [];
  const stop = watchForUpdates({
    container,
    registration,
    page,
    isStale: async () => stale,
    onReady: () => { ready++; },
    every: (tick) => { timers.push(tick); return () => undefined; },
  });
  return { container, page, stop, timers, count: () => ({ ready, updates }) };
}

test("a new worker taking over an already-controlled page announces the update once", async () => {
  const { container, count } = fakes({});
  container.dispatchEvent(new Event("controllerchange"));
  container.dispatchEvent(new Event("controllerchange"));
  await settle();
  assert.equal(count().ready, 1);
});

test("the first install taking control is not an update", async () => {
  const { container, count } = fakes(null);
  container.dispatchEvent(new Event("controllerchange"));
  await settle();
  assert.equal(count().ready, 0);
});

// index.html is network-first, so a freshly opened page can already be running
// the new build while the old worker is only just being replaced.
test("a page that already runs the build the new worker serves stays quiet", async () => {
  const { container, count } = fakes({}, false);
  container.dispatchEvent(new Event("controllerchange"));
  await settle();
  assert.equal(count().ready, 0);
});

test("returning to the app and the periodic timer both check for a new version", () => {
  const { page, timers, count } = fakes({});
  page.visibilityState = "hidden";
  page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(count().updates, 0, "no check while the app is in the background");
  page.visibilityState = "visible";
  page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(count().updates, 1);
  timers.forEach((tick) => tick());
  assert.equal(count().updates, 2);
});

test("stopping the watcher removes its listeners", async () => {
  const { container, page, stop, count } = fakes({});
  stop();
  container.dispatchEvent(new Event("controllerchange"));
  page.dispatchEvent(new Event("visibilitychange"));
  await settle();
  assert.deepEqual(count(), { ready: 0, updates: 0 });
});
