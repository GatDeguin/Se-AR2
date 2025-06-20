if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const promptUpdate = worker => {
        if (window.confirm('Update available. Reload?')) {
          worker.postMessage('SKIP_WAITING');
        }
      };

      // Check for updates on load and periodically
      reg.update();
      setInterval(() => reg.update(), 60 * 60 * 1000);

      if (reg.waiting) {
        promptUpdate(reg.waiting);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            promptUpdate(newWorker);
          }
        });
      });
    }).catch(err => {
      console.error('SW registration failed', err);
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      pageReload();
    });
  });
}

let pageReload = () => {
  window.location.reload();
};

if (typeof module !== 'undefined') {
  module.exports = {
    setPageReload(fn) { pageReload = fn; },
    pageReload: () => pageReload(),
  };
}
