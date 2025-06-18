const fs = require('fs');
const path = require('path');

beforeAll(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  document.documentElement.innerHTML = html.toString();
});

describe('index.html', () => {
  test('loads and contains main elements', () => {
    expect(document.querySelector('video#video')).not.toBeNull();
    expect(document.querySelector('canvas#trackerCanvas')).not.toBeNull();
    expect(document.getElementById('captionContainer')).not.toBeNull();
  });
});
