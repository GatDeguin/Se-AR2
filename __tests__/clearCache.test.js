describe('service worker cache deletion', () => {
  let handlers;
  let store;
  beforeEach(() => {
    jest.resetModules();
    handlers = {};
    store = new Map();
    global.self = {
      addEventListener: (evt, cb) => { handlers[evt] = cb; },
      skipWaiting: jest.fn(),
      clients: { claim: jest.fn() }
    };
    const cache = {
      delete: jest.fn(key => { store.delete(key); return Promise.resolve(true); }),
      put: jest.fn((k,v) => { store.set(k,v); return Promise.resolve(); })
    };
    global.caches = {
      open: jest.fn().mockResolvedValue(cache),
    };
    global.self.location = { origin: 'http://localhost' };
    require('../sw.js');
    global._cache = cache;
  });

  test('deletes entry from offline-models cache', async () => {
    await handlers.message({ data: { type: 'DELETE_MODEL', url: 'foo' }, waitUntil: p => p });
    expect(global.caches.open).toHaveBeenCalledWith('offline-models');
    expect(global._cache.delete).toHaveBeenCalledWith('foo');
  });
});
