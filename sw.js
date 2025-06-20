const CACHE_VERSION = 'v2';
const CACHE_NAME = `sear-cache-${CACHE_VERSION}`;
const MODEL_CACHE = 'offline-models';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/app.js',
  '/src/sw-register.js',
  '/src/transcribeWorker.js',
  '/enter.mp3',
  '/done.mp3',
  '/offline.html',
  '/libs/hands.js',
  '/libs/face_mesh.js',
  '/libs/drawing_utils.js',
  '/libs/transformers.min.js',
  '/libs/hands_solution_wasm_bin.wasm',
  '/libs/hands_solution_simd_wasm_bin.wasm',
  '/libs/face_mesh_solution_wasm_bin.wasm',
  '/libs/face_mesh_solution_simd_wasm_bin.wasm',
  '/libs/pose_solution_wasm_bin.wasm',
  '/libs/pose_solution_simd_wasm_bin.wasm',
];
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== MODEL_CACHE)
        .map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});
self.addEventListener('fetch', evt => {
  if (evt.request.method !== 'GET') return;
  const url = new URL(evt.request.url);

  if (url.origin === location.origin && url.pathname.startsWith('/libs/')) {
    evt.respondWith(
      caches.open(MODEL_CACHE).then(async cache => {
        try {
          const res = await fetch(evt.request);
          if (res.ok) cache.put(evt.request, res.clone());
          return res;
        } catch (err) {
          const cached = await cache.match(evt.request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        }
      })
    );
    return;
  }

  if (url.origin === location.origin && url.pathname.endsWith('.html')) {
    evt.respondWith(networkFirst(evt.request));
    return;
  }

  evt.respondWith(cacheFirst(evt.request));
});

self.addEventListener('message', evt => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch (err) {
    return caches.match(OFFLINE_URL);
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
      return res;
    }
    throw new Error('Network error');
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}
