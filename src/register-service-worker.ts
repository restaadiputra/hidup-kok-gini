import { markUpdateReady } from "./update/update-ready";
import { watchForUpdates } from "./update/watch-updates";

// The bundle this tab is running. Its file name carries a content hash, so if
// the active worker's cache no longer holds it, a newer build is being served.
const RUNNING_BUNDLE = new URL(import.meta.url).pathname;

// With skipWaiting the new worker takes control while it is still activating,
// before its activate handler has deleted the old cache. Checking the cache
// then would still find this tab's bundle, so wait for activation to finish.
function activated(worker: ServiceWorker | null): Promise<void> {
  return new Promise((resolve) => {
    if (!worker || worker.state === "activated" || worker.state === "redundant") return resolve();
    const onChange = () => {
      if (worker.state !== "activated" && worker.state !== "redundant") return;
      worker.removeEventListener("statechange", onChange);
      resolve();
    };
    worker.addEventListener("statechange", onChange);
  });
}

async function runningBuildIsGone(): Promise<boolean> {
  await activated(navigator.serviceWorker.controller);
  return !(await caches.match(RUNNING_BUNDLE));
}

// Production only: the dev server must never be served from a stale cache.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        watchForUpdates({
          container: navigator.serviceWorker,
          registration,
          page: document,
          isStale: runningBuildIsGone,
          onReady: markUpdateReady,
        });
      })
      .catch(() => {
        // Offline support is a bonus; the game works fine without it.
      });
  });
}
