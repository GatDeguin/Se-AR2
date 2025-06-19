import { detectStaticSign } from './staticSigns.js';

export function formatSigns(lms = [], handsInfo = []) {
  const parts = [];
  for (let i = 0; i < lms.length; i++) {
    const sign = detectStaticSign(lms[i]);
    if (!sign) continue;
    const label = handsInfo[i] && handsInfo[i].label ? handsInfo[i].label : `Hand ${i + 1}`;
    parts.push(`${label}: ${sign}`);
  }
  return parts.join(' / ');
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { formatSigns };
}
