// Offline support. vite.config.ts fills in the placeholders at build time and
// emits the result as dist/sw.js, so the cache name changes with every build.
const CACHE = "__CACHE_NAME__";
const PRECACHE = __PRECACHE_URLS__;
const FALLBACK = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("hkg-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Pages: network first so a new deploy shows up right away, cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(FALLBACK, { cacheName: CACHE })),
    );
    return;
  }

  // Everything else is precached and versioned by the cache name.
  event.respondWith(
    caches
      .match(request, { cacheName: CACHE })
      .then((cached) => cached ?? fetch(request)),
  );
});
