import { ripple, vibrate } from './utils.js';
import { getHapticsEnabled } from './settings.js';

export async function startStream(video, fallbackCam, id){
  try{
    const baseVid = { width: { ideal: 640 }, height: { ideal: 480 } };
    let c;
    if(typeof id === 'string'){
      c = { video: { ...baseVid, deviceId: { exact: id } }, audio: false };
    }else if(typeof id === 'object'){
      c = { video: { ...baseVid, ...id }, audio: false };
    }else{
      c = { video: { ...baseVid, facingMode: { ideal: 'environment' } }, audio: false };
    }
    const s = await navigator.mediaDevices.getUserMedia(c);
    if(video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = s;
    await video.play().catch(()=>{});
    fallbackCam.classList.remove('show');
  }catch(e){
    fallbackCam.textContent = `\ud83d\udcf7 ${e.message}. Permite el acceso a la cámara y recarga la página.`;
    fallbackCam.classList.add('show');
  }
}

export function initCamera({ video, switchCamBtn, cameraList, fallbackCam }){
  let videoDevices = [];
  switchCamBtn.addEventListener('click', async e => {
    ripple(e, switchCamBtn);
    vibrate(20, getHapticsEnabled());
    if(cameraList.classList.contains('show')){
      cameraList.classList.remove('show');
      return;
    }
    try{
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter(d => d.kind === 'videoinput');
      cameraList.innerHTML = '';
      videoDevices.forEach((d,i) => {
        const btn = document.createElement('button');
        btn.textContent = d.label || `Camera ${i+1}`;
        btn.onclick = async () => {
          try{
            await startStream(video, fallbackCam, d.deviceId);
            localStorage.setItem('cameraId', d.deviceId);
          }catch(err){
            fallbackCam.textContent = `\ud83d\udcf7 ${err.message}`;
            fallbackCam.classList.add('show');
          }
          cameraList.classList.remove('show');
        };
        cameraList.appendChild(btn);
      });
      if(videoDevices.length > 0) cameraList.classList.add('show');
    }catch(err){
      fallbackCam.textContent = `\ud83d\udcf7 ${err.message}`;
      fallbackCam.classList.add('show');
    }
  });

  document.addEventListener('click', e => {
    if(cameraList.classList.contains('show') && !cameraList.contains(e.target) && e.target !== switchCamBtn){
      cameraList.classList.remove('show');
    }
  });
}
