// Godavari GeoSeva 2027 Application Shell Service Worker
const CACHE_NAME = 'godavari-geoseva-v1';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event: cache application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: network first, cache fallback for navigation and static assets
self.addEventListener('fetch', (event) => {
  // Never cache authorization or administrative endpoints
  if (
    event.request.url.includes('/api/v1/auth') ||
    event.request.url.includes('/api/v1/users') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET responses for static assets and public facilities
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.destination === 'script' ||
            event.request.destination === 'style' ||
            event.request.destination === 'image' ||
            event.request.url.includes('/api/v1/facilities'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline fallback
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to an HTML page while offline, return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response(JSON.stringify({ offline: true, error: 'Network unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
  );
});
