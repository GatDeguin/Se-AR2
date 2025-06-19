import { detectStaticSign } from './staticSigns.js';

    // References
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
    const switchCamBtn = document.getElementById("switchCamBtn");
    const cameraList = document.getElementById('cameraList');
    const micBtn = document.getElementById('micBtn');
    const captionContainer = document.getElementById('captionContainer');
    const captionText = document.getElementById('captionText');
    const progress = document.getElementById('progress');
    const fpsBadge = document.getElementById('fpsBadge');
    const rootStyles = getComputedStyle(document.documentElement);
const accent = rootStyles.getPropertyValue('--accent').trim() || '#2EB8A3';
const accentRGB = rootStyles.getPropertyValue('--accent-rgb').trim() || '46,184,163';
let hapticsEnabled = true;

    // Load saved settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light');
      themeValue.textContent = 'Light';
    }

    const savedContrast = localStorage.getItem('contrast');
    if (savedContrast === 'true') {
      document.body.classList.add('high-contrast');
      if (contrastToggle) contrastToggle.checked = true;
    }

    const savedSize = localStorage.getItem('subtitleSize');
    if (savedSize) {
      subtitleSizeSlider.value = savedSize;
      subtitleSizeValue.textContent = savedSize + ' pt';
      captionContainer.style.fontSize = savedSize + 'px';
    }

    const savedFont = localStorage.getItem('subtitleFont');
    if (savedFont && subtitleFontSelect) {
      subtitleFontSelect.value = savedFont;
      captionContainer.style.fontFamily = savedFont;
    }

    const savedColor = localStorage.getItem('subtitleColor');
    if (savedColor && subtitleColorInput) {
      subtitleColorInput.value = savedColor;
      captionContainer.style.color = savedColor;
    }

      const savedDialect = localStorage.getItem('dialect');
      if (savedDialect && dialectSelect) {
        dialectSelect.value = savedDialect;
      }

      const savedCamera = localStorage.getItem('cameraId');
      const savedMic = localStorage.getItem('micId');

      const savedHaptics = localStorage.getItem('haptics');
      if (savedHaptics === 'false') {
        hapticsEnabled = false;
        if (hapticsToggle) hapticsToggle.checked = false;
      }

    function drawMarker(ctx,x,y,r){
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`rgba(${accentRGB},0.8)`);
      g.addColorStop(0.7,`rgba(${accentRGB},0.3)`);
      g.addColorStop(1,`rgba(${accentRGB},0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let camStream;
    let videoDevices=[];

    async function startStream(id){
      try{
        let c;
        if(typeof id==='string'){
          c={video:{deviceId:{exact:id}},audio:false};
        }else if(typeof id==='object'){
          c={video:id,audio:false};
        }else{
          c={video:true,audio:false};
        }
        const s=await navigator.mediaDevices.getUserMedia(c);
        if(camStream) camStream.getTracks().forEach(t=>t.stop());
        camStream=s;
        video.srcObject=s;
        fallbackCam.classList.remove("show");
      }catch(e){
        fallbackCam.textContent = `\ud83d\udcf7 ${e.message}. Permite el acceso a la cámara y recarga la página.`;
        fallbackCam.classList.add("show");
      }
    }
    /* ---------- Splash preload ---------- */
    const tasks=[];
    function upd(){}
    let tasksFinished = false;
    let splashFinished = false;
    function maybeStartTour(){
      if(tasksFinished && splashFinished && !localStorage.getItem("tourSeen")) startTour();
    }
    window.addEventListener("splashDone",()=>{ splashFinished = true; maybeStartTour(); });
    tasks.push(new Promise(r=>{ if(SR) new SR(); r(); }).then(upd));
tasks.push(
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      // Filtrar sólo inputs de vídeo
      videoDevices = devices.filter(d => d.kind === 'videoinput');
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
      // Intentar elegir cámara "back"/"environment"/"rear" o usar modo environment
      const camToUse = savedCamera ? videoDevices.find(d=>d.deviceId===savedCamera) : videoDevices.find(d => /back|environment|rear/i.test(d.label));
      if (camToUse) {
        return startStream(camToUse.deviceId);
      }
      return startStream({facingMode:{ideal:'environment'}});
    })
    .catch(() =>
      startStream({facingMode:{ideal:'environment'}})
        .catch(() => fallbackCam.classList.add('show'))
    )
    .finally(upd)
);

Promise.all(tasks).then(() => {
  tasksFinished = true;
  maybeStartTour();
});


    /* ---------- Guided tour ---------- */
    const steps=[{el:'#settingsBtn',text:'Accede a configuraciones.'},{el:'#themeToggle',text:'Cambia tema.'},{el:'#pauseBtn',text:'Pausa/reanuda.'},{el:'#snapshotBtn',text:'Captura pantalla.'},{el:'#restartBtn',text:'Reinicia.'},{el:'#micBtn',text:'Activa voz.'}];
    let idx=0;
    function startTour(){tourOverlay.classList.add('active');show(idx);}
    function show(i){const t=steps[i],e=document.querySelector(t.el),r=e.getBoundingClientRect();tourTooltip.textContent=t.text;tourTooltip.style.top=`${r.bottom+10}px`;tourTooltip.style.left=`${r.left}px`;}    
    tourNext.onclick=e=>{ripple(e,tourNext);idx++;idx<steps.length?show(idx):endTour();};
    tourClose.onclick=e=>{ripple(e,tourClose);endTour();};
    function endTour(){tourOverlay.classList.remove('active');localStorage.setItem('tourSeen','true');}

    /* ---------- Helper ripple ---------- */
    function ripple(e,el){const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height);let x=e&&e.clientX,y=e&&e.clientY;if(!x&&!y){x=r.left+r.width/2;y=r.top+r.height/2;}x-=r.left+s/2;y-=r.top+s/2;const sp=document.createElement('span');sp.className='ripple';sp.style.width=sp.style.height=s+'px';sp.style.left=x+'px';sp.style.top=y+'px';el.appendChild(sp);sp.onanimationend=()=>sp.remove();}

    function vibrate(pattern){
      if(hapticsEnabled) navigator.vibrate?.(pattern);
    }

    /* ---------- Settings nav ---------- */
    settingsBtn.onclick=e=>{ripple(e,settingsBtn);settingsScreen.classList.add('show');};
    settingsBack.onclick=e=>{ripple(e,settingsBack);settingsScreen.classList.remove('show');};

    /* ---------- Theme ---------- */
    themeToggle.onclick=e=>{
      ripple(e,themeToggle);
      const isLight = document.body.classList.toggle('light');
      themeValue.textContent = isLight ? 'Light' : 'Dark';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    if (contrastToggle) contrastToggle.onclick = e => {
      ripple(e, contrastToggle);
      const enabled = contrastToggle.checked;
      document.body.classList.toggle('high-contrast', enabled);
      localStorage.setItem('contrast', enabled);
    };

    if (hapticsToggle) hapticsToggle.onclick = e => {
      ripple(e, hapticsToggle);
      hapticsEnabled = hapticsToggle.checked;
      localStorage.setItem('haptics', hapticsEnabled);
    };

    /* ---------- Subtitle size ---------- */
    subtitleSizeSlider.oninput=()=>{
      subtitleSizeValue.textContent = subtitleSizeSlider.value + ' pt';
      captionContainer.style.fontSize = subtitleSizeSlider.value + 'px';
      localStorage.setItem('subtitleSize', subtitleSizeSlider.value);
    };

    if (dialectSelect) {
      dialectSelect.onchange = () => {
        localStorage.setItem('dialect', dialectSelect.value);
      };
    }

    if (subtitleFontSelect) subtitleFontSelect.onchange = () => {
      captionContainer.style.fontFamily = subtitleFontSelect.value;
      localStorage.setItem('subtitleFont', subtitleFontSelect.value);
    };

    if (subtitleColorInput) subtitleColorInput.oninput = () => {
      captionContainer.style.color = subtitleColorInput.value;
      localStorage.setItem('subtitleColor', subtitleColorInput.value);
    };

    if (cameraSelect) cameraSelect.onchange = () => {
      localStorage.setItem('cameraId', cameraSelect.value);
      startStream(cameraSelect.value);
    };

    if (micSelect) micSelect.onchange = () => {
      localStorage.setItem('micId', micSelect.value);
    };

    if (repeatTourBtn) repeatTourBtn.onclick = e => {
      ripple(e, repeatTourBtn);
      localStorage.removeItem('tourSeen');
      settingsScreen.classList.remove('show');
      startTour();
    };

    if (resetPrefsBtn) resetPrefsBtn.onclick = e => {
      ripple(e, resetPrefsBtn);
      if (confirm('Reset all preferences?')) {
        localStorage.clear();
        location.reload();
      }
    };

    if (downloadSttBtn) downloadSttBtn.onclick = async e => {
      ripple(e, downloadSttBtn);
      downloadSttBtn.textContent = '0%';
      downloadSttBtn.disabled = true;
      try {
        const url = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js';
        const res = await fetch(url);
        const reader = res.body.getReader();
        const length = +res.headers.get('content-length') || 0;
        let received = 0;
        const chunks = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (length) downloadSttBtn.textContent = Math.floor(received / length * 100) + '%';
        }
        const blob = new Blob(chunks, { type: res.headers.get('content-type') });
        const response = new Response(blob);
        const cache = await caches.open('offline-models');
        await cache.put(url, response);
        downloadSttBtn.textContent = 'Downloaded ✓';
      } catch (err) {
        downloadSttBtn.textContent = 'Failed';
      }
    };

    if (lsaSettingsBtn) lsaSettingsBtn.onclick = e => {
      ripple(e, lsaSettingsBtn);
      alert('Coming soon');
    };

    /* ---------- Mic ---------- */
    let recog;
    let recogActive = false;
    function speechHandler(e){
      ripple(e,micBtn);
      vibrate(50);
      if(!SR)return;
      micBtn.classList.add('starting');
      if(!recog){
        recog=new SR();
        recog.lang='es-ES';
        recog.interimResults=true;
        recog.continuous=true;
        recog.onstart=()=>{
          recogActive = true;
          micBtn.classList.add('active');
          captionContainer.classList.add('show');
          vibrate([100,50,100]);
        };
        recog.onend=()=>{
          recogActive = false;
          micBtn.classList.remove('active');
          captionContainer.classList.remove('show');
          progress.style.width='0%';
          vibrate(50);
        };
        recog.onresult=e=>{
          let fin='',int='';
          for(let i=e.resultIndex;i<e.results.length;i++){
            const t=e.results[i][0].transcript;
            e.results[i].isFinal?fin+=t+' ':int=t;
          }
          if(fin)animate(fin.trim());
          else captionText.textContent=int||captionText.textContent;
          progress.style.width=Math.min(100,captionText.textContent.length*1.2)+'%';
        };
      }
      micBtn.classList.remove('starting');
      const shouldStart = micBtn.classList.toggle('active');
      if(shouldStart){
        if(!recogActive) recog.start();
      }else{
        if(recogActive) recog.stop();
      }
    }
    function animate(txt){
      captionText.innerHTML='';
      const w=txt.split(' ');
      w.forEach(t=>{
        const s=document.createElement('span');
        s.textContent=t+' ';
        s.className='caption-text-word';
        captionText.appendChild(s);
      });
      let j=0;
      function hl(){
        j>0&&captionText.children[j-1].classList.remove('highlight');
        if(j<w.length){
          captionText.children[j].classList.add('highlight');
          j++; setTimeout(hl,400);
        }
      }
      hl();
    }

    /* ---------- Playback & snapshot ---------- */
    [pauseBtn,snapshotBtn,restartBtn].forEach(b=>b.addEventListener('click',e=>{
      ripple(e,b);
      vibrate(20);
    }));
    pauseBtn.addEventListener('click',()=>video.paused?video.play():video.pause());
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
    });
    restartBtn.addEventListener('click',()=>location.reload());
    switchCamBtn.addEventListener('click',async e=>{
      ripple(e,switchCamBtn);
      vibrate(20);
      if(cameraList.classList.contains('show')){
        cameraList.classList.remove('show');
        return;
      }
      try{
        const devices=await navigator.mediaDevices.enumerateDevices();
        videoDevices=devices.filter(d=>d.kind==='videoinput');
        cameraList.innerHTML='';
        videoDevices.forEach((d,i)=>{
          const btn=document.createElement('button');
          btn.textContent=d.label||`Camera ${i+1}`;
          btn.onclick=async()=>{
            try{
              await startStream(d.deviceId);
              localStorage.setItem('cameraId',d.deviceId);
            }catch(err){
              fallbackCam.textContent=`\ud83d\udcf7 ${err.message}`;
              fallbackCam.classList.add('show');
            }
            cameraList.classList.remove('show');
          };
          cameraList.appendChild(btn);
        });
        if(videoDevices.length>0) cameraList.classList.add('show');
      }catch(err){
        fallbackCam.textContent=`\ud83d\udcf7 ${err.message}`;
        fallbackCam.classList.add('show');
      }
    });

    document.addEventListener('click',e=>{
      if(cameraList.classList.contains('show')&& !cameraList.contains(e.target) && e.target!==switchCamBtn){
        cameraList.classList.remove('show');
      }
    });

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
    if(!SR){
      fallbackSpeech.textContent = '\ud83c\udf99\ufe0f Voz no soportada. Usa un navegador compatible.';
      fallbackSpeech.classList.add('show');
    }

    /* ========================================================================
       Drag & Drop subtítulos (+ microinteracciones) 
    ======================================================================== */
    captionContainer.dataset.centered='true';    // indicador de posición por defecto
    captionContainer.classList.add('draggable');

    (function(){
      let dragging=false, offsetX=0, offsetY=0;

      captionContainer.addEventListener('pointerdown', startDrag);
      captionContainer.addEventListener('pointermove', onDrag);
      captionContainer.addEventListener('pointerup', endDrag);
      captionContainer.addEventListener('pointercancel', endDrag);

      function startDrag(e){
        if(e.button!==0) return;           // solo botón principal
        dragging=true;
        captionContainer.setPointerCapture(e.pointerId);
        captionContainer.classList.add('dragging');

        const rect=captionContainer.getBoundingClientRect();
        offsetX=e.clientX-rect.left;
        offsetY=e.clientY-rect.top;

        /* Si está centrado por CSS, convertir a coordenadas absolutas */
        if(captionContainer.dataset.centered!=='false'){
          captionContainer.style.left=`${rect.left}px`;
          captionContainer.style.top=`${rect.top}px`;
          captionContainer.style.right='auto';
          captionContainer.style.bottom='auto';
          captionContainer.style.transform='translate(0,0)';
          captionContainer.dataset.centered='false';
        }
        e.preventDefault();
      }

      function onDrag(e){
        if(!dragging) return;
        let x=e.clientX-offsetX;
        let y=e.clientY-offsetY;

        /* Mantener dentro de la ventana */
        const maxX=window.innerWidth-captionContainer.offsetWidth-8;
        const maxY=window.innerHeight-captionContainer.offsetHeight-8;
        x=Math.max(8,Math.min(x,maxX));
        y=Math.max(8,Math.min(y,maxY));

        captionContainer.style.left=`${x}px`;
        captionContainer.style.top=`${y}px`;
      }

      function endDrag(e){
        if(!dragging) return;
        dragging=false;
        captionContainer.releasePointerCapture(e.pointerId);
        captionContainer.classList.remove('dragging');
        captionContainer.classList.add('drop');     // microanimación de “rebote”
      }

      /* Quitar clase drop cuando termine la animación */
      captionContainer.addEventListener('animationend',()=>{
        captionContainer.classList.remove('drop');
      });
    })();
async function ensureLibs() {
  const res = await fetch('libs/hands.js', { method: 'HEAD' }).catch(() => null);
  if (!res || !res.ok) {
    const msg = document.createElement('div');
    msg.id = 'fallbackLibs';
    msg.className = 'fallback show';
    msg.textContent = '⚠️ Falta libs. Ejecuta "npm run prepare-offline" o se usarán las URLs del CDN.';
    document.body.appendChild(msg);
    const cdn = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
    ];
    for (const src of cdn) {
      await new Promise(r => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = r;
        s.onerror = r;
        document.head.appendChild(s);
      });
    }
    return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js');
  }
  return import('../libs/transformers.min.js');
}

(async ()=>{
const { pipeline } = await ensureLibs();
const device = navigator.gpu ? 'webgpu' : 'wasm';
const transcriberP = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true, device });
// Reuse existing element references defined at the top of the file
    let recorder,chunks=[],blob;
    async function blobToPCM(b,r=16000){
      const buf=await b.arrayBuffer();
      const ac=new AudioContext();
      const dec=await ac.decodeAudioData(buf);
      if(dec.sampleRate===r)return dec.getChannelData(0);
      const frames=Math.ceil(dec.duration*r);
      const off=new OfflineAudioContext(1,frames,r);
      const src=off.createBufferSource();src.buffer=dec;
      src.connect(off.destination);src.start();
      const res=await off.startRendering();
      return res.getChannelData(0);
    }
    async function transcribe(){
      captionText.textContent='Transcribiendo…';progress.style.width='35%';
      const pcm=await blobToPCM(blob);
      const { text }=await (await transcriberP)(pcm,{chunk_length_s:30,language:'spanish'});
      captionText.textContent=text.trim();progress.style.width='100%';
      setTimeout(()=>progress.style.width='0%',1000);
    }
    function recordHandler(){
      (async()=>{
        try{
          vibrate(40);
          if(!recorder||recorder.state==='inactive'){
            const audioId = micSelect && micSelect.value ? micSelect.value : savedMic;
            const stream=await navigator.mediaDevices.getUserMedia({audio: audioId ? {deviceId:{exact:audioId}} : true});
            recorder=new MediaRecorder(stream,{mimeType:'audio/webm'});
            chunks=[];
            recorder.ondataavailable=ev=>chunks.push(ev.data);
            recorder.onstop=async()=>{blob=new Blob(chunks,{type:'audio/webm'});await transcribe();micBtn.classList.remove('active');};
            recorder.start();micBtn.classList.add('active');
            captionContainer.classList.add('show');
            captionText.textContent='Grabando…';progress.style.width='15%';
          }else{recorder.stop();}
        }catch(err){
          fallbackSpeech.textContent = `\ud83c\udf99\ufe0f ${err.message}. Verifique los permisos de micrófono.`;
          fallbackSpeech.classList.add('show');
        }
      })();
    }
    micBtn.addEventListener('click', speechHandler);
    micBtn.addEventListener('click', recordHandler);

    /* Tracker Combinado */
    const canvasTracker=document.getElementById('trackerCanvas')||(()=>{const c=document.createElement('canvas');c.id='trackerCanvas';video.parentNode.insertBefore(c,video.nextSibling);return c;})();
    const ctxTracker=canvasTracker.getContext('2d',{willReadFrequently:true});
    const hands=new Hands({locateFile:f=>`libs/${f}`});
    hands.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:0.7,minTrackingConfidence:0.7});
    const faceMesh=new FaceMesh({locateFile:f=>`libs/${f}`});
    faceMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.7,minTrackingConfidence:0.7});
    const pose=new Pose({locateFile:f=>`libs/${f}`});
    pose.setOptions({modelComplexity:1,enableSegmentation:false,minDetectionConfidence:0.7,minTrackingConfidence:0.7});
    let handLandmarks=[],faceLandmarks=null,poseLandmarks=null;
    hands.onResults(r=>handLandmarks=r.multiHandLandmarks||[]);
    faceMesh.onResults(r=>faceLandmarks=r.multiFaceLandmarks?.[0]||null);
    pose.onResults(r=>poseLandmarks=r.poseLandmarks||null);
    async function onFrame(){
      if(video.readyState>=2){
        await Promise.all([
          hands.send({image:video}),
          faceMesh.send({image:video}),
          pose.send({image:video})
        ]);
        const vw=video.videoWidth,vh=video.videoHeight;
        canvasTracker.width=vw;canvasTracker.height=vh;
        ctxTracker.clearRect(0,0,vw,vh);
        ctxTracker.lineWidth=2;
        handLandmarks.forEach(lm=>{
          let minX=1,minY=1,maxX=0,maxY=0;
          lm.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);});
          const pad=0.02;
          const x=Math.max(0,minX-pad),y=Math.max(0,minY-pad);
          const w=Math.min(1,maxX+pad)-x,h=Math.min(1,maxY+pad)-y;
          ctxTracker.fillStyle=`rgba(${accentRGB},0.15)`;
          ctxTracker.fillRect(x*vw,y*vh,w*vw,h*vh);

          ctxTracker.strokeStyle=accent;
          HAND_CONNECTIONS.forEach(([i,j])=>{
            const p1=lm[i],p2=lm[j];
            ctxTracker.beginPath();
            ctxTracker.moveTo(p1.x*vw,p1.y*vh);
            ctxTracker.lineTo(p2.x*vw,p2.y*vh);
            ctxTracker.stroke();
          });
          ctxTracker.fillStyle=accent;
          lm.forEach(p=>{ctxTracker.beginPath();ctxTracker.arc(p.x*vw,p.y*vh,3,0,Math.PI*2);ctxTracker.fill();});
          [0,4,8,12,16,20].forEach(i=>{const p=lm[i];if(p)drawMarker(ctxTracker,p.x*vw,p.y*vh,12);});
        });
        if (handLandmarks[0]) {
          const sign = detectStaticSign(handLandmarks[0]);
          if (sign) {
            captionContainer.classList.add('show');
            captionText.textContent = sign;
          }
        }
        if(faceLandmarks){
          ctxTracker.strokeStyle='#00FFFF';
          let minX=1,minY=1,maxX=0,maxY=0;
          faceLandmarks.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);});
          ctxTracker.strokeRect(minX*vw,minY*vh,(maxX-minX)*vw,(maxY-minY)*vh);
          drawConnectors(ctxTracker,faceLandmarks,FACEMESH_LEFT_EYE,{color:'#FFD700',lineWidth:2});
          drawConnectors(ctxTracker,faceLandmarks,FACEMESH_RIGHT_EYE,{color:'#FFD700',lineWidth:2});
          drawConnectors(ctxTracker,faceLandmarks,FACEMESH_LIPS,{color:'#FF69B4',lineWidth:2});
        }
        if(poseLandmarks){
          drawConnectors(ctxTracker, poseLandmarks, POSE_CONNECTIONS, {color:'#ADFF2F', lineWidth:2});
          poseLandmarks.forEach(p=>{ctxTracker.fillStyle='#0000FF';ctxTracker.beginPath();ctxTracker.arc(p.x*vw,p.y*vh,3,0,Math.PI*2);ctxTracker.fill();});
        }
      }
      requestAnimationFrame(onFrame);
    }
    video.addEventListener('playing',onFrame);
})();
