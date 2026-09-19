// Notices when a new deploy has taken over this page. The worker activates
// itself as soon as it installs (skipWaiting + clients.claim in sw.js), so a
// `controllerchange` on a page that already had a worker means a new build is
// being served. index.html is network-first, though, so a page opened just
// now may already be that build; `isStale` tells the two apart.

export const CHECK_EVERY_MS = 30 * 60 * 1000;

export function watchForUpdates({
  container,
  registration,
  page,
  isStale,
  onReady,
  every = (tick, ms = CHECK_EVERY_MS) => {
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  },
}: {
  container: EventTarget & { controller: unknown };
  registration: { update(): Promise<unknown> };
  page: EventTarget & { visibilityState: DocumentVisibilityState };
  /** True when the code running in this tab is not the build now being served. */
  isStale: () => Promise<boolean>;
  onReady: () => void;
  every?: (tick: () => void, ms?: number) => () => void;
}): () => void {
  // The very first install also claims the page; that is not an update.
  const hadWorker = Boolean(container.controller);
  let announced = false;
  let stopped = false;

  const onControllerChange = () => {
    if (!hadWorker || announced) return;
    announced = true;
    isStale()
      .then((stale) => {
        if (stale && !stopped) onReady();
        else announced = false;
      })
      .catch(() => {
        announced = false;
      });
  };
  // A phone game sits in the background for hours; look again when it returns.
  const check = () => {
    registration.update().catch(() => {
      // Offline or the server hiccuped; the next check will try again.
    });
  };
  const onVisibilityChange = () => {
    if (page.visibilityState === "visible") check();
  };

  container.addEventListener("controllerchange", onControllerChange);
  page.addEventListener("visibilitychange", onVisibilityChange);
  const stopTimer = every(check);
  return () => {
    stopped = true;
    container.removeEventListener("controllerchange", onControllerChange);
    page.removeEventListener("visibilitychange", onVisibilityChange);
    stopTimer();
  };
}
