const CACHE_NAME = "veda-web-v5";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  self.clients.claim(),
])));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) return;
  const requestUrl = new URL(event.request.url);
  // Do not put authenticated role pages or private data into a shared cache.
  if (
    requestUrl.pathname.startsWith("/admin") ||
    requestUrl.pathname.startsWith("/qr-printer") ||
    requestUrl.pathname.startsWith("/salesexecutive")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (requestUrl.pathname.endsWith("/manifest.json") || requestUrl.pathname.endsWith("/qr-printer-manifest.json")) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
