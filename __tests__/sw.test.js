const path = require('path');

beforeEach(() => {
  jest.resetModules();
});

test('service worker registers', () => {
  const register = jest.fn().mockResolvedValue({});
  Object.defineProperty(window, 'navigator', {
    value: { serviceWorker: { register } },
    configurable: true
  });
  require('../src/sw-register.js');
  window.dispatchEvent(new Event('load'));
  expect(register).toHaveBeenCalledWith('sw.js');
});
