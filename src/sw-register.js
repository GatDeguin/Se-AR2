if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const promptUpdate = worker => {
        if (window.confirm('Update available. Reload?')) {
          worker.postMessage('SKIP_WAITING');
        }
      };

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
