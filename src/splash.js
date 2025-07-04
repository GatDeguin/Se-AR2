export let updateProgress = () => {};
import { ripple } from './app.js';
export function initSplash(canvas) {
  const wrapper = canvas.parentElement;
  if (wrapper) wrapper.classList.add('loading');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function onPointerDown(evt) {
    ripple(evt, canvas);
  }
  canvas.addEventListener('pointerdown', onPointerDown);

  const WIDTH = () => window.innerWidth;
  const HEIGHT = () => window.innerHeight;

  function resize() {
    const w = WIDTH();
    const h = HEIGHT();
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  const PRIMARY_COLOR = '#5B37B7';
  const BG_COLOR = '#F9F9FC';
  const TEXT_COLOR = '#FFFFFF';
  const LOGO_SIZE = 160;
  const LOADER_WIDTH = 240;
  const LOADER_HEIGHT = 6;
  const FADE_OUT_MS = 1000;

  let glowAlpha = 0, glowUp = true;
  let splashOpacity = 0, entrySoundPlayed = false;
  let fadeOutStart = null;
  let showError = false;
  let loaderProgress = 0;
  let statusText = '';
  const startTime = performance.now();

  const enterSound = document.getElementById('enter-sound');
  const doneSound = document.getElementById('done-sound');

  updateProgress = function(pct, text = '') {
    loaderProgress = Math.max(0, Math.min(1, pct));
    if (wrapper) {
      if (loaderProgress < 1) wrapper.classList.add('loading');
      else wrapper.classList.remove('loading');
    }
    if (text) statusText = text;
    if (loaderProgress >= 1 && !fadeOutStart) {
      fadeOutStart = performance.now();
      doneSound.play().catch(() => {});
    }
  };

  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawTextureNoise(alpha = 0.04) {
    const density = 0.6;
    const amount = 100;
    const w = WIDTH();
    const h = HEIGHT();
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    for (let i = 0; i < amount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLogo(
    x,
    y,
    size,
    glow,
    scale = 1,
    opacity = 1,
    rotation = 0,
    blur = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.translate(-x, -y);
    ctx.globalAlpha = opacity;
    if (blur > 0) ctx.filter = `blur(${blur}px)`;

    const radius = 36;
    drawRoundedRect(x - size/2, y - size/2, size, size, radius);
    const grad = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    grad.addColorStop(0, '#6B47D9');
    grad.addColorStop(1, '#5025AC');
    ctx.fillStyle = grad;
    ctx.shadowColor = `rgba(91,55,183,${glow})`;
    ctx.shadowBlur = 20 * glow;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `${Math.floor(size * 0.25)}px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SeñAR', x, y);
    ctx.filter = 'none';
    ctx.restore();
  }

  function drawLoader(x, y, w, h, progress, opacity = 1) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'rgba(91,55,183,0.15)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w, h, 4);
    ctx.fill();

    const grad = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
    grad.addColorStop(0, '#5B37B7');
    grad.addColorStop(1, '#7D5EF8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w * progress, h, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawStatusText(x, y, status, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(status, x, y);
    ctx.restore();
  }

  function animate(ts) {
    const elapsed = ts - startTime;
    const width = WIDTH();
    const height = HEIGHT();
    const centerX = width / 2;
    const centerY = height / 2 - 40;

    if (!entrySoundPlayed && elapsed > 200) {
      enterSound.play().catch(() => {});
      entrySoundPlayed = true;
    }



    if (glowUp) {
      glowAlpha += 0.01;
      if (glowAlpha >= 0.35) glowUp = false;
    } else {
      glowAlpha -= 0.01;
      if (glowAlpha <= 0.1) glowUp = true;
    }

    if (fadeOutStart) {
      const fadeElapsed = ts - fadeOutStart;
      splashOpacity = Math.max(0, 1 - (fadeElapsed / FADE_OUT_MS));
      if (splashOpacity <= 0) {
        canvas.style.display = 'none';
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.dispatchEvent(new Event('splashDone'));
        return;
      }
    } else {
      splashOpacity = Math.min(1, splashOpacity + 0.02);
    }

    ctx.save();
    ctx.globalAlpha = splashOpacity;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    drawTextureNoise(0.02);

    const entryProgress = Math.min(elapsed / 600, 1);
    const scale = 0.8 + 0.2 * easeOutBack(entryProgress);
    let rotation = 0, blur = 0;
    if (entryProgress < 1) {
      rotation = (1 - entryProgress) * (15 * Math.PI / 180);
      blur = 8 * (1 - entryProgress);
    }
    drawLogo(centerX, centerY, LOGO_SIZE, glowAlpha, scale, splashOpacity, rotation, blur);
    drawLoader(centerX, centerY + LOGO_SIZE / 2 + 32, LOADER_WIDTH, LOADER_HEIGHT, loaderProgress, splashOpacity);

    drawStatusText(centerX, centerY + LOGO_SIZE / 2 + 56, statusText, splashOpacity);

    ctx.restore();
    requestAnimationFrame(animate);
  }

  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
      if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
      else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (let side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
      }
      this.beginPath();
      this.moveTo(x + radius.tl, y);
      this.lineTo(x + width - radius.tr, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      this.lineTo(x + width, y + height - radius.br);
      this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      this.lineTo(x + radius.bl, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      this.lineTo(x, y + radius.tl);
      this.quadraticCurveTo(x, y, x + radius.tl, y);
      this.closePath();
      return this;
    };
  }


  requestAnimationFrame(animate);
}
