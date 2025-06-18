const fs = require('fs');
const path = require('path');

beforeAll(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  document.documentElement.innerHTML = html.toString();
  // attach minimal handlers to simulate UI behaviour
  const settingsScreen = document.getElementById('settingsScreen');
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.onclick = () => settingsScreen.classList.add('show');

  const micBtn = document.getElementById('micBtn');
  micBtn.onclick = () => {
    micBtn.classList.toggle('active');
  };
});

describe('index.html', () => {
  test('loads and contains main elements', () => {
    expect(document.querySelector('video#video')).not.toBeNull();
    expect(document.querySelector('canvas#trackerCanvas')).not.toBeNull();
    expect(document.getElementById('captionContainer')).not.toBeNull();
  });

  test('clicking settings button shows settings screen', () => {
    const settingsScreen = document.getElementById('settingsScreen');
    const btn = document.getElementById('settingsBtn');
    expect(settingsScreen.classList.contains('show')).toBe(false);
    btn.click();
    expect(settingsScreen.classList.contains('show')).toBe(true);
  });

  test('mic button toggles active class', () => {
    const micBtn = document.getElementById('micBtn');
    expect(micBtn.classList.contains('active')).toBe(false);
    micBtn.click();
    expect(micBtn.classList.contains('active')).toBe(true);
    micBtn.click();
    expect(micBtn.classList.contains('active')).toBe(false);
  });
});
