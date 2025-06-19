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

async function blobToPCM(blob, rate = 16000) {
  const ac = new AudioContext();
  let off;
  try {
    const buf = await blob.arrayBuffer();
    const dec = await ac.decodeAudioData(buf);
    if (dec.sampleRate === rate) {
      return dec.getChannelData(0).slice();
    }
    const frames = Math.ceil(dec.duration * rate);
    off = new OfflineAudioContext(1, frames, rate);
    const src = off.createBufferSource();
    src.buffer = dec;
    src.connect(off.destination);
    src.start();
    const res = await off.startRendering();
    off.close && off.close();
    return res.getChannelData(0).slice();
  } finally {
    ac.close();
  }
}

self.onmessage = async e => {
  const pcm = await blobToPCM(e.data);
  const p = await ensurePipeline();
  const { text } = await (await p)(pcm, { chunk_length_s: 30, language: 'spanish' });
  self.postMessage(text.trim());
};
