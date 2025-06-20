const { detectStaticSign } = require('../src/staticSigns.cjs');

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

  // Additional tests for F-J using mocked landmark arrays
  test('recognizes sign F with separate array', () => {
    const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    lm[4] = { x: -1, y: -1 };
    lm[8] = { x: -1, y: -1 };
    lm[12].y = -1; lm[16].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('F');
  });

  test('recognizes sign G with separate array', () => {
    const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    lm[4].x = -1; lm[8].y = -1;
    expect(detectStaticSign(lm)).toBe('G');
  });

  test('recognizes sign H with separate array', () => {
    const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    lm[4].x = -1; lm[8].y = -1; lm[12].y = -1;
    expect(detectStaticSign(lm)).toBe('H');
  });

  test('recognizes sign I with separate array', () => {
    const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('I');
  });

  test('recognizes sign J with separate array', () => {
    const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    lm[4].x = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('J');
  });

  test('recognizes sign K with spread fingers', () => {
    const lm = baseHand();
    lm[4].x = -1; // thumb
    lm[8].y = -1; lm[12].y = -1; // index and middle
    lm[8].x = -0.5; lm[12].x = 0.5; // separated
    expect(detectStaticSign(lm)).toBe('K');
  });

  test('recognizes sign L with right angle', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[4].y = -1; // thumb
    lm[8].y = -1; lm[8].x = 1; // index far from thumb
    expect(detectStaticSign(lm)).toBe('L');
  });

  test('recognizes sign M with three fingers and thumb', () => {
    const lm = baseHand();
    lm[4].x = -1;
    lm[8].y = -1; lm[12].y = -1; lm[16].y = -1; // index middle ring
    expect(detectStaticSign(lm)).toBe('M');
  });

  test('recognizes sign W with three extended fingers', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[12].y = -1; lm[16].y = -1; // index middle ring
    expect(detectStaticSign(lm)).toBe('W');
  });

  test('recognizes sign Y with thumb and pinky', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[20].x = 2; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('Y');
  });

  test('recognizes sign P with thumb, index and ring', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[8].y = -1; lm[16].y = -1;
    expect(detectStaticSign(lm)).toBe('P');
  });

  test('recognizes sign Q with thumb, index and pinky', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[8].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('Q');
  });

  test('recognizes sign R with index, middle and pinky', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[12].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('R');
  });

  test('recognizes sign S with last three fingers', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[16].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('S');
  });

  test('recognizes sign T with middle and pinky over thumb', () => {
    const lm = baseHand();
    lm[4].x = -1; lm[12].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('T');
  });

  test('recognizes sign X with index and ring extended', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[16].y = -1;
    expect(detectStaticSign(lm)).toBe('X');
  });

  test('recognizes sign Z with index, ring and pinky', () => {
    const lm = baseHand();
    lm[8].y = -1; lm[16].y = -1; lm[20].y = -1;
    expect(detectStaticSign(lm)).toBe('Z');
  });
});
