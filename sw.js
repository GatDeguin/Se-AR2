const CACHE_NAME = 'sear-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/app.js',
  '/src/sw-register.js',
  '/src/transcribeWorker.js',
  '/enter.mp3',
  '/done.mp3',
  '/libs/hands.js',
  '/libs/face_mesh.js',
  '/libs/drawing_utils.js',
  '/libs/transformers.min.js',
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
  const url = new URL(evt.request.url);
  if (url.origin === location.origin && url.pathname.startsWith('/libs/')) {
    evt.respondWith(
      caches.open('offline-models').then(async cache => {
        const cached = await cache.match(evt.request);
        if (cached) return cached;
        const res = await fetch(evt.request);
        if (res.ok) cache.put(evt.request, res.clone());
        return res;
      })
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});

self.addEventListener('message', evt => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});
