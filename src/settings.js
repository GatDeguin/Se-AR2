import { ripple } from './utils.js';

export let hapticsEnabled = true;
export let autoTranslateEnabled = true;
export function getHapticsEnabled(){
  return hapticsEnabled;
}
export function getAutoTranslateEnabled(){
  return autoTranslateEnabled;
}

export function initSettings(refs){
  const {
    settingsScreen, settingsBtn, settingsBack,
    themeToggle, themeValue, contrastToggle,
    subtitleSizeSlider, subtitleSizeValue,
    subtitleFontSelect, subtitleColorInput,
    dialectSelect, cameraSelect, micSelect,
    repeatTourBtn, resetPrefsBtn, downloadSttBtn,
    lsaSettingsBtn, hapticsToggle, autoTranslateToggle, captionContainer,
    startTour, startStream
  } = refs;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeValue.textContent = 'Claro';
  }

  const savedContrast = localStorage.getItem('contrast');
  if (savedContrast === 'true') {
    document.body.classList.add('high-contrast');
    if (contrastToggle) contrastToggle.checked = true;
  }

  const savedSize = localStorage.getItem('subtitleSize');
  if (savedSize) {
    subtitleSizeSlider.value = savedSize;
    subtitleSizeValue.textContent = savedSize + ' pt';
    captionContainer.style.fontSize = savedSize + 'px';
  }

  const savedFont = localStorage.getItem('subtitleFont');
  if (savedFont && subtitleFontSelect) {
    subtitleFontSelect.value = savedFont;
    captionContainer.style.fontFamily = savedFont;
  }

  const savedColor = localStorage.getItem('subtitleColor');
  if (savedColor && subtitleColorInput) {
    subtitleColorInput.value = savedColor;
    captionContainer.style.color = savedColor;
  }

  const savedDialect = localStorage.getItem('dialect');
  if (savedDialect && dialectSelect) {
    dialectSelect.value = savedDialect;
  }

  const savedCamera = localStorage.getItem('cameraId');
  const savedMic = localStorage.getItem('micId');

  const savedHaptics = localStorage.getItem('haptics');
  if (savedHaptics === 'false') {
    hapticsEnabled = false;
    if (hapticsToggle) hapticsToggle.checked = false;
  }

  const savedAuto = localStorage.getItem('autoTranslate');
  if (savedAuto === 'false') {
    autoTranslateEnabled = false;
    if (autoTranslateToggle) autoTranslateToggle.checked = false;
  }

  settingsBtn.onclick = e => {
    ripple(e, settingsBtn);
    settingsScreen.classList.add('show');
  };
  settingsBack.onclick = e => {
    ripple(e, settingsBack);
    settingsScreen.classList.remove('show');
  };

  themeToggle.onclick = e => {
    ripple(e, themeToggle);
    const isLight = document.body.classList.toggle('light');
    themeValue.textContent = isLight ? 'Claro' : 'Oscuro';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    window.dispatchEvent(new Event('themechange'));
  };

  if (contrastToggle) contrastToggle.onclick = e => {
    ripple(e, contrastToggle);
    const enabled = contrastToggle.checked;
    document.body.classList.toggle('high-contrast', enabled);
    localStorage.setItem('contrast', enabled);
    window.dispatchEvent(new Event('themechange'));
  };

  if (hapticsToggle) hapticsToggle.onclick = e => {
    ripple(e, hapticsToggle);
    hapticsEnabled = hapticsToggle.checked;
    localStorage.setItem('haptics', hapticsEnabled);
  };

  if (autoTranslateToggle) autoTranslateToggle.onclick = e => {
    ripple(e, autoTranslateToggle);
    autoTranslateEnabled = autoTranslateToggle.checked;
    localStorage.setItem('autoTranslate', autoTranslateEnabled);
    window.dispatchEvent(new Event('autotranslatechange'));
  };

  subtitleSizeSlider.oninput = () => {
    subtitleSizeValue.textContent = subtitleSizeSlider.value + ' pt';
    captionContainer.style.fontSize = subtitleSizeSlider.value + 'px';
    localStorage.setItem('subtitleSize', subtitleSizeSlider.value);
  };

  if (dialectSelect) {
    dialectSelect.onchange = () => {
      localStorage.setItem('dialect', dialectSelect.value);
    };
  }

  if (subtitleFontSelect) subtitleFontSelect.onchange = () => {
    captionContainer.style.fontFamily = subtitleFontSelect.value;
    localStorage.setItem('subtitleFont', subtitleFontSelect.value);
  };

  if (subtitleColorInput) subtitleColorInput.oninput = () => {
    captionContainer.style.color = subtitleColorInput.value;
    localStorage.setItem('subtitleColor', subtitleColorInput.value);
  };

  if (cameraSelect) cameraSelect.onchange = () => {
    localStorage.setItem('cameraId', cameraSelect.value);
    if(startStream) startStream(cameraSelect.value);
  };

  if (micSelect) micSelect.onchange = () => {
    localStorage.setItem('micId', micSelect.value);
  };

  if (repeatTourBtn) repeatTourBtn.onclick = e => {
    ripple(e, repeatTourBtn);
    localStorage.removeItem('tourSeen');
    settingsScreen.classList.remove('show');
    startTour && startTour();
  };

  if (resetPrefsBtn) resetPrefsBtn.onclick = e => {
    ripple(e, resetPrefsBtn);
    if (confirm('¿Restablecer todas las preferencias?')) {
      localStorage.clear();
      location.reload();
    }
  };

  if (downloadSttBtn) downloadSttBtn.onclick = async e => {
    ripple(e, downloadSttBtn);
    downloadSttBtn.textContent = '0%';
    downloadSttBtn.disabled = true;
    try {
      const url = new URL('../libs/transformers.min.js', import.meta.url);
      const res = await fetch(url);
      const reader = res.body.getReader();
      const length = +res.headers.get('content-length') || 0;
      let received = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (length) downloadSttBtn.textContent = Math.floor(received / length * 100) + '%';
      }
      const blob = new Blob(chunks, { type: res.headers.get('content-type') });
      const response = new Response(blob);
      const cache = await caches.open('offline-models');
      await cache.put(url, response);
      downloadSttBtn.textContent = 'Descargado ✓';
    } catch (err) {
      downloadSttBtn.textContent = 'Error';
    }
  };

  if (lsaSettingsBtn) lsaSettingsBtn.onclick = e => {
    ripple(e, lsaSettingsBtn);
    alert('Próximamente');
  };

  return { savedCamera, savedMic };
}
