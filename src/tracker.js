// Simplified tracker based on the "Tracker Combinado" demo. It draws hand
// landmarks and basic face bounding boxes on a full screen canvas. Pose and
// static sign detection from the previous implementation were removed.

export const trackerState = {
  handLandmarks: [],
  faceLandmarks: null,
  faceBox: null,
  eyeBoxes: []
};

// Indices for eye landmarks used when computing the eye bounding boxes
export const LEFT_EYE_IDX = [33, 133, 159, 145];
export const RIGHT_EYE_IDX = [362, 263, 386, 374];

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

  function getAppColors() {
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent').trim() || '#2EB8A3';
    const icon = styles.getPropertyValue('--icon-color').trim() || '#FFFFFF';
    return { accent, icon };
  }

    async function onFrame() {
      if (video.readyState >= 2) {
        const { accent, icon } = getAppColors();
        await Promise.all([
          hands.send({ image: video }),
          faceMesh.send({ image: video })
        ]);

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
        ctx.strokeStyle = accent;
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
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = icon;
          ctx.fill();
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.5;
          ctx.stroke();
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

        eyeBoxes = [LEFT_EYE_IDX, RIGHT_EYE_IDX].map(indices => {
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
