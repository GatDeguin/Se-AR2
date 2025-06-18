export function detectStaticSign(lm) {
  if (!lm || lm.length < 21) return null;
  const ext = i => lm[i].y < lm[i - 2].y;
  const thumbExt = lm[4].x < lm[3].x;
  const indexExt = ext(8);
  const middleExt = ext(12);
  const ringExt = ext(16);
  const pinkExt = ext(20);

  if (!indexExt && !middleExt && !ringExt && !pinkExt && thumbExt) return 'A';
  if (indexExt && middleExt && ringExt && pinkExt && !thumbExt) return 'B';
  if (indexExt && middleExt && !ringExt && !pinkExt) return 'C';
  if (indexExt && !middleExt && !ringExt && !pinkExt) return 'D';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt) return 'E';
  return null;
}
