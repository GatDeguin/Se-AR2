import { updateProgress } from './splash.js';

// Prepare global Module for MediaPipe WASM loaders
if (!window.Module) {
  window.Module = {};
}
if (!('arguments_' in window.Module)) {
  window.Module.arguments_ = [];
}
if (!('arguments' in window.Module)) {
  window.Module.arguments = window.Module.arguments_;
}

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
    let hapticsEnabled = true;

    // Load saved settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light');
      themeValue.textContent = 'Claro';
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
        await video.play().catch(()=>{});
        fallbackCam.classList.remove("show");
      }catch(e){
        fallbackCam.textContent = `\ud83d\udcf7 ${e.message}. Permite el acceso a la cámara y recarga la página.`;
        fallbackCam.classList.add("show");
      }
    }
    /* ---------- Splash preload ---------- */
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
      if(tasksFinished && splashFinished && !localStorage.getItem("tourSeen")) startTour();
    }
    window.addEventListener("splashDone",()=>{ splashFinished = true; maybeStartTour(); });
    tasks.push(new Promise(r=>{ if(SR) new SR(); r(); }).then(() => upd('Reconocimiento')));
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
    .finally(() => upd('Dispositivos'))
);

Promise.all(tasks).then(() => {
  tasksFinished = true;
  updateProgress(1, 'Listo');
  maybeStartTour();
});


    /* ---------- Guided tour ---------- */
    const steps=[
      {el:'#settingsBtn',text:'Accede a configuraciones.'},
      {el:'#themeToggle',text:'Cambia tema.'},
      {el:'#pauseBtn',text:'Pausa/reanuda.'},
      {el:'#snapshotBtn',text:'Captura pantalla.'},
      {el:'#switchCamBtn',text:'Cambia cámara.'},
      {el:'#restartBtn',text:'Reinicia.'},
      {el:'#micBtn',text:'Activa voz.'}
    ];
    let idx=0;
    let highlightEl=null;
    function startTour(){tourOverlay.classList.add('active');show(idx);}
    function show(i){const t=steps[i],e=document.querySelector(t.el);if(highlightEl)highlightEl.classList.remove('tour-highlight');highlightEl=e;e.classList.add('tour-highlight');const r=e.getBoundingClientRect();tourTooltip.textContent=t.text;tourTooltip.style.top=`${r.bottom+10}px`;tourTooltip.style.left=`${r.left}px`;}
    tourNext.onclick=e=>{ripple(e,tourNext);idx++;idx<steps.length?show(idx):endTour();};
    tourClose.onclick=e=>{ripple(e,tourClose);endTour();};
    function endTour(){if(highlightEl)highlightEl.classList.remove('tour-highlight');tourOverlay.classList.remove('active');localStorage.setItem('tourSeen','true');}

    /* ---------- Helper ripple ---------- */
    export function ripple(e,el){const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height);let x=e&&e.clientX,y=e&&e.clientY;if(!x&&!y){x=r.left+r.width/2;y=r.top+r.height/2;}x-=r.left+s/2;y-=r.top+s/2;const sp=document.createElement('span');sp.className='ripple';sp.style.width=sp.style.height=s+'px';sp.style.left=x+'px';sp.style.top=y+'px';el.appendChild(sp);sp.onanimationend=()=>sp.remove();}

    function vibrate(pattern){
      if(hapticsEnabled && navigator.vibrate) navigator.vibrate(pattern);
    }

    /* ---------- Settings nav ---------- */
    settingsBtn.onclick=e=>{ripple(e,settingsBtn);settingsScreen.classList.add('show');};
    settingsBack.onclick=e=>{ripple(e,settingsBack);settingsScreen.classList.remove('show');};

    /* ---------- Theme ---------- */
    themeToggle.onclick=e=>{
      ripple(e,themeToggle);
      const isLight = document.body.classList.toggle('light');
      themeValue.textContent = isLight ? 'Claro' : 'Oscuro';
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
      if (confirm('¿Restablecer todas las preferencias?')) {
        localStorage.clear();
        location.reload();
      }
    };

    if (downloadSttBtn) downloadSttBtn.onclick = async e => {
      ripple(e, downloadSttBtn);
      downloadSttBtn.textContent = '0%';
      downloadSttBtn.disabled = true;
      try {
        const url = new URL('../libs/transformers.min.js', import.meta.url);
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
        downloadSttBtn.textContent = 'Descargado ✓';
      } catch (err) {
        downloadSttBtn.textContent = 'Error';
      }
    };

    if (lsaSettingsBtn) lsaSettingsBtn.onclick = e => {
      ripple(e, lsaSettingsBtn);
      alert('Próximamente');
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
      let j=0,last=performance.now();
      function hl(now){
        if(now-last>=400){
          if(j>0) captionText.children[j-1].classList.remove('highlight');
          if(j<w.length){
            captionText.children[j].classList.add('highlight');
            j++; last=now;
          }
        }
        if(j<w.length) requestAnimationFrame(hl);
      }
      requestAnimationFrame(hl);
    }

    /* ---------- Playback & snapshot ---------- */
    [pauseBtn,snapshotBtn,restartBtn].forEach(b=>b.addEventListener('click',e=>{
      ripple(e,b);
      vibrate(20);
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
      let pending=false, dragX=0, dragY=0;

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
        dragX=e.clientX-offsetX;
        dragY=e.clientY-offsetY;
        if(!pending){
          pending=true;
          requestAnimationFrame(applyDrag);
        }
      }

      function applyDrag(){
        pending=false;
        let x=dragX,y=dragY;

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
  try {
    return await import(new URL('../libs/transformers.min.js', import.meta.url));
  } catch {
    return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js');
  }
}

const libsPromise = ensureLibs();
tasks.push(libsPromise.then(() => upd('Librer\xEDas')));

(async ()=>{
const { pipeline } = await libsPromise;
const device = navigator.gpu ? 'webgpu' : 'wasm';
const transcriberP = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true, device });
// Reuse existing element references defined at the top of the file
    let recorder,chunks=[],blob;
    const ac=new AudioContext();
    let off;
    async function blobToPCM(b,r=16000){
      const buf=await b.arrayBuffer();
      const dec=await ac.decodeAudioData(buf);
      if(dec.sampleRate===r)return dec.getChannelData(0);
      const frames=Math.ceil(dec.duration*r);
      off=new OfflineAudioContext(1,frames,r);
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

    const { initTracker } = await import('./tracker.js');
    initTracker({
      video,
      canvas: document.getElementById('trackerCanvas')
    });
})();
