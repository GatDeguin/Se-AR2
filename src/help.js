import { ripple } from './utils.js';

export function initHelp({ helpBtn, helpPanel, helpClose }){
  function toggleHelp(show){
    helpPanel.classList.toggle('show', show);
    helpBtn.setAttribute('aria-expanded', show.toString());
    helpPanel.setAttribute('aria-hidden', (!show).toString());
  }
  if(helpBtn) helpBtn.addEventListener('click', e => {
    ripple(e, helpBtn);
    toggleHelp(!helpPanel.classList.contains('show'));
  });
  if(helpClose) helpClose.addEventListener('click', e => {
    ripple(e, helpClose);
    toggleHelp(false);
  });
  document.addEventListener('click', e => {
    if(helpPanel.classList.contains('show') && !helpPanel.contains(e.target) && e.target !== helpBtn){
      toggleHelp(false);
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') toggleHelp(false);
  });
}
