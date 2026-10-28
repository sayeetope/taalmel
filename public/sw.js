/* Taalमेल offline cache. Navigations revalidate; hashed assets are cache-first. */
const CACHE = 'taalmel-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The app shell must be allowed to update; fall back to the cache offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch (error) {
          const cached =
            (await cache.match(request)) ??
            (await cache.match('/index.html')) ??
            (await cache.match('/'));
          if (cached) return cached;
          throw error;
        }
      })()
    );
    return;
  }

  // Vite fingerprints every asset, so a hit is safe to reuse until the cache rotates.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    })()
  );
});
