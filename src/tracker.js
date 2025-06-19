import { formatSigns } from './handUtils.js';

export function initTracker({
  video,
  canvas,
  captionContainer,
  captionText,
  accent = '#2EB8A3',
  accentRGB = '46,184,163',
  drawMarker
}) {
  if (!video) return;
  const canvasEl = canvas || (() => {
    const c = document.createElement('canvas');
    c.id = 'trackerCanvas';
    video.parentNode.insertBefore(c, video.nextSibling);
    return c;
  })();
  const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
  ctx.lineWidth = 2;
  let lastW = 0, lastH = 0;

  const mpCache = window._mpSolutions || (window._mpSolutions = {});
  const hands = mpCache.hands || (mpCache.hands = new Hands({
    locateFile: f => new URL(`../libs/${f}`, import.meta.url).href
  }));
  if (!mpCache.handsInitialized) {
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1,
      minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    mpCache.handsInitialized = true;
  }
  const faceMesh = mpCache.faceMesh || (mpCache.faceMesh = new FaceMesh({
    locateFile: f => new URL(`../libs/${f}`, import.meta.url).href
  }));
  if (!mpCache.faceMeshInitialized) {
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true,
      minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    mpCache.faceMeshInitialized = true;
  }
  const pose = mpCache.pose || (mpCache.pose = new Pose({
    locateFile: f => new URL(`../libs/${f}`, import.meta.url).href
  }));
  if (!mpCache.poseInitialized) {
    pose.setOptions({ modelComplexity: 1, enableSegmentation: false,
      minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    mpCache.poseInitialized = true;
  }

  let handLandmarks = [], handedness = [], faceLandmarks = null, poseLandmarks = null;
  hands.onResults(r => { handLandmarks = r.multiHandLandmarks || []; handedness = r.multiHandedness || []; });
  faceMesh.onResults(r => { faceLandmarks = r.multiFaceLandmarks && r.multiFaceLandmarks[0] || null; });
  pose.onResults(r => { poseLandmarks = r.poseLandmarks || null; });

  async function onFrame() {
    if (video.readyState >= 2) {
      await Promise.all([
        hands.send({ image: video }),
        faceMesh.send({ image: video }),
        pose.send({ image: video })
      ]);
      const vw = video.videoWidth, vh = video.videoHeight;
      if (vw !== lastW || vh !== lastH) {
        lastW = vw; lastH = vh;
        canvasEl.width = vw; canvasEl.height = vh;
      }
      ctx.clearRect(0, 0, vw, vh);
      handLandmarks.forEach(lm => {
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        lm.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
        const pad = 0.02;
        const x = Math.max(0, minX - pad), y = Math.max(0, minY - pad);
        const w = Math.min(1, maxX + pad) - x, h = Math.min(1, maxY + pad) - y;
        ctx.fillStyle = `rgba(${accentRGB},0.15)`;
        ctx.fillRect(x * vw, y * vh, w * vw, h * vh);

        ctx.strokeStyle = accent;
        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = lm[i], p2 = lm[j];
          ctx.beginPath();
          ctx.moveTo(p1.x * vw, p1.y * vh);
          ctx.lineTo(p2.x * vw, p2.y * vh);
          ctx.stroke();
        });
        ctx.fillStyle = accent;
        lm.forEach(p => { ctx.beginPath(); ctx.arc(p.x * vw, p.y * vh, 3, 0, Math.PI * 2); ctx.fill(); });
        if (drawMarker) [0,4,8,12,16,20].forEach(i => { const p = lm[i]; if (p) drawMarker(ctx, p.x * vw, p.y * vh, 12); });
      });
      const signText = formatSigns(handLandmarks, handedness);
      if (signText) {
        captionContainer.classList.add('show');
        captionText.textContent = signText;
      }
      if (faceLandmarks) {
        ctx.strokeStyle = '#00FFFF';
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        faceLandmarks.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
        ctx.strokeRect(minX * vw, minY * vh, (maxX - minX) * vw, (maxY - minY) * vh);

        const leftEyeIdx = [33,133,159,145];
        const rightEyeIdx = [362,263,386,374];
        [leftEyeIdx, rightEyeIdx].forEach(arr => {
          let exMin = 1, eyMin = 1, exMax = 0, eyMax = 0;
          arr.forEach(i => { const p = faceLandmarks[i]; exMin = Math.min(exMin, p.x); eyMin = Math.min(eyMin, p.y); exMax = Math.max(exMax, p.x); eyMax = Math.max(eyMax, p.y); });
          ctx.strokeStyle = '#FF0000';
          ctx.strokeRect(exMin * vw, eyMin * vh, (exMax - exMin) * vw, (eyMax - eyMin) * vh);
        });
        drawConnectors(ctx, faceLandmarks, FACEMESH_LEFT_EYE, { color: '#FFD700', lineWidth: 2 });
        drawConnectors(ctx, faceLandmarks, FACEMESH_RIGHT_EYE, { color: '#FFD700', lineWidth: 2 });
        drawConnectors(ctx, faceLandmarks, FACEMESH_LIPS, { color: '#FF69B4', lineWidth: 2 });
      }
      if (poseLandmarks) {
        drawConnectors(ctx, poseLandmarks, POSE_CONNECTIONS, { color: '#ADFF2F', lineWidth: 2 });
        poseLandmarks.forEach(p => { ctx.fillStyle = '#0000FF'; ctx.beginPath(); ctx.arc(p.x * vw, p.y * vh, 3, 0, Math.PI * 2); ctx.fill(); });
      }
    }
    requestAnimationFrame(onFrame);
  }
  video.addEventListener('playing', onFrame);
  if (!video.paused && video.readyState >= 2) requestAnimationFrame(onFrame);
}
