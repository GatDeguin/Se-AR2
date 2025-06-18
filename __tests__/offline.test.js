const fs = require('fs');
const path = require('path');

const libsDir = path.resolve(__dirname, '../libs');

beforeAll(() => {
  if (fs.existsSync(libsDir)) fs.rmSync(libsDir, { recursive: true, force: true });
});

test('prepareOffline creates progress file in dry run', async () => {
  process.env.DRY_RUN = '1';
  await require('../scripts/prepareOffline.js')();
  const progressFile = path.join(libsDir, 'progress.json');
  expect(fs.existsSync(progressFile)).toBe(true);
  const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  expect(data['hands.js']).toBeDefined();
});

test('prepareOffline resumes using existing progress file', async () => {
  process.env.DRY_RUN = '1';
  await require('../scripts/prepareOffline.js')();
  const progressFile = path.join(libsDir, 'progress.json');
  const first = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  await require('../scripts/prepareOffline.js')();
  const second = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  expect(second['hands.js']).toBeDefined();
  expect(second['hands.js'].downloaded).toBeGreaterThanOrEqual(first['hands.js'].downloaded);
});
