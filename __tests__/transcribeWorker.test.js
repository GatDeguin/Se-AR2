const fs = require('fs');
const path = require('path');
const { TextEncoder, TextDecoder } = require('util');
const requireEsm = require('esm')(module);

const libsDir = path.resolve(__dirname, '../libs');
const stubPath = path.join(libsDir, 'transformers.min.js');
const stubContent = "export function pipeline(){ return Promise.resolve(async () => ({ text: 'Hola mundo\\n' })); }";

beforeEach(() => {
  jest.resetModules();
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  fs.mkdirSync(libsDir, { recursive: true });
  fs.writeFileSync(stubPath, stubContent);
  global.self = { navigator: {}, postMessage: jest.fn() };
});

afterEach(() => {
  if (fs.existsSync(stubPath)) fs.unlinkSync(stubPath);
});

test('posting pcm array returns transcribed text', async () => {
  await requireEsm('../src/transcribeWorker.js');
  const pcm = Float32Array.from([0, 0.1]);
  await global.self.onmessage({ data: pcm });
  expect(global.self.postMessage).toHaveBeenCalledWith('Hola mundo');
});
