const TRAIL_LEN = 5;
const trails = [];

function updateTrails(hands = []) {
  for (let i = 0; i < hands.length; i++) {
    const lm = hands[i];
    if (!trails[i]) trails[i] = [];
    if (lm && lm[20]) {
      const t = trails[i];
      t.push({ x: lm[20].x, y: lm[20].y });
      if (t.length > TRAIL_LEN) t.shift();
    } else {
      trails[i] = [];
    }
  }
  trails.length = hands.length;
}

function detectJ(trail = []) {
  if (trail.length < TRAIL_LEN) return false;
  const first = trail[0];
  const mid = trail[2];
  const last = trail[trail.length - 1];
  const down = mid.y - first.y > 0.05;
  const left = last.x - mid.x < -0.05;
  const up = last.y - mid.y < -0.02;
  return down && left && up;
}

function detectZ(trail = []) {
  if (trail.length < TRAIL_LEN) return false;
  const p1 = trail[1];
  const p2 = trail[2];
  const p3 = trail[3];
  const horiz1 = Math.abs(p1.y - trail[0].y) < 0.05 && p1.x > trail[0].x;
  const diag = p2.x < p1.x && p2.y > p1.y;
  const horiz2 = Math.abs(p3.y - p2.y) < 0.05 && p3.x > p2.x;
  return horiz1 && diag && horiz2;
}

function detectDynamicSigns() {
  return trails.map(tr => {
    if (detectJ(tr)) { tr.length = 0; return 'J'; }
    if (detectZ(tr)) { tr.length = 0; return 'Z'; }
    return null;
  });
}

function resetTrails() { trails.forEach((t, i) => trails[i] = []); }

module.exports = { updateTrails, detectDynamicSigns, resetTrails, detectJ, detectZ };
