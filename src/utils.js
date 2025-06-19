export function ripple(e, el){
  const r = el.getBoundingClientRect();
  const s = Math.max(r.width, r.height);
  let x = e && e.clientX, y = e && e.clientY;
  if(!x && !y){ x = r.left + r.width/2; y = r.top + r.height/2; }
  x -= r.left + s/2; y -= r.top + s/2;
  const sp = document.createElement('span');
  sp.className = 'ripple';
  sp.style.width = sp.style.height = s + 'px';
  sp.style.left = x + 'px';
  sp.style.top = y + 'px';
  el.appendChild(sp);
  sp.onanimationend = () => sp.remove();
}

export function vibrate(pattern, enabled = true){
  if(enabled && navigator.vibrate) navigator.vibrate(pattern);
}
