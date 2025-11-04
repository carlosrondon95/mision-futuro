(function(){
  const canvas = document.getElementById('qr-canvas');
  const hudBadge = document.querySelector('.qr-hud .qr-badge');
  if (!canvas) return;

  // Ajuste visual: asegura color/fuente de marca si quieres
  if (window.qrAjax && qrAjax.brand) {
    document.documentElement.style.setProperty('--primary', qrAjax.brand.primary || '#00BCD4');
  }

  const game = new QRGame(canvas, hudBadge);
  game.start();
})();
