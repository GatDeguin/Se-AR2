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

function download(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${response.statusCode}`));
        return;
      }
      const total = parseInt(response.headers['content-length'], 10) || 0;
      let downloaded = 0;
      response.on('data', chunk => {
        downloaded += chunk.length;
        onProgress(downloaded, total);
      });
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const dir = path.join(__dirname, '..', 'libs');
  fs.mkdirSync(dir, { recursive: true });
  const progressPath = path.join(dir, 'progress.json');
  const progress = {};
  const writeProgress = () => {
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  };
  for (const [name, url] of Object.entries(files)) {
    const dest = path.join(dir, name);
    progress[name] = { downloaded: 0, total: 0 };
    writeProgress();
    if (process.env.DRY_RUN === '1') {
      progress[name] = { downloaded: 1, total: 1 };
      writeProgress();
      console.log(`Saved ${dest}`);
      continue;
    }
    console.log(`Downloading ${name}...`);
    try {
      await download(url, dest, (dl, total) => {
        progress[name] = { downloaded: dl, total };
        writeProgress();
        if (total) {
          const pct = ((dl / total) * 100).toFixed(0);
          process.stdout.write(`\r${name}: ${pct}%   `);
        }
      });
      console.log(`\nSaved ${dest}`);
    } catch (err) {
      console.error(`Failed to download ${url}:`, err.message);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
