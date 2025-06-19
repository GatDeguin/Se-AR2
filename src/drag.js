export function initCaptionDrag(captionContainer){
  captionContainer.dataset.centered = 'true';
  captionContainer.classList.add('draggable');
  let dragging = false, offsetX = 0, offsetY = 0;
  let pending = false, dragX = 0, dragY = 0;
  captionContainer.addEventListener('pointerdown', startDrag);
  captionContainer.addEventListener('pointermove', onDrag);
  captionContainer.addEventListener('pointerup', endDrag);
  captionContainer.addEventListener('pointercancel', endDrag);

  function startDrag(e){
    if(e.button !== 0) return;
    dragging = true;
    captionContainer.setPointerCapture(e.pointerId);
    captionContainer.classList.add('dragging');
    const rect = captionContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    if(captionContainer.dataset.centered !== 'false'){
      captionContainer.style.left = `${rect.left}px`;
      captionContainer.style.top = `${rect.top}px`;
      captionContainer.style.right = 'auto';
      captionContainer.style.bottom = 'auto';
      captionContainer.style.transform = 'translate(0,0)';
      captionContainer.dataset.centered = 'false';
    }
    e.preventDefault();
  }

  function onDrag(e){
    if(!dragging) return;
    dragX = e.clientX - offsetX;
    dragY = e.clientY - offsetY;
    if(!pending){
      pending = true;
      requestAnimationFrame(applyDrag);
    }
  }

  function applyDrag(){
    pending = false;
    let x = dragX, y = dragY;
    const maxX = window.innerWidth - captionContainer.offsetWidth - 8;
    const maxY = window.innerHeight - captionContainer.offsetHeight - 8;
    x = Math.max(8, Math.min(x, maxX));
    y = Math.max(8, Math.min(y, maxY));
    captionContainer.style.left = `${x}px`;
    captionContainer.style.top = `${y}px`;
  }

  function endDrag(e){
    if(!dragging) return;
    dragging = false;
    captionContainer.releasePointerCapture(e.pointerId);
    captionContainer.classList.remove('dragging');
    captionContainer.classList.add('drop');
  }

  captionContainer.addEventListener('animationend', () => {
    captionContainer.classList.remove('drop');
  });
}
