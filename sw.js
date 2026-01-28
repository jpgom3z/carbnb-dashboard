const CACHE_NAME = 'carbnb-v1';
const urlsToCache = [
  '/carbnb-dashboard/',
  '/carbnb-dashboard/index.html',
  '/carbnb-dashboard/styles.css',
  '/carbnb-dashboard/app.js',
  '/carbnb-dashboard/manifest.json',
  '/carbnb-dashboard/icon-192.png',
  '/carbnb-dashboard/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});