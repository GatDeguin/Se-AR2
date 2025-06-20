import { ripple } from './utils.js';

export function initTour({ tourOverlay, tourTooltip, tourNext, tourClose }){
  const steps=[
    {el:'#settingsBtn',text:'Accede a configuraciones.'},
    {el:'#themeToggle',text:'Cambia tema.'},
    {el:'#pauseBtn',text:'Pausa/reanuda.'},
    {el:'#snapshotBtn',text:'Captura pantalla.'},
    {el:'#switchCamBtn',text:'Cambia cámara.'},
    {el:'#restartBtn',text:'Reinicia.'},
    {el:'#micBtn',text:'Activa subtitulos automáticos.'}
  ];
  let idx=0;
  let highlightEl=null;
  function show(i){
    const t=steps[i];
    const e=document.querySelector(t.el);
    if(highlightEl) highlightEl.classList.remove('tour-highlight');
    highlightEl=e;
    e.classList.add('tour-highlight');
    const r=e.getBoundingClientRect();
    tourTooltip.textContent=t.text;

    let top=r.bottom+10;
    let left=r.left;
    const tooltipHeight=tourTooltip.offsetHeight;
    const tooltipWidth=tourTooltip.offsetWidth;
    if(top+tooltipHeight>window.innerHeight){
      top=r.top-tooltipHeight-10;
    }
    if(left+tooltipWidth>window.innerWidth){
      left=window.innerWidth-tooltipWidth-10;
    }
    tourTooltip.style.top=`${top}px`;
    tourTooltip.style.left=`${Math.max(0,left)}px`;
  }
  function startTour(){
    tourOverlay.classList.add('active');
    show(idx);
  }
  function endTour(){
    if(highlightEl) highlightEl.classList.remove('tour-highlight');
    tourOverlay.classList.remove('active');
    localStorage.setItem('tourSeen','true');
  }
  tourNext.onclick=e=>{ripple(e,tourNext);idx++;idx<steps.length?show(idx):endTour();};
  tourClose.onclick=e=>{ripple(e,tourClose);endTour();};
  return startTour;
}
