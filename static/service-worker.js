const CACHE_NAME = 'sentinel-pwa-v1';
const urlsToCache = [
  '/',
  '/static/style.css',
  '/static/script.js',
  '/static/chart.js',
  '/static/manifest.json',
  '/static/icons/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Let the browser do its default thing for non-GET requests.
  if (event.request.method !== 'GET') return;
  
  // For telemetry and audit endpoints, we always want fresh data, bypass cache entirely
  if (event.request.url.includes('/api/telemetry')) {
      event.respondWith(fetch(event.request).catch(() => new Response("{}", { status: 503 })));
      return;
  }

  // Network first falling back to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
