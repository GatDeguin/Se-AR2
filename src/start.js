(async () => {
  const { initSplash } = await import('./splash.js');
  initSplash(document.getElementById('splash'));
  await import('./app.js');
  import('./sw-register.js');
})();
