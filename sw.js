// Zaenid Michis — Minimal Service Worker
// Purpose: enables PWA "Install app" prompt on Android/Chrome.
// Intentionally does NOT cache anything — Firebase handles all data.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: pass through everything, no caching
self.addEventListener("fetch", () => {});
