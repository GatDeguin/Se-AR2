if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      let banner;
      let waitingWorker;
      const promptUpdate = worker => {
        waitingWorker = worker;
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'updateBanner';
          banner.className = 'update-banner';
          banner.innerHTML = '<span>Actualización disponible</span> <button id="updateButton">Actualizar</button>';
          banner.querySelector('#updateButton').addEventListener('click', () => {
            if (waitingWorker) waitingWorker.postMessage('SKIP_WAITING');
            banner.remove();
          });
          document.body.appendChild(banner);
        }
        banner.classList.add('show');
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
