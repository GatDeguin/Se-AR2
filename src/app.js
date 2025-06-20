import { updateProgress } from './splash.js';
import { ripple } from './utils.js';
export { ripple } from './utils.js';

import { initSettings } from './settings.js';
import { initHelp } from './help.js';
import { initCamera, startStream } from './camera.js';
import { initCaptionDrag } from './drag.js';
import { initMic } from './mic.js';
import { initTour } from './tour.js';
import { detectStaticSign } from './staticSigns.js';
import { updateTrails, detectDynamicSigns } from './dynamicSigns.js';
import { trackerState } from './tracker.js';

if (!window.Module) window.Module = {};
if (!('arguments_' in window.Module)) window.Module.arguments_ = [];
if (!('arguments' in window.Module)) window.Module.arguments = window.Module.arguments_;

// DOM references
const tourOverlay = document.getElementById('tourOverlay');
const tourTooltip = document.getElementById('tourTooltip');
const tourNext = document.getElementById('tourNext');
const tourClose = document.getElementById('tourClose');
const settingsScreen = document.getElementById('settingsScreen');
const settingsBtn = document.getElementById('settingsBtn');
const settingsBack = document.getElementById('settingsBack');
const themeToggle = document.getElementById('themeToggle');
const themeValue = document.getElementById('themeValue');
const contrastToggle = document.getElementById('contrastToggle');
const subtitleSizeSlider = document.getElementById('subtitleSizeSlider');
const subtitleSizeValue = document.getElementById('subtitleSizeValue');
const subtitleFontSelect = document.getElementById('subtitleFontSelect');
const subtitleColorInput = document.getElementById('subtitleColorInput');
const dialectSelect = document.getElementById('dialectSelect');
const cameraSelect = document.getElementById('cameraSelect');
const micSelect = document.getElementById('micSelect');
const repeatTourBtn = document.getElementById('repeatTourBtn');
const resetPrefsBtn = document.getElementById('resetPrefsBtn');
const downloadSttBtn = document.getElementById('downloadSttBtn');
const lsaSettingsBtn = document.getElementById('lsaSettingsBtn');
const hapticsToggle = document.getElementById('hapticsToggle');
const video = document.getElementById('video');
const fallbackCam = document.getElementById('fallbackCam');
const fallbackSpeech = document.getElementById('fallbackSpeech');
const pauseBtn = document.getElementById('pauseBtn');
const snapshotBtn = document.getElementById('snapshotBtn');
const restartBtn = document.getElementById('restartBtn');
const switchCamBtn = document.getElementById('switchCamBtn');
const cameraList = document.getElementById('cameraList');
const micBtn = document.getElementById('micBtn');
const captionContainer = document.getElementById('captionContainer');
const captionText = document.getElementById('captionText');
const progress = document.getElementById('progress');
const fpsBadge = document.getElementById('fpsBadge');
const helpBtn = document.getElementById('helpBtn');
const helpPanel = document.getElementById('helpPanel');
const helpClose = document.getElementById('helpClose');

const startTour = initTour({ tourOverlay, tourTooltip, tourNext, tourClose });
const { savedCamera, savedMic } = initSettings({
  settingsScreen, settingsBtn, settingsBack,
  themeToggle, themeValue, contrastToggle,
  subtitleSizeSlider, subtitleSizeValue,
  subtitleFontSelect, subtitleColorInput,
  dialectSelect, cameraSelect, micSelect,
  repeatTourBtn, resetPrefsBtn, downloadSttBtn,
  lsaSettingsBtn, hapticsToggle, captionContainer,
  startTour, startStream
});

initHelp({ helpBtn, helpPanel, helpClose });
initCamera({ video, switchCamBtn, cameraList, fallbackCam });
initCaptionDrag(captionContainer);

/* ---------- Playback & snapshot ---------- */
[pauseBtn,snapshotBtn,restartBtn].forEach(b=>b.addEventListener('click',e=>{
  ripple(e,b);
}));

function updatePauseButton(){
  if(video.paused){
    pauseBtn.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6,4 19,12 6,20"/></svg>';
    pauseBtn.setAttribute('aria-label','Reanudar reproducción');
  }else{
    pauseBtn.innerHTML='<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    pauseBtn.setAttribute('aria-label','Pausar reproducción');
  }
}
pauseBtn.addEventListener('click',()=>video.paused?video.play():video.pause());
video.addEventListener('play',updatePauseButton);
video.addEventListener('pause',updatePauseButton);
updatePauseButton();
snapshotBtn.addEventListener('click',()=>{
  const w=video.videoWidth,h=video.videoHeight;
  if(!w)return;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  c.getContext('2d').drawImage(video,0,0);
  const l=document.createElement('a');
  l.href=c.toDataURL();
  l.download='snapshot.png';
  l.click();
  document.body.classList.add('snapshot-flash');
  document.body.addEventListener('animationend',()=>{
    document.body.classList.remove('snapshot-flash');
  },{once:true});
});
restartBtn.addEventListener('click',()=>location.reload());

/* ---------- FPS badge ---------- */
let lt=performance.now(),fr=0;
function fps(now){
  if(document.hidden){lt=now;fr=0;requestAnimationFrame(fps);return;}
  fr++;
  const d=now-lt;
  if(d>=1000){fpsBadge.textContent=Math.round(fr*1000/d)+' fps';fr=0;lt=now;}
  requestAnimationFrame(fps);
}
requestAnimationFrame(fps);

/* ---------- Fallback speech ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if(!SR){
  fallbackSpeech.textContent = '\ud83c\udf99\ufe0f Voz no soportada. Usa un navegador compatible.';
  fallbackSpeech.classList.add('show');
}

initMic({ SR, micBtn, captionContainer, captionText, micSelect, fallbackSpeech, savedMic });

async function ensureLibs() {
  try {
    return await import(new URL('../libs/transformers.min.js', import.meta.url));
  } catch {
    return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js');
  }
}

const tasks=[];
const totalTasks = 3;
let completedTasks = 0;
function upd(text){
  completedTasks++;
  updateProgress(completedTasks/totalTasks, text);
}
let tasksFinished = false;
let splashFinished = false;
function maybeStartTour(){
  if(tasksFinished && splashFinished && !localStorage.getItem('tourSeen')) startTour();
}
window.addEventListener('splashDone',()=>{ splashFinished = true; maybeStartTour(); });
tasks.push(new Promise(r=>{ if(SR) new SR(); r(); }).then(() => upd('Reconocimiento')));
tasks.push(
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      if (cameraSelect) {
        cameraSelect.innerHTML = '';
        videoDevices.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.deviceId;
          opt.textContent = d.label || d.deviceId;
          cameraSelect.appendChild(opt);
        });
        if (savedCamera) cameraSelect.value = savedCamera;
      }
      if (micSelect) {
        micSelect.innerHTML = '';
        audioInputs.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.deviceId;
          opt.textContent = d.label || d.deviceId;
          micSelect.appendChild(opt);
        });
        if (savedMic) micSelect.value = savedMic;
      }
      const camToUse = savedCamera ? videoDevices.find(d=>d.deviceId===savedCamera) : videoDevices.find(d => /back|environment|rear/i.test(d.label));
      if (camToUse) {
        return startStream(video, fallbackCam, camToUse.deviceId);
      }
      return startStream(video, fallbackCam, {facingMode:{ideal:'environment'}});
    })
    .catch(() =>
      startStream(video, fallbackCam, {facingMode:{ideal:'environment'}})
        .catch(() => fallbackCam.classList.add('show'))
    )
    .finally(() => upd('Dispositivos'))
);

const libsPromise = ensureLibs();
tasks.push(libsPromise.then(() => upd('Librerías')));

Promise.all(tasks).then(() => {
  tasksFinished = true;
  updateProgress(1, 'Listo');
  maybeStartTour();
});

(async ()=>{
  const { initTracker } = await import('./tracker.js');
  await initTracker({
    video,
    canvas: document.getElementById('trackerCanvas')
  });
  function detectLoop(){
    const hands = trackerState.handLandmarks || [];
    updateTrails(hands);
    const dyn = detectDynamicSigns();
    const out = hands.map((lm, i) => dyn[i] || detectStaticSign(lm));
    if (out.some(Boolean)) console.log('Signs:', out.filter(Boolean).join(' '));
    requestAnimationFrame(detectLoop);
  }
  requestAnimationFrame(detectLoop);
})();
