function detectStaticSign(lm) {
  if (!lm || lm.length < 21) return null;
  const ext = i => lm[i].y < lm[i - 2].y;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const thumbExt = lm[4].x < lm[3].x;
  const indexExt = ext(8);
  const middleExt = ext(12);
  const ringExt = ext(16);
  const pinkExt = ext(20);

  // New letters F-J
  if (indexExt && middleExt && ringExt && pinkExt && thumbExt &&
      dist(lm[4], lm[8]) < 0.1) return 'F';
  if (indexExt && thumbExt && !middleExt && !ringExt && !pinkExt) return 'G';
  if (indexExt && middleExt && thumbExt && !ringExt && !pinkExt) return 'H';
  if (!indexExt && !middleExt && !ringExt && pinkExt && !thumbExt) return 'I';

  // J is normally dynamic; assume final pose with thumb and pinky extended

  if (!indexExt && !middleExt && !ringExt && pinkExt && thumbExt) return 'J';

  if (!indexExt && !middleExt && !ringExt && !pinkExt && thumbExt) return 'A';
  if (indexExt && middleExt && ringExt && pinkExt && !thumbExt) return 'B';
  if (indexExt && middleExt && !ringExt && !pinkExt) return 'C';
  if (indexExt && !middleExt && !ringExt && !pinkExt) return 'D';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt) return 'E';
  return null;
}


module.exports = { detectStaticSign };
