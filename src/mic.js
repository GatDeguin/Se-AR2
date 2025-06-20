import { ripple, vibrate } from './utils.js';
import { getHapticsEnabled } from './settings.js';

export function initMic({ SR, micBtn, captionContainer, captionText, micSelect, fallbackSpeech, savedMic, libsPromise }){
  let recog;
  let recogActive = false;

  function setProgress(progressEl, value){
    if(!progressEl) return;
    progressEl.style.width = value + '%';
  }

  function animate(txt){
    captionText.innerHTML='';
    const w = txt.split(' ');
    w.forEach(t => {
      const s = document.createElement('span');
      s.textContent = t + ' ';
      s.className = 'caption-text-word';
      captionText.appendChild(s);
    });
    let j=0,last=performance.now();
    function hl(now){
      if(now - last >= 400){
        if(j>0 && captionText.children[j-1]){
          captionText.children[j-1].classList.remove('highlight');
        }
        if(j<w.length && captionText.children[j]){
          captionText.children[j].classList.add('highlight');
          j++; last=now;
        }else if(j<w.length){
          j++; last=now;
        }
      }
      if(j<w.length) requestAnimationFrame(hl);
    }
    requestAnimationFrame(hl);
  }

  function speechHandler(e){
    ripple(e, micBtn);
    vibrate(50, getHapticsEnabled());
    if(!SR) return;
    micBtn.classList.add('starting');
    if(!recog){
      recog = new SR();
      recog.lang = 'es-ES';
      recog.interimResults = true;
      recog.continuous = true;
      recog.onstart = () => {
        recogActive = true;
        micBtn.classList.add('active');
        captionContainer.classList.add('show');
        vibrate([100,50,100], getHapticsEnabled());
      };
      recog.onend = () => {
        recogActive = false;
        micBtn.classList.remove('active');
        captionContainer.classList.remove('show');
        setProgress(document.getElementById('progress'), 0);
        vibrate(50, getHapticsEnabled());
      };
      recog.onresult = e => {
        let fin='',int='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const t=e.results[i][0].transcript;
          e.results[i].isFinal?fin+=t+' ':int=t;
        }
        if(fin) animate(fin.trim());
        else captionText.textContent = int || captionText.textContent;
        setProgress(document.getElementById('progress'), Math.min(100, captionText.textContent.length*1.2));
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

  async function ensureLibs(){
    try{
      return await import(new URL('../libs/transformers.min.js', import.meta.url));
    }catch{
      return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/dist/transformers.min.js');
    }
  }

  const libsP = libsPromise || ensureLibs();

  (async ()=>{
    const progress = document.getElementById('progress');
    const { pipeline } = await libsP;
    const device = navigator.gpu ? 'webgpu' : 'wasm';
    const transcriberP = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true, device });
    let recorder,chunks=[],blob;
    const worker = window.Worker ? new Worker(new URL('./transcribeWorker.js', import.meta.url), { type: 'module' }) : null;

    async function blobToPCM(b,r=16000){
      const ac=new AudioContext();
      let off;
      try{
        const buf=await b.arrayBuffer();
        const dec=await ac.decodeAudioData(buf);
        if(dec.sampleRate===r){
          return dec.getChannelData(0).slice();
        }
        const frames=Math.ceil(dec.duration*r);
        off=new OfflineAudioContext(1,frames,r);
        const src=off.createBufferSource();src.buffer=dec;
        src.connect(off.destination);src.start();
        const res=await off.startRendering();
        off.close&&off.close();
        return res.getChannelData(0).slice();
      }finally{
        ac.close();
      }
    }

    async function transcribe(pcm){
      captionText.textContent='Transcribiendo…';
      setProgress(progress,35);
      if(worker){
        const p=new Promise(r=>{worker.onmessage=e=>r(e.data);});
        worker.postMessage(pcm,[pcm.buffer]);
        const text=await p;
        captionText.textContent=text;
        setProgress(progress,100);
        setTimeout(()=>setProgress(progress,0),1000);
        return;
      }
      const { text }=await (await transcriberP)(pcm,{chunk_length_s:30,language:'spanish'});
      captionText.textContent=text.trim();
      setProgress(progress,100);
      setTimeout(()=>setProgress(progress,0),1000);
    }

    async function recordHandler(){
      try{
        vibrate(40, getHapticsEnabled());
        if(!recorder || recorder.state==='inactive'){
          const audioId = micSelect && micSelect.value ? micSelect.value : savedMic;
          const stream=await navigator.mediaDevices.getUserMedia({audio: audioId ? {deviceId:{exact:audioId}} : true});
          recorder=new MediaRecorder(stream,{mimeType:'audio/webm'});
          chunks=[];
          recorder.ondataavailable=ev=>chunks.push(ev.data);
          recorder.onstop=async()=>{blob=new Blob(chunks,{type:'audio/webm'});const pcm=await blobToPCM(blob);await transcribe(pcm);micBtn.classList.remove('active');};
          recorder.start();micBtn.classList.add('active');
          captionContainer.classList.add('show');
          captionText.textContent='Grabando…';
          setProgress(progress,15);
        }else{recorder.stop();}
      }catch(err){
        fallbackSpeech.textContent = `\ud83c\udf99\ufe0f ${err.message}. Verifique los permisos de micrófono.`;
        fallbackSpeech.classList.add('show');
      }
    }

    micBtn.addEventListener('click', speechHandler);
    micBtn.addEventListener('click', recordHandler);
  })();
}
