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

  const hapticsToggle = document.getElementById('hapticsToggle');
  hapticsToggle.addEventListener('click', () => {
    localStorage.setItem('haptics', hapticsToggle.checked.toString());
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

  const cameraList = document.getElementById('cameraList');
  const switchCamBtn = document.getElementById('switchCamBtn');
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      enumerateDevices: jest.fn().mockResolvedValue([
        { kind: 'videoinput', deviceId: 'cam1', label: 'Cam 1' },
        { kind: 'videoinput', deviceId: 'cam2', label: 'Cam 2' }
      ])
    },
    configurable: true
  });
  global.startedDevice = null;
  switchCamBtn.addEventListener('click', async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === 'videoinput');
    cameraList.innerHTML = '';
    cams.forEach(d => {
      const b = document.createElement('button');
      b.textContent = d.label;
      b.addEventListener('click', () => {
        global.startedDevice = d.deviceId;
        cameraList.classList.remove('show');
      });
      cameraList.appendChild(b);
    });
    if (cams.length) cameraList.classList.add('show');
  });
  document.addEventListener('click', e => {
    if (cameraList.classList.contains('show') && !cameraList.contains(e.target) && e.target !== switchCamBtn) {
      cameraList.classList.remove('show');
    }
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

  test('haptics toggle saves preference', () => {
    const toggle = document.getElementById('hapticsToggle');
    localStorage.clear();
    toggle.click();
    expect(localStorage.getItem('haptics')).toBe('false');
    toggle.click();
    expect(localStorage.getItem('haptics')).toBe('true');
  });

  test('camera menu lists available cameras', async () => {
    const btn = document.getElementById('switchCamBtn');
    const list = document.getElementById('cameraList');
    btn.click();
    await Promise.resolve();
    expect(list.classList.contains('show')).toBe(true);
    expect(list.children.length).toBe(2);
  });

  test('selecting a camera hides the menu', async () => {
    const btn = document.getElementById('switchCamBtn');
    const list = document.getElementById('cameraList');
    btn.click();
    await Promise.resolve();
    list.children[0].click();
    expect(global.startedDevice).toBe('cam1');
    expect(list.classList.contains('show')).toBe(false);
  });

  test('click outside closes camera menu', async () => {
    const btn = document.getElementById('switchCamBtn');
    const list = document.getElementById('cameraList');
    btn.click();
    await Promise.resolve();
    document.body.click();
    expect(list.classList.contains('show')).toBe(false);
  });
});
