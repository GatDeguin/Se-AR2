const CACHE_NAME = 'sear-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/app.js',
  '/src/sw-register.js',
  '/three.min.js',
  '/opencv.js',
  '/enter.mp3',
  '/done.mp3',
];
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});

self.addEventListener('message', evt => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});
