
const CACHE_NAME = "veda-web-v6";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key))
          )
        ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.includes("/api/")) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Never cache authenticated/private application pages.
  if (
    requestUrl.pathname.startsWith("/admin") ||
    requestUrl.pathname.startsWith("/qr-printer") ||
    requestUrl.pathname.startsWith("/salesexecutive")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Never cache manifests through the service worker.
  if (
    requestUrl.pathname.endsWith("/manifest.json") ||
    requestUrl.pathname.endsWith("/qr-printer-manifest.json")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          response.ok &&
          requestUrl.origin === self.location.origin
        ) {
          // Clone BEFORE the response is returned/consumed.
          const responseToCache = response.clone();

          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) =>
                cache.put(event.request, responseToCache)
              )
              .catch((error) => {
                console.error(
                  "SERVICE WORKER CACHE ERROR:",
                  error
                );
              })
          );
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

