import { detectStaticSign } from './staticSigns.js';

export function formatSigns(lms = [], handsInfo = []) {
  const numberMap = { F: 6, G: 7, H: 8, I: 9, J: 10 };
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
