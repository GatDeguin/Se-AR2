const requireEsm = require('esm')(module);
const { detectStaticSign } = requireEsm('../src/staticSigns.js');

function baseHand() {
  const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
  lm[3].x = 0; lm[4].x = 1; // thumb not extended
  lm[6].y = 0; lm[8].y = 1; // index not extended
  lm[10].y = 0; lm[12].y = 1; // middle not extended
  lm[14].y = 0; lm[16].y = 1; // ring not extended
  lm[18].y = 0; lm[20].y = 1; // pinky not extended
  return lm;
}

describe('detectStaticSign', () => {
  test('detects sign A', () => {
    const lm = baseHand();
    lm[4].x = -1; // thumb extended
    expect(detectStaticSign(lm)).toBe('A');
  });

  test('detects sign B', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[12].y = -1; lm[16].y = -1; lm[20].y = -1; // fingers extended
    expect(detectStaticSign(lm)).toBe('B');
  });

  test('detects sign C', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[12].y = -1; // index and middle extended
    expect(detectStaticSign(lm)).toBe('C');
  });

  test('detects sign D', () => {
    const lm = baseHand();
    lm[8].y = -1; // only index extended
    expect(detectStaticSign(lm)).toBe('D');
  });

  test('detects sign E', () => {
    const lm = baseHand();
    expect(detectStaticSign(lm)).toBe('E');
  });

  test('detects sign F', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[4].y = -1; // thumb extended
    lm[8].x = -1; lm[8].y = -1; // index extended touching thumb
    lm[12].y = -1; lm[16].y = -1; lm[20].y = -1; // other fingers extended
    expect(detectStaticSign(lm)).toBe('F');
  });

  test('detects sign G', () => {
    const lm = baseHand();
    lm[4].x = -1; // thumb extended
    lm[8].y = -1; // index extended
    expect(detectStaticSign(lm)).toBe('G');
  });

  test('detects sign H', () => {
    const lm = baseHand();
    lm[4].x = -1; // thumb extended
    lm[8].y = -1; lm[12].y = -1; // index and middle extended
    expect(detectStaticSign(lm)).toBe('H');
  });

  test('detects sign I', () => {
    const lm = baseHand();
    lm[20].y = -1; // pinky extended
    expect(detectStaticSign(lm)).toBe('I');
  });

  test('detects sign J', () => {
    const lm = baseHand();
    lm[4].x = -1; // thumb extended
    lm[20].y = -1; // pinky extended
    expect(detectStaticSign(lm)).toBe('J');
  });

  test('returns null for malformed input', () => {
    expect(detectStaticSign(null)).toBeNull();
    expect(detectStaticSign([])).toBeNull();
    const shortArray = Array.from({ length: 10 }, () => ({ x: 0, y: 0 }));
    expect(detectStaticSign(shortArray)).toBeNull();
  });
});
