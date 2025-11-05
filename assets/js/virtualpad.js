(function(){
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  class VirtualPad {
    constructor({ onJump } = {}){
      this.el   = document.getElementById('qr-pad');
      this.left = false;
      this.right= false;
      this.onJump = onJump || function(){};

      this.btnLeft  = document.getElementById('qr-pad-left');
      this.btnRight = document.getElementById('qr-pad-right');
      this.btnJump  = document.getElementById('qr-pad-jump');

      if (!this.el) return;

      // Mostrar pad solo en dispositivos táctiles
      if (isTouch) {
        this.el.hidden = false;
        this.el.setAttribute('aria-hidden', 'false');
      } else {
        this.el.hidden = true;
        this.el.setAttribute('aria-hidden', 'true');
      }

      // Eventos pointer (multitouch)
      const onDown = (btn, setFlag) => (e)=>{ e.preventDefault(); setFlag(true); btn.classList.add('qr-pad__btn--pressed'); };
      const onUp   = (btn, setFlag) => (e)=>{ e.preventDefault(); setFlag(false); btn.classList.remove('qr-pad__btn--pressed'); };

      // Movimiento
      const setLeft  = (v)=> this.left  = v;
      const setRight = (v)=> this.right = v;

      ['pointerdown','mousedown','touchstart'].forEach(ev=>{
        this.btnLeft.addEventListener(ev,  onDown(this.btnLeft, setLeft),  { passive:false });
        this.btnRight.addEventListener(ev, onDown(this.btnRight, setRight),{ passive:false });
        this.btnJump.addEventListener(ev,  (e)=>{ e.preventDefault(); this.onJump(); this.btnJump.classList.add('qr-pad__btn--pressed'); }, { passive:false });
      });
      ['pointerup','pointercancel','mouseup','mouseleave','touchend','touchcancel'].forEach(ev=>{
        this.btnLeft.addEventListener(ev,  onUp(this.btnLeft, setLeft),  { passive:false });
        this.btnRight.addEventListener(ev, onUp(this.btnRight, setRight),{ passive:false });
        this.btnJump.addEventListener(ev,  (e)=>{ e.preventDefault(); this.btnJump.classList.remove('qr-pad__btn--pressed'); }, { passive:false });
      });

      // Cambia de retrato a paisaje
      window.addEventListener('qr:viewport:change', (ev)=>{
        const mode = ev.detail.mode;
        this.el.classList.toggle('qr-pad--portrait',  mode === 'portrait');
        this.el.classList.toggle('qr-pad--landscape', mode === 'landscape');
      });

      // Ocultar pad cuando haya modal
      window.addEventListener('qr:modal:open',  ()=> this.hide());
      window.addEventListener('qr:modal:close', ()=> this.showIfTouch());
    }

    hide(){
      if (!this.el) return;
      this.el.style.opacity = '0';
      this.el.style.pointerEvents = 'none';
    }
    showIfTouch(){
      if (!this.el) return;
      if (isTouch){
        this.el.style.opacity = '1';
        this.el.style.pointerEvents = 'auto';
      }
    }
  }

  window.VirtualPad = VirtualPad;
})();
