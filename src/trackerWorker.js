importScripts(new URL('../libs/hands.js', import.meta.url).href);
importScripts(new URL('../libs/face_mesh.js', import.meta.url).href);
importScripts(new URL('../libs/drawing_utils.js', import.meta.url).href);

let hands, faceMesh, processCanvas, processCtx, drawCanvas, drawCtx;

async function ensureModels(width, height) {
  if (!hands) {
    const useCDN = self.USE_CDN;
    hands = new self.Hands(useCDN ? {} : { locateFile: f => new URL('../libs/' + f, import.meta.url).href });
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    await hands.initialize();
  }
  if (!faceMesh) {
    const useCDN = self.USE_CDN;
    faceMesh = new self.FaceMesh(useCDN ? {} : { locateFile: f => new URL('../libs/' + f, import.meta.url).href });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    await faceMesh.initialize();
  }
  if (!processCanvas || processCanvas.width !== width || processCanvas.height !== height) {
    processCanvas = new OffscreenCanvas(width, height);
    processCtx = processCanvas.getContext('2d');
  }
}

self.onmessage = async e => {
  if (e.data.canvas) {
    drawCanvas = e.data.canvas;
    drawCtx = drawCanvas.getContext('2d');
    return;
  }
  const { frame, width, height, accent = '#2EB8A3', icon = '#FFFFFF' } = e.data;
  await ensureModels(width, height);
  processCtx.drawImage(frame, 0, 0, width, height);
  frame.close && frame.close();
  const [handRes, faceRes] = await Promise.all([
    hands.send({ image: processCanvas }),
    faceMesh.send({ image: processCanvas })
  ]);
  const handLandmarks = handRes.multiHandLandmarks || [];
  const faceLandmarks = faceRes.multiFaceLandmarks ? faceRes.multiFaceLandmarks[0] : null;

  if (drawCtx) {
    const vw = width, vh = height;
    const cw = drawCanvas.width, ch = drawCanvas.height;
    const scale = Math.max(cw / vw, ch / vh);
    const dw = vw * scale, dh = vh * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    drawCtx.clearRect(0, 0, cw, ch);
    handLandmarks.forEach(lm => {
      drawCtx.strokeStyle = accent;
      drawCtx.lineWidth = 2;
      HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = lm[i], p2 = lm[j];
        drawCtx.beginPath();
        drawCtx.moveTo(dx + p1.x * dw, dy + p1.y * dh);
        drawCtx.lineTo(dx + p2.x * dw, dy + p2.y * dh);
        drawCtx.stroke();
      });
      lm.forEach(p => {
        const x = dx + p.x * dw, y = dy + p.y * dh;
        drawCtx.beginPath();
        drawCtx.arc(x, y, 4, 0, Math.PI * 2);
        drawCtx.fillStyle = icon;
        drawCtx.fill();
        drawCtx.strokeStyle = accent;
        drawCtx.lineWidth = 1.5;
        drawCtx.stroke();
      });
    });
    if (faceLandmarks) {
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      faceLandmarks.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      // Optionally draw bounding box or landmarks (not implemented)
    }
  }

  self.postMessage({ handLandmarks, faceLandmarks });
};
