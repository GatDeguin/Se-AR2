const https = require('https');
const fs = require('fs');
const path = require('path');

const files = {
  'hands.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
  'face_mesh.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
  'drawing_utils.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'pose.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
  'transformers.min.js': 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js'
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  const dir = path.join(__dirname, '..', 'libs');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, url] of Object.entries(files)) {
    const dest = path.join(dir, name);
    console.log(`Downloading ${name}...`);
    try {
      await download(url, dest);
      console.log(`Saved ${dest}`);
    } catch (err) {
      console.error(`Failed to download ${url}:`, err.message);
    }
  }
})();
