(function(){
  const canvas = document.getElementById('qr-canvas');
  const hudBadge = document.querySelector('.qr-hud .qr-badge');
  if (!canvas) return;

  // Aplica color de marca si viene del PHP
  if (window.qrAjax && qrAjax.brand) {
    document.documentElement.style.setProperty('--primary', qrAjax.brand.primary || '#00BCD4');
  }

  // Instancia el juego pero NO lo arrancamos aún
  const game = new QRGame(canvas, hudBadge);

  // Mostrar menú de inicio; al pulsar Jugar → comenzar
  window.QRUI.startModal(() => {
    game.start();
  });
})();
