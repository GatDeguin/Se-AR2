if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.waiting) {
        console.log('Update ready');
      }
    }).catch(err => {
      console.error('SW registration failed', err);
    });
  });
}
