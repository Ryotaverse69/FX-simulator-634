const CACHE_NAME = 'fx-sim-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './brokers.json',
  './icons/logo.svg',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './icons/mask-icon.svg',
  './tools/icon-factory.html',
  './privacy.html',
  './support.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))).then(
      () => self.clients.claim()
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // For navigation requests, try network first, then cache fallback (offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For static assets, use cache-first, then network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
      );
    })
  );
});
