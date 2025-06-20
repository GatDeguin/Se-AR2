import { detectStaticSign } from './staticSigns.js';
import { trackerState } from './tracker.js';
import { getAutoTranslateEnabled } from './settings.js';

export function initLsaTranslate({ captionText } = {}) {
  const outEl = captionText || document.getElementById('captionText');
  let buffer = '';
  let lastSign = null;
  let lastTime = 0;

  function loop(now) {
    const enabled = getAutoTranslateEnabled();
    if (!enabled) {
      requestAnimationFrame(loop);
      return;
    }
    let sign = null;
    for (const lm of trackerState.handLandmarks) {
      sign = detectStaticSign(lm);
      if (sign) break;
    }
    if (sign !== lastSign) {
      if (sign) {
        buffer += sign;
        if (outEl) outEl.textContent = buffer;
        lastTime = now;
      } else if (now - lastTime > 800 && buffer && buffer[buffer.length - 1] !== ' ') {
        buffer += ' ';
        if (outEl) outEl.textContent = buffer;
      }
      lastSign = sign;
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
