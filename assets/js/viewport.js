(function(){
  class QRViewport {
    constructor(canvas, stage, pad){
      this.canvas = canvas;
      this.stage  = stage;
      this.pad    = pad;
      this.baseW  = canvas.width;
      this.baseH  = canvas.height;

      this.mode   = 'portrait'; // o 'landscape'
      this.layout = this.layout.bind(this);

      window.addEventListener('resize', this.layout);
      window.addEventListener('orientationchange', this.layout);
      this.layout();
    }

    getOrientation(){
      return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }

    layout(){
      const mode = this.getOrientation();
      this.mode = mode;

      // Altura disponible: en retrato restamos la barra de controles
      const ww = window.innerWidth;
      const wh = window.innerHeight;

      const padVisible = this.pad && this.pad.matches(':not([hidden])');
      const padH = (mode === 'portrait' && padVisible) ? this.pad.offsetHeight || 0 : 0;

      const availW = ww - 16; // pequeño margen visual por los bordes del stage
      const availH = wh - padH - 16;

      const scale = Math.min(availW / this.baseW, availH / this.baseH);

      const outW = Math.max(1, Math.floor(this.baseW * scale));
      const outH = Math.max(1, Math.floor(this.baseH * scale));

      // Dimensiona el stage y centra
      this.stage.style.height = Math.max(0, Math.floor(availH)) + 'px';
      this.stage.style.minHeight = Math.max(0, Math.floor(this.baseH * Math.min(1, scale))) + 'px'; // por si escala < 1

      // Aplica el tamaño al canvas (CSS, no cambiamos el tamaño interno)
      this.canvas.style.width  = outW + 'px';
      this.canvas.style.height = outH + 'px';

      // Emite evento para que el pad ajuste su modo
      window.dispatchEvent(new CustomEvent('qr:viewport:change', { detail: { mode, scale, outW, outH, padH } }));
    }
  }

  window.QRViewport = QRViewport;
})();
