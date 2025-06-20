const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const key = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDBPpzKw5r1+TRd
l5gfXM7qU1JdYxtNOW6mMVNgENE5dtwtceW+5m1e1wMbWulR3h5Wrdt5xTKrzZw+
MdHpsugAdTqxe+xOK87qhfp39ETiB6cqQnKjkumv0IN9AiWkB+NhchDyD9K0DnD0
NGIdut/0iJWkuA930OtPwZoWyub5/86ymr0/Lo9GmESkyd2I04f5+RQOe0Wdcbaj
xQzdSthds3NZWdHnhcsPXxfR9u4vsWF8yMXerahKwLIrLCc17wNQFUbHxaFRAmqw
L++lgDIpmkqiPMlFI5tlRUBqaM2HUyV4uQ0HXxA/jKc+W/O63+KeNrCBy+N9yqdz
V0dFFg9XAgMBAAECggEAVm7r8GFXMUe6nVYNy5FWV0bXYz/N2Vej3x/W2/QJsPsx
9f2oth8Ysj/XeufJzj1cMobm0OtcA64egU8FRdMoo/PLQdFc24YKsaklY3vVR4gG
xAcegX1XmrTX6xUHwvtoP5Cmda6QHssKyJ+ZdxS70QM6c4eEG6JNbcn5YtJ0R0LV
hoqBcn8vPgSociPsW31WVDLBCTJH9Iv0F0NqYV6eWptr6cs7UV40uVQtPyTb1DUh
orSZqRRAaR8ZSdXfBLSyl5D17xR5GvSbCajZcq1JRCXfWkQRP9fgaxIFUOsSE4rl
EcOLZgLGPDEbdSiU/+zPxXBiBq6yeoP8D1+fb0IFsQKBgQDob5rnVDEWcRGoW4Ru
9X7WNz+LBIILKbyNXL8mgk5aKC6DPo7g464bCwTgUj9mkZ1KYTroLGQlL6AuPPzX
e81QAspIVOjpwkDLOlrBGrgdazbTGK1HBtUTxSeQKrNzx2O+kjmOSCmk3ljNBBGi
PHlfMepEzJLbX/CiWTg0w1XbKQKBgQDU1eBMt6QxiI9UvpvlcPNNSavf1MjqC7ZG
BpERiOxxjXCMvmSTwVwgrlR7kocPXiRjVWJadqpegpPaUjBRKby/0IGgEThT98A7
/n4peOFs9sdGmDYgnUNbikLoEqQcbX4pCVaxC8ftdoAJTEoSih0NIMD/cvKu8FId
mIw7WExmfwKBgQCntbdoSHguwCDEgFwbD6mX+T8xGGyYj2HMAequZ4EPTkTZT+8Z
104NlzLKhK3YXSLHw0YUtcsAhc+m7TxmYp6up4S7EgEIga/ss0s+YAAOwghJ4llM
kWJ3JF86h4T5+hk/LRS4U9swaXpbWx86FzZf+I0XXSBth1kCWyvR7ktpmQKBgQCR
NiNE9H6YNR3lqe7fikLV1o/ntVwnIzqHaG+N0SfRCblirXwdu21J9uc5MG3ptEeL
ZnQmWJRAy0JpUG4a0ikvjekC9vzBfWWxCR+21/ylxXGM3sj/U4zjZd/kSuOhaasM
AI0fWnRbteABeAWJxKWxkUlcgGbHqLu96Ziz3LizrQKBgQC9q6LCYQUrKHYYNku8
ioMw33/2UMEGZLEGNUd7DU01XzxIJ4ejflnX0/wYwyRmNNGCHCLUT5NKkBZJ47VY
piIdmzWu4l245vmesoYKlJFcjkg7d9bB9PXyHFmKRMo3BaPgNfYP6vzpMkzukbIs
1AXzFGTYa7xqJy/cQ2gne8YRfw==
-----END PRIVATE KEY-----`;

const cert = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUYC9hM8r4R0ifTIs/9H+Pq8qKlQUwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI1MDYyMDAwNDczNVoXDTI1MDYy
MTAwNDczNVowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAwT6cysOa9fk0XZeYH1zO6lNSXWMbTTlupjFTYBDROXbc
LXHlvuZtXtcDG1rpUd4eVq3becUyq82cPjHR6bLoAHU6sXvsTivO6oX6d/RE4gen
KkJyo5Lpr9CDfQIlpAfjYXIQ8g/StA5w9DRiHbrf9IiVpLgPd9DrT8GaFsrm+f/O
spq9Py6PRphEpMndiNOH+fkUDntFnXG2o8UM3UrYXbNzWVnR54XLD18X0fbuL7Fh
fMjF3q2oSsCyKywnNe8DUBVGx8WhUQJqsC/vpYAyKZpKojzJRSObZUVAamjNh1Ml
eLkNB18QP4ynPlvzut/injawgcvjfcqnc1dHRRYPVwIDAQABo1MwUTAdBgNVHQ4E
FgQUkjC43zCnZJYNjMOE4GjriMukVyMwHwYDVR0jBBgwFoAUkjC43zCnZJYNjMOE
4GjriMukVyMwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAVzK7
BGtLZ5MHSNSGGsttmPbHaDL/CP6xIJ9dm5R1PL+LQNSUu8cgc0He/2elu1RLJIj1
KknxLDX2qh7i/+MVm2GJlB2TOKsErdBMSmwhoQVWqwi5UL9nGNwwoqYXvnDTmc0R
g8xolngLkOdquY1GB8cYvC176zhMW0mMe35o2h4yYvM8W97zMVDtWcNJL4frH1T6
XKPLFdamYGOZzmzdzqk6+wFxbH9rV3w2W6pirdD6dd3wtSEPITENcxH8zDINruSz
WHYgV/G7/DiFWsCBRRSFUI5AdvV5/Iqp8ZO+flg1tY06C4aH2OlWY1/GAutbmChn
Piezcl4e+9llhWAPYQ==
-----END CERTIFICATE-----`;

const fileData = Buffer.from('HelloWorldHelloWorld');

function setupDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'offline-'));
}

function writeProgress(dir, downloaded, total) {
  const progressPath = path.join(dir, 'progress.json');
  fs.writeFileSync(progressPath, JSON.stringify({ 'test.bin': { downloaded, total } }, null, 2));
}

test('downloads resume and update progress file', async () => {
  const dir = setupDir();
  fs.writeFileSync(path.join(dir, 'test.bin'), fileData.slice(0, 10));
  writeProgress(dir, 10, 20);

  process.env.LIBS_DIR = dir;
  delete process.env.DRY_RUN;

  const server = https.createServer({ key, cert }, (req, res) => {
    const range = req.headers.range;
    const start = range ? parseInt(range.replace(/bytes=(\d+)-/, '$1'), 10) : 0;
    const chunk = fileData.slice(start);
    // Deliberately omit Content-Length to test fallback logic
    res.writeHead(range ? 206 : 200);
    res.end(chunk);
  });
  await new Promise(resolve => server.listen(0, resolve));
  const url = `https://localhost:${server.address().port}/test.bin`;
  process.env.FILES_OVERRIDE = JSON.stringify({ 'test.bin': url });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  https.globalAgent.options.rejectUnauthorized = false;
  await require('../scripts/prepareOffline.js')();
  server.close();

  const finalData = fs.readFileSync(path.join(dir, 'test.bin'));
  expect(finalData.equals(fileData)).toBe(true);
  const progress = JSON.parse(fs.readFileSync(path.join(dir, 'progress.json'), 'utf8'));
  expect(progress['test.bin'].downloaded).toBe(fileData.length);
  expect(progress['test.bin'].total).toBe(fileData.length);
});
