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
  global.Blob = require('buffer').Blob;
  fs.mkdirSync(libsDir, { recursive: true });
  fs.writeFileSync(stubPath, stubContent);
  global.self = { navigator: {}, postMessage: jest.fn() };
  global.AudioContext = class {
    async decodeAudioData() {
      return {
        sampleRate: 16000,
        duration: 0,
        getChannelData: () => Float32Array.from([0, 0.1])
      };
    }
    close() {}
  };
});

afterEach(() => {
  if (fs.existsSync(stubPath)) fs.unlinkSync(stubPath);
});

test('posting audio blob returns transcribed text', async () => {
  await requireEsm('../src/transcribeWorker.js');
  const blob = new Blob([Uint8Array.from([0,1,2])], { type: 'audio/webm' });
  await global.self.onmessage({ data: blob });
  expect(global.self.postMessage).toHaveBeenCalledWith('Hola mundo');
});
