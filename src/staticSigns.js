export function detectStaticSign(lm) {
  if (!lm || lm.length < 21) return null;
  const ext = i => lm[i].y < lm[i - 2].y;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const thumbExt = lm[4].x < lm[3].x;
  const indexExt = ext(8);
  const middleExt = ext(12);
  const ringExt = ext(16);
  const pinkExt = ext(20);
  const indexDown = lm[8].y > lm[6].y;
  const middleDown = lm[12].y > lm[10].y;
  const near = (a, b, t = 0.1) => dist(a, b) < t;

  // New letters F-J
  if (indexExt && middleExt && ringExt && pinkExt && thumbExt &&
      dist(lm[4], lm[8]) < 0.1) return 'F';
  if (indexExt && thumbExt && !middleExt && !ringExt && !pinkExt &&
      dist(lm[4], lm[8]) > 0.2 && (lm[8].x - lm[4].x) > 1) return 'L';
  if (indexExt && thumbExt && !middleExt && !ringExt && !pinkExt) return 'G';
  const sepIM = dist(lm[8], lm[12]);
  if (indexExt && middleExt && thumbExt && !ringExt && !pinkExt && sepIM <= 0.1) return 'H';
  if (indexExt && middleExt && thumbExt && !ringExt && !pinkExt && sepIM > 0.1) return 'K';
  if (!indexExt && !middleExt && !ringExt && pinkExt && !thumbExt) return 'I';
  // J is normally dynamic, tracing a curve with the pinky. We assume the final
  // pose where the pinky and thumb are extended.
  if (!indexExt && !middleExt && !ringExt && pinkExt && thumbExt &&
      dist(lm[4], lm[20]) <= 1.5) return 'J';

  // Additional letters handled below
  if (indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt &&
      (lm[8].x - lm[6].x) > 1) return 'Z';
  if (thumbExt && indexDown && middleDown && !ringExt && !pinkExt &&
      near(lm[4], lm[12])) return 'P';
  if (thumbExt && indexDown && !middleExt && !ringExt && !pinkExt &&
      near(lm[4], lm[8])) return 'Q';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && thumbExt) return 'A';
  if (indexExt && middleExt && ringExt && pinkExt && !thumbExt) return 'B';
  if (indexExt && middleExt && !ringExt && !pinkExt && !thumbExt && sepIM < 0.05 &&
      near(lm[4], lm[8], 0.2))
    return 'R';
  if (indexExt && middleExt && !ringExt && !pinkExt) return 'C';
  if (indexExt && !middleExt && !ringExt && !pinkExt) return 'D';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt &&
      near(lm[4], lm[8]) && !near(lm[4], lm[12])) return 'S';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt &&
      near(lm[4], lm[8], 0.05) && near(lm[4], lm[12], 0.05)) return 'T';
  if (!indexExt && indexDown && !middleExt && !ringExt && !pinkExt && !thumbExt &&
      near(lm[8], lm[6], 0.1))
    return 'X';
  if (!indexExt && !middleExt && !ringExt && !pinkExt && !thumbExt) return 'E';

  if (indexExt && thumbExt && !middleExt && !ringExt && !pinkExt &&
      dist(lm[4], lm[8]) > 0.2 && (lm[8].x - lm[4].x) > 1) return 'L';
  if (indexExt && middleExt && ringExt && thumbExt && !pinkExt) return 'M';
  if (indexExt && middleExt && thumbExt && !ringExt && !pinkExt) return 'N';
  if (indexExt && middleExt && ringExt && pinkExt && thumbExt && dist(lm[4], lm[8]) >= 0.15) return 'O';
  if (indexExt && middleExt && !ringExt && !pinkExt && !thumbExt && sepIM <= 0.05) return 'U';
  if (indexExt && middleExt && !ringExt && !pinkExt && !thumbExt && sepIM > 0.05) return 'V';
  if (indexExt && middleExt && ringExt && !thumbExt && !pinkExt) return 'W';
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkExt &&
      dist(lm[4], lm[20]) > 1.5) return 'Y';

  return null;
}


