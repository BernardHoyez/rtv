// Service Worker — RTV (GitHub Pages: /rtv/)
const CACHE_NAME = 'rtv-v2';
const BASE = '/rtv';
const STATIC_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/app.js',
  BASE + '/style.css',
  BASE + '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Ne pas intercepter les flux media ni les requêtes non-GET
  if (e.request.method !== 'GET') return;
  if (/m3u8|stream|mp3|aac|ogg|corsproxy/.test(url)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && url.includes(self.location.origin + BASE)) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => caches.match(BASE + '/index.html'));
    })
  );
});
