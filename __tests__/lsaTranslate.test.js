const requireEsm = require('esm')(module);
const { createTranslator } = requireEsm('../src/lsaTranslate.js');

describe('LSA translator', () => {
  test('accumulates letters after stable detection', () => {
    const out = { textContent: '' };
    const t = createTranslator(out);
    t.processFrame('A', 0);
    t.processFrame('A', 50);
    t.processFrame('A', 100); // stable for 3 frames
    expect(out.textContent).toBe('A');
    t.processFrame(null, 150); // start gap
    t.processFrame(null, 500);
    t.processFrame(null, 950);
    t.processFrame(null, 1000); // >800ms since last letter
    expect(out.textContent).toBe('A ');
    expect(t.getBuffer()).toBe('A ');
  });
});
