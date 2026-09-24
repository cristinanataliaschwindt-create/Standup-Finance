const CACHE_NAME = 'standup-finance-v2';

// Activos esenciales que se cachean al instalar el SW
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instalación: precachear activos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First para estáticos, Network-First para API/datos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar peticiones a la API ni a terceros (Freighter, Stellar RPC)
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Next.js chunks and documents must stay fresh during development and deployments.
  if (url.pathname.startsWith('/_next/') || request.mode === 'navigate') {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-First para activos estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Solo cachear respuestas exitosas de nuestro propio origen
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback offline: devolver la página principal cacheada
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
