import { detectStaticSign } from './staticSigns.js';
import { getAutoTranslateEnabled } from './settings.js';

export function createTranslator(outEl) {
  let buffer = '';
  let lastSign = null;
  let stableSign = null;
  let stableCount = 0;
  let lastTime = 0;

  function updateOutput() {
    if (outEl) outEl.textContent = buffer;
  }

  function append(letter, now) {
    buffer += letter;
    updateOutput();
    lastTime = now;
  }

  function processFrame(sign, now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    if (sign === stableSign) {
      stableCount += 1;
    } else {
      stableSign = sign;
      stableCount = 1;
    }
    if (stableCount >= 3 && sign !== lastSign) {
      if (sign) {
        append(sign, now);
      } else if (now - lastTime > 800 && buffer && buffer[buffer.length - 1] !== ' ') {
        append(' ', now);
      }
      lastSign = sign;
    }
  }

  function clear() {
    buffer = '';
    updateOutput();
    lastSign = stableSign = null;
    stableCount = 0;
  }

  function getBuffer() {
    return buffer;
  }

  return { processFrame, clear, getBuffer };
}

export function initLsaTranslate({ captionText } = {}) {
  const outEl = captionText || document.getElementById('captionText');
  const { processFrame } = createTranslator(outEl);
  let trackerState = null;

  import('./tracker.js').then(m => { trackerState = m.trackerState; });

  function loop(now) {
    if (!getAutoTranslateEnabled()) {
      requestAnimationFrame(loop);
      return;
    }
    let sign = null;
    const hands = trackerState ? trackerState.handLandmarks : [];
    for (const lm of hands) {
      sign = detectStaticSign(lm);
      if (sign) break;
    }
    processFrame(sign, now);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
