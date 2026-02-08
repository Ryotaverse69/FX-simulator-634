// ============================================================
// Service Worker — FXスワップ投資シミュレーター
// ============================================================

const CACHE_NAME = 'fxswap-v1';

// キャッシュ対象の静的ファイル
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './js/data-store.js',
  './js/portfolio.js',
  './js/portfolio-charts.js',
  './js/notifications.js',
  './manifest.json',
  './correlations.json',
];

// 外部CDN（Chart.js）
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js',
];

// インストール時: 静的ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// フェッチ時: キャッシュ戦略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API呼び出し（為替レート等）はネットワークファースト
  if (url.hostname !== location.hostname && !CDN_ASSETS.some(cdn => event.request.url.startsWith(cdn))) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // 静的ファイル・CDNはキャッシュファースト（Stale While Revalidate）
  event.respondWith(staleWhileRevalidate(event.request));
});

// キャッシュファースト + バックグラウンド更新
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

// ネットワークファースト（APIコール用）
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
