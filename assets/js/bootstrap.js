(function () {
  const canvas = document.getElementById("qr-canvas");
  const hudBadge = document.querySelector(".qr-hud .qr-badge");
  const stage = document.getElementById("qr-stage");
  const padEl = document.getElementById("qr-pad");
  if (!canvas || !stage) return;

  // Color de marca 
  if (window.qrAjax && qrAjax.brand) {
    document.documentElement.style.setProperty(
      "--primary",
      qrAjax.brand.primary || "#00BCD4"
    );
  }

  // Detección robusta de móvil (UA + coarse pointer + no hover)
  const isMobile = (function () {
    const ua = (
      navigator.userAgent ||
      navigator.vendor ||
      window.opera ||
      ""
    ).toLowerCase();
    const uaMobile =
      /android|iphone|ipad|ipod|iemobile|windows phone|blackberry|bb10/.test(
        ua
      );
    const coarse =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const noHover =
      window.matchMedia && window.matchMedia("(hover: none)").matches;
    return uaMobile || (coarse && noHover);
  })();

  // Estado del pad (si se usa)
  const padState = { left: false, right: false };
  let viewport = null;
  let virtualPad = null;

  if (isMobile) {
    // MODO MÓVIL: stage móvil, viewport y pad
    stage.classList.add("qr-stage--mobile");

    viewport = new QRViewport(canvas, stage, padEl);
    virtualPad = new VirtualPad({
      onJump: () => {
        if (game) game.queueJump();
      },
    });

    // Sincroniza flags del padState leyendo clases CSS de los botones
    const btnL = document.getElementById("qr-pad-left");
    const btnR = document.getElementById("qr-pad-right");
    function updatePadState() {
      padState.left = btnL && btnL.classList.contains("qr-pad__btn--pressed");
      padState.right = btnR && btnR.classList.contains("qr-pad__btn--pressed");
      requestAnimationFrame(updatePadState);
    }
    updatePadState();
  } else {
    // ESCRITORIO: sin viewport ni pad; apariencia original
    stage.classList.remove("qr-stage--mobile");
    if (padEl) {
      padEl.hidden = true;
      padEl.setAttribute("aria-hidden", "true");
    }
    // Asegura que el canvas no tenga escalados de sesiones previas
    canvas.style.width = "";
    canvas.style.height = "";
    stage.style.height = "";
    stage.style.minHeight = "";
  }

  // Crea el juego (usa padState solo si es móvil)
  const game = new QRGame(
    canvas,
    hudBadge,
    {},
    isMobile ? padState : { left: false, right: false }
  );

  // Menú de inicio → comenzar juego
  window.QRUI.startModal(() => game.start());
})();
