import { detectStaticSign } from './staticSigns.js';

export function formatSigns(lms = [], handsInfo = []) {
  const numberMap = {
    F: 6, G: 7, H: 8, I: 9, J: 10,
    K: 11, L: 12, M: 13, N: 14, O: 15,
    P: 16, Q: 17, R: 18, S: 19, T: 20,
    U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26
  };
  const parts = [];
  for (let i = 0; i < lms.length; i++) {
    const sign = detectStaticSign(lms[i]);
    if (!sign) continue;
    const label = handsInfo[i] && handsInfo[i].label ? handsInfo[i].label : `Hand ${i + 1}`;
    const out = numberMap[sign] ? String(numberMap[sign]) : sign;
    parts.push(`${label}: ${out}`);
  }
  return parts.join(' / ');
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { formatSigns };
}
