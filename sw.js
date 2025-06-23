const CACHE_VERSION = 'v2';
const CACHE_NAME = `sear-cache-${CACHE_VERSION}`;
const MODEL_CACHE = 'offline-models';
const MODEL_VERSION_URL = '/libs/model-version.json';
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
const LIB_ASSETS = ASSETS.filter(a => a.startsWith('/libs/')).concat(MODEL_VERSION_URL);
self.addEventListener('install', evt => {
  evt.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)),
      caches.open(MODEL_CACHE).then(cache => cache.addAll(LIB_ASSETS))
    ])
  );
  self.skipWaiting();
});
self.addEventListener('activate', evt => {
  evt.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== MODEL_CACHE)
        .map(k => caches.delete(k))
    );
    await checkModelVersion();
  })());
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
  if (evt.data === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (evt.data && evt.data.type === 'DELETE_MODEL' && evt.data.url) {
    evt.waitUntil(
      caches.open(MODEL_CACHE).then(cache => cache.delete(evt.data.url))
    );
  }
  if (evt.data === 'REFRESH_MODELS') {
    evt.waitUntil(checkModelVersion());
  }
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

async function notifyClients(msg) {
  const clients = await self.clients.matchAll();
  for (const client of clients) client.postMessage(msg);
}

async function downloadModels() {
  const cache = await caches.open(MODEL_CACHE);
  await cache.addAll(LIB_ASSETS);
}

async function checkModelVersion() {
  try {
    const cache = await caches.open(MODEL_CACHE);
    const [net, oldRes] = await Promise.all([
      fetch(MODEL_VERSION_URL, { cache: 'no-store' }),
      cache.match(MODEL_VERSION_URL)
    ]);
    if (!net.ok) return;
    const newText = await net.clone().text();
    const oldText = oldRes ? await oldRes.text() : null;
    await cache.put(MODEL_VERSION_URL, net.clone());
    if (oldText && oldText !== newText) {
      await downloadModels();
      notifyClients({ type: 'MODEL_UPDATE_AVAILABLE', version: newText });
    }
  } catch (err) {
    // ignore errors
  }
}
