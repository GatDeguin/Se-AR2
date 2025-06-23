beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  document.body.innerHTML = '';
});
afterEach(() => {
  jest.clearAllTimers();
});


test('service worker registers', () => {
  const register = jest.fn().mockResolvedValue({ addEventListener: jest.fn(), update: jest.fn() });
  Object.defineProperty(window, 'navigator', {
    value: { serviceWorker: { register, addEventListener: jest.fn() } },
    configurable: true
  });
  require('../src/sw-register.js');
  window.dispatchEvent(new Event('load'));
  expect(register).toHaveBeenCalledWith('sw.js');
});

test('shows banner when waiting worker present', async () => {
  const postMessage = jest.fn();
  const register = jest.fn().mockResolvedValue({ waiting: { postMessage }, addEventListener: jest.fn(), update: jest.fn() });
  Object.defineProperty(window, 'navigator', {
    value: { serviceWorker: { register, addEventListener: jest.fn() } },
    configurable: true
  });
  require('../src/sw-register.js');
  window.dispatchEvent(new Event('load'));
  await Promise.resolve();
  await Promise.resolve();
  const banner = document.getElementById('updateBanner');
  expect(banner).not.toBeNull();
  expect(banner.classList.contains('show')).toBe(true);
  expect(postMessage).not.toHaveBeenCalled();
});

test('clicking update posts message and reloads', async () => {
  const postMessage = jest.fn();
  const register = jest.fn().mockResolvedValue({ waiting: { postMessage }, addEventListener: jest.fn(), update: jest.fn() });
  let controllerHandler;
  const addEventListener = jest.fn((e, cb) => { if (e === 'controllerchange') controllerHandler = cb; });
  Object.defineProperty(window, 'navigator', {
    value: { serviceWorker: { register, addEventListener } },
    configurable: true
  });
  const swReg = require('../src/sw-register.js');
  const reloadSpy = jest.fn();
  swReg.setPageReload(reloadSpy);
  window.dispatchEvent(new Event('load'));
  await Promise.resolve();
  await Promise.resolve();
  const btn = document.querySelector('#updateBanner button');
  btn.click();
  await Promise.resolve();
  expect(postMessage).toHaveBeenCalledWith('SKIP_WAITING');
  controllerHandler();
  expect(reloadSpy).toHaveBeenCalled();
});
