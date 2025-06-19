const https = require('https');
const fs = require('fs');
const path = require('path');

const files = {
  // Core MediaPipe wrappers
  'hands.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
  'face_mesh.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
  'drawing_utils.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'pose.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
  // Whisper integration
  'transformers.min.js': 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js',

  // Additional assets required by the MediaPipe solutions
  // Hands
  'hands_solution_packed_assets_loader.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_packed_assets_loader.js',
  'hands_solution_packed_assets.data': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_packed_assets.data',
  'hands_solution_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_wasm_bin.js',
  'hands_solution_simd_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_simd_wasm_bin.js',
  'hands_solution_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_wasm_bin.wasm',
  'hands_solution_simd_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_simd_wasm_bin.wasm',
  'hand_landmark_full.tflite': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hand_landmark_full.tflite',
  'hand_landmark_lite.tflite': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hand_landmark_lite.tflite',
  'hands.binarypb': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.binarypb',

  // Face Mesh
  'face_mesh_solution_packed_assets_loader.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets_loader.js',
  'face_mesh_solution_packed_assets.data': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets.data',
  'face_mesh_solution_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_wasm_bin.js',
  'face_mesh_solution_simd_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.js',
  'face_mesh_solution_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_wasm_bin.wasm',
  'face_mesh_solution_simd_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.wasm',
  'face_mesh.binarypb': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.binarypb',

  // Pose
  'pose_solution_packed_assets_loader.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_packed_assets_loader.js',
  'pose_solution_packed_assets.data': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_packed_assets.data',
  'pose_solution_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_wasm_bin.js',
  'pose_solution_simd_wasm_bin.js': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_simd_wasm_bin.js',
  'pose_solution_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_wasm_bin.wasm',
  'pose_solution_simd_wasm_bin.wasm': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_simd_wasm_bin.wasm',
  'pose_landmark_full.tflite': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_landmark_full.tflite',
  'pose_landmark_heavy.tflite': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_landmark_heavy.tflite',
  'pose_landmark_lite.tflite': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_landmark_lite.tflite',
  'pose_web.binarypb': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_web.binarypb'
};

function download(opts, dest, onProgress) {
  const { url, headers = {} } = typeof opts === 'string' ? { url: opts } : opts;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: headers.Range ? 'a' : 'w' });
    https.get(url, { headers }, response => {
      if (![200, 206].includes(response.statusCode)) {
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
  let progress = {};
  if (fs.existsSync(progressPath)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    } catch {
      progress = {};
    }
  }
  const writeProgress = () => {
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  };
  for (const [name, url] of Object.entries(files)) {
    const dest = path.join(dir, name);
    if (!progress[name]) progress[name] = { downloaded: 0, total: 0 };
    writeProgress();
    if (process.env.DRY_RUN === '1') {
      progress[name] = { downloaded: 1, total: 1 };
      writeProgress();
      console.log(`Saved ${dest}`);
      continue;
    }
    const headers = {};
    let start = 0;
    if (fs.existsSync(dest)) {
      start = fs.statSync(dest).size;
      if (start > 0) headers.Range = `bytes=${start}-`;
    }
    console.log(`Downloading ${name}...`);
    try {
      await download({ url, headers }, dest, (dl, total) => {
        progress[name] = { downloaded: start + dl, total: start + total };
        writeProgress();
        if (total) {
          const pct = (((start + dl) / (start + total)) * 100).toFixed(0);
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
