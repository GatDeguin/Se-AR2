import { pipeline } from '../libs/transformers.min.js';

let transcriber;

async function ensurePipeline() {
  if (!transcriber) {
    const device = self.navigator && self.navigator.gpu ? 'webgpu' : 'wasm';
    transcriber = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      quantized: true,
      device
    });
  }
  return transcriber;
}

self.onmessage = async e => {
  const pcm = e.data;
  const p = await ensurePipeline();
  const { text } = await (await p)(pcm, { chunk_length_s: 30, language: 'spanish' });
  self.postMessage(text.trim());
};
