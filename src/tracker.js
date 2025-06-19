// Simplified tracker based on the "Tracker Combinado" demo. It draws hand
// landmarks and basic face bounding boxes on a full screen canvas. Pose and
// static sign detection from the previous implementation were removed.

export const trackerState = {
  handLandmarks: [],
  faceLandmarks: null,
  faceBox: null,
  eyeBoxes: []
};

export function initTracker({
  video,
  canvas
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

  const mpCache = window._mpSolutions || (window._mpSolutions = {});
  const useCDN = window.USE_CDN;
  const hands = mpCache.hands || (mpCache.hands = new Hands(
    useCDN ? {} : { locateFile: f => new URL(`../libs/${f}`, import.meta.url).href }
  ));
  if (!mpCache.handsInitialized) {
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1,
      minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    mpCache.handsInitialized = true;
  }
  const faceMesh = mpCache.faceMesh || (mpCache.faceMesh = new FaceMesh(
    useCDN ? {} : { locateFile: f => new URL(`../libs/${f}`, import.meta.url).href }
  ));
  if (!mpCache.faceMeshInitialized) {
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true,
      minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    mpCache.faceMeshInitialized = true;
  }
  let handLandmarks = [], faceResults = null;
  let faceBox = null, eyeBoxes = [];
  hands.onResults(r => {
    handLandmarks = r.multiHandLandmarks || [];
    trackerState.handLandmarks = handLandmarks;
  });
  faceMesh.onResults(r => { faceResults = r; });

  const fingerColors = {
    thumb: '#FF0000',
    index: '#00FF00',
    middle: '#0000FF',
    ring: '#FFFF00',
    pinky: '#FF00FF'
  };

  async function onFrame() {
    if (video.readyState >= 2) {
      await hands.send({ image: video });
      await faceMesh.send({ image: video });

      const vw = video.videoWidth, vh = video.videoHeight;
      const cw = canvasEl.width = video.clientWidth || window.innerWidth;
      const ch = canvasEl.height = video.clientHeight || window.innerHeight;
      const scale = Math.max(cw / vw, ch / vh);
      const dw = vw * scale, dh = vh * scale;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

      ctx.save();
      ctx.clearRect(0, 0, cw, ch);
      // Overlay only, video element remains visible underneath

      handLandmarks.forEach(landmarks => {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = landmarks[i], p2 = landmarks[j];
          ctx.beginPath();
          ctx.moveTo(dx + p1.x * dw, dy + p1.y * dh);
          ctx.lineTo(dx + p2.x * dw, dy + p2.y * dh);
          ctx.stroke();
        });
        landmarks.forEach((lm, i) => {
          const x = dx + lm.x * dw, y = dy + lm.y * dh;
          let color = '#FFFFFF';
          if (i >= 1 && i <= 4) color = fingerColors.thumb;
          if (i >= 5 && i <= 8) color = fingerColors.index;
          if (i >= 9 && i <= 12) color = fingerColors.middle;
          if (i >= 13 && i <= 16) color = fingerColors.ring;
          if (i >= 17 && i <= 20) color = fingerColors.pinky;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      });

      if (faceResults && faceResults.multiFaceLandmarks.length) {
        const lm = faceResults.multiFaceLandmarks[0];
        trackerState.faceLandmarks = lm;
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        lm.forEach(p => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
        faceBox = {
          x: dx + minX * dw,
          y: dy + minY * dh,
          width: (maxX - minX) * dw,
          height: (maxY - minY) * dh
        };
        trackerState.faceBox = faceBox;

        const leftEyeIdx = [33, 133, 159, 145];
        const rightEyeIdx = [362, 263, 386, 374];
        eyeBoxes = [leftEyeIdx, rightEyeIdx].map(indices => {
          let exMin = 1, eyMin = 1, exMax = 0, eyMax = 0;
          indices.forEach(i => {
            const p = lm[i];
            exMin = Math.min(exMin, p.x);
            eyMin = Math.min(eyMin, p.y);
            exMax = Math.max(exMax, p.x);
            eyMax = Math.max(eyMax, p.y);
          });
          return {
            x: dx + exMin * dw,
            y: dy + eyMin * dh,
            width: (exMax - exMin) * dw,
            height: (eyMax - eyMin) * dh
          };
        });
        trackerState.eyeBoxes = eyeBoxes;
      }

      ctx.restore();
    }
    requestAnimationFrame(onFrame);
  }
  video.addEventListener('playing', onFrame);
  if (!video.paused && video.readyState >= 2) requestAnimationFrame(onFrame);
  return trackerState;
}
