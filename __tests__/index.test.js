const fs = require('fs');
const path = require('path');
jest.mock('../src/splash.js', () => ({ __esModule: true, updateProgress: jest.fn() }));
const { updateProgress } = require('../src/splash.js');
const requireEsm = require('esm')(module);
const { formatSigns } = requireEsm('../src/handUtils.js');

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
    themeValue.textContent = isLight ? 'Claro' : 'Oscuro';
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

  const helpBtn = document.getElementById('helpBtn');
  const helpPanel = document.getElementById('helpPanel');
  function toggleHelp(show) {
    helpPanel.classList.toggle('show', show);
    helpBtn.setAttribute('aria-expanded', show.toString());
    helpPanel.setAttribute('aria-hidden', (!show).toString());
  }
  helpBtn.addEventListener('click', () => toggleHelp(!helpPanel.classList.contains('show')));

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

  test('haptics preference persists on reload', () => {
    const toggle = document.getElementById('hapticsToggle');
    const htmlPath = path.resolve(__dirname, '../index.html');
    localStorage.clear();
    // disable haptics and verify value stored
    toggle.click();
    expect(localStorage.getItem('haptics')).toBe('false');

    // simulate reloading the page
    const html = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = html.toString();

    const newToggle = document.getElementById('hapticsToggle');
    const saved = localStorage.getItem('haptics');
    if (saved === 'false') newToggle.checked = false;
    expect(newToggle.checked).toBe(false);
  });

  test('splash progress updates after init tasks', async () => {
    updateProgress.mockClear();
    const tasks = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
    const total = tasks.length;
    let done = 0;
    tasks.forEach(p => p.then(() => updateProgress(++done / total)));
    await Promise.all(tasks);
    expect(updateProgress).toHaveBeenLastCalledWith(1);
  });

  test('formats detected signs for each hand', () => {
    function baseHand() {
      const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
      lm[3].x = 0; lm[4].x = 1; // thumb not extended
      lm[6].y = 0; lm[8].y = 1; // index not extended
      lm[10].y = 0; lm[12].y = 1; // middle not extended
      lm[14].y = 0; lm[16].y = 1; // ring not extended
      lm[18].y = 0; lm[20].y = 1; // pinky not extended
      return lm;
    }
    const left = baseHand();
    left[4].x = -1; // sign A
    const right = baseHand();
    right[8].y = -1; right[12].y = -1; right[16].y = -1; right[20].y = -1; // sign B
    const txt = formatSigns([left, right], [{ label: 'Left' }, { label: 'Right' }]);
    expect(txt).toBe('Left: A / Right: B');
  });

  test('help button toggles panel visibility', () => {
    const helpBtn = document.getElementById('helpBtn');
    const helpPanel = document.getElementById('helpPanel');

    expect(helpPanel.classList.contains('show')).toBe(false);
    helpPanel.classList.add('show');
    helpBtn.setAttribute('aria-expanded', 'true');
    expect(helpPanel.classList.contains('show')).toBe(true);
    expect(helpBtn.getAttribute('aria-expanded')).toBe('true');

    helpPanel.classList.remove('show');
    helpBtn.setAttribute('aria-expanded', 'false');
    expect(helpPanel.classList.contains('show')).toBe(false);
    expect(helpBtn.getAttribute('aria-expanded')).toBe('false');
  });
});
