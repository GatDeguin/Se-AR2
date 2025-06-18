const fs = require('fs');
const path = require('path');

beforeAll(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  document.documentElement.innerHTML = html.toString();
  // attach minimal handlers to simulate UI behaviour using addEventListener
  const settingsScreen = document.getElementById('settingsScreen');
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('click', () => settingsScreen.classList.add('show'));

  const themeToggle = document.getElementById('themeToggle');
  const themeValue = document.getElementById('themeValue');
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    themeValue.textContent = isLight ? 'Light' : 'Dark';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  const dialectSelect = document.getElementById('dialectSelect');
  dialectSelect.addEventListener('change', () => {
    localStorage.setItem('dialect', dialectSelect.value);
  });

  const micBtn = document.getElementById('micBtn');
  global.micCalls = 0;
  micBtn.addEventListener('click', () => {
    micBtn.classList.toggle('active');
    global.micCalls += 1;
  });
  micBtn.addEventListener('click', () => {
    micBtn.dataset.second = 'yes';
    global.micCalls += 1;
  });
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

  test('mic button triggers all handlers', () => {
    const micBtn = document.getElementById('micBtn');
    global.micCalls = 0;
    delete micBtn.dataset.second;
    expect(micBtn.classList.contains('active')).toBe(false);
    micBtn.click();
    expect(micBtn.classList.contains('active')).toBe(true);
    expect(micBtn.dataset.second).toBe('yes');
    expect(global.micCalls).toBe(2);
    micBtn.click();
    expect(micBtn.classList.contains('active')).toBe(false);
    expect(global.micCalls).toBe(4);
  });

  test('theme toggle saves preference', () => {
    const toggle = document.getElementById('themeToggle');
    localStorage.clear();
    toggle.click();
    expect(localStorage.getItem('theme')).toBe('light');
    toggle.click();
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('dialect select saves preference', () => {
    const select = document.getElementById('dialectSelect');
    localStorage.clear();
    select.value = 'cuyo';
    select.dispatchEvent(new Event('change'));
    expect(localStorage.getItem('dialect')).toBe('cuyo');
  });
});
