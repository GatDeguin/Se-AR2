const CACHE_NAME = 'sear-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/app.js',
  '/src/sw-register.js',
  '/three.min.js',
  '/opencv.js',
  '/libs/drawing_utils.js',
  '/libs/face_mesh.js',
  '/libs/hands.js',
  '/libs/pose.js',
  '/libs/transformers.min.js',
  '/enter.mp3',
  '/done.mp3',
];
self.addEventListener('install', evt => {
  self.skipWaiting();
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
