/* Service worker — KONFÍO ZINC · Tarjeta Elite */
const CACHE = 'tarjetapre-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './og-image.jpg',
  './icons/favicon-64.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((resp) => { const c = resp.clone(); caches.open(CACHE).then((x) => x.put(request, c)); return resp; }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      fetch(request).then((resp) => { const c = resp.clone(); caches.open(CACHE).then((x) => x.put(request, c)); return resp; }).catch(() => caches.match(request))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => { const c = resp.clone(); caches.open(CACHE).then((x) => x.put(request, c)); return resp; }).catch(() => cached))
  );
});
