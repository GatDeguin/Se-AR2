const { updateTrails, detectDynamicSigns, resetTrails } = require('../src/dynamicSigns.cjs');

function frame(x, y){
  const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
  lm[20] = { x, y };
  return lm;
}

test('detects letter J trajectory', () => {
  resetTrails();
  const seq = [
    frame(0.5,0.5),
    frame(0.5,0.6),
    frame(0.45,0.7),
    frame(0.4,0.65),
    frame(0.38,0.6)
  ];
  seq.forEach(f => updateTrails([f]));
  const out = detectDynamicSigns();
  expect(out[0]).toBe('J');
});

test('detects letter Z trajectory', () => {
  resetTrails();
  const seq = [
    frame(0.2,0.2),
    frame(0.3,0.2),
    frame(0.25,0.25),
    frame(0.35,0.25),
    frame(0.45,0.25)
  ];
  seq.forEach(f => updateTrails([f]));
  const out = detectDynamicSigns();
  expect(out[0]).toBe('Z');
});
