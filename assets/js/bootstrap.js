// assets/js/bootstrap.js
(function () {
  const canvas = document.getElementById("qr-canvas");
  const hudBadge = document.querySelector(".qr-hud .qr-badge");
  const stage = document.getElementById("qr-stage");
  const appRoot = document.getElementById("qr-app");
  const padEl = document.getElementById("qr-pad");
  if (!canvas || !stage || !appRoot) return;

  // --- Detección base URL del plugin ---
  function detectBaseFromScript() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i].src || "";
      const idx = s.indexOf("/assets/js/bootstrap.js");
      if (idx !== -1) return s.slice(0, idx + 1);
    }
    return "/";
  }
  const BASE =
    window.qrAjax && qrAjax.base_url
      ? qrAjax.base_url.endsWith("/")
        ? qrAjax.base_url
        : qrAjax.base_url + "/"
      : detectBaseFromScript();

  // --- Helpers de carga ---
  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("Image load error: " + src));
      img.src = src;
    });
  }
  async function tryLoadImage(src) {
    try {
      return await loadImage(src);
    } catch {
      return null;
    }
  }

  async function preloadHero(gender) {
    const dir = `${BASE}assets/img/${gender}/`;
    const [idle, stepR, stepL, jump] = await Promise.all([
      loadImage(`${dir}${gender}.png`),
      loadImage(`${dir}${gender}-pasoderecho.png`),
      loadImage(`${dir}${gender}-pasoizquierdo.png`),
      loadImage(`${dir}${gender}-salto.png`),
    ]);
    return { idle, stepR, stepL, jump };
  }
  const preloadBg = () => loadImage(`${BASE}assets/img/fondo.jpg`);
  const preloadDoor = () => loadImage(`${BASE}assets/img/puerta.png`);
  const preloadCopa = () => loadImage(`${BASE}assets/img/copa.png`);
  const preloadObstacle = () => loadImage(`${BASE}assets/img/obstaculo.png`);

  async function preloadDecos() {
    const dir = `${BASE}assets/img/deco/`;
    // 👇 Claves que espera game.js: cometa, marciano, nave, (opcional) pajaro1, pajaro2
    const files = {
      cometa: "cometa.png",
      marciano: "marciano.png",
      nave: "nave-espacial.png", // mapeo correcto (antes usabas "ovni")
      pajaro1: "pajaro1.png", // opcional, si no existe no pasa nada
      pajaro2: "pajaro2.png", // opcional
    };
    const entries = await Promise.all(
      Object.entries(files).map(async ([k, f]) => [
        k,
        await tryLoadImage(dir + f),
      ])
    );
    // Filtra nulos para no romper spawnFlyer
    return entries.reduce((acc, [k, img]) => {
      if (img) acc[k] = img;
      return acc;
    }, {});
  }

  // --- Detección móvil mejorada (móvil + tablet/iPad) ---
  const isMobile = (function () {
    const ua = (
      navigator.userAgent ||
      navigator.vendor ||
      window.opera ||
      ""
    ).toLowerCase();
    const platform = (navigator.platform || "").toLowerCase();

    // iPad clásico + iPadOS moderno (que se identifica como "MacIntel")
    const isIpad =
      ua.includes("ipad") ||
      (platform === "macintel" &&
        typeof navigator.maxTouchPoints === "number" &&
        navigator.maxTouchPoints > 1);

    const isPhoneLike =
      /android|iphone|ipod|iemobile|windows phone|blackberry|bb10/.test(ua);

    const coarse =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const noHover =
      window.matchMedia && window.matchMedia("(hover: none)").matches;
    const hasTouch =
      typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 0;

    // Consideramos "móvil" todo lo táctil sin hover (teléfonos + tablets),
    // más detecciones específicas de iPad y móviles clásicos.
    return isIpad || isPhoneLike || (coarse && noHover && hasTouch);
  })();

  if (isMobile) document.body.classList.add("is-mobile");
  else document.body.classList.remove("is-mobile");

  // --- Tamaño cómodo en escritorio antes de jugar ---
  function applyDesktopWide() {
    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    const targetW = Math.round(Math.min(Math.max(vw * 0.84, 1200), 1600));
    const targetH = Math.round(targetW / 3);
    stage.style.width = targetW + "px";
    stage.style.height = targetH + "px";
    stage.style.maxWidth = "100%";
    stage.style.margin = "0 auto";
    canvas.style.width = "100%";
    canvas.style.height = targetH + "px";
    appRoot.classList.add("qr-wide");
  }
  if (!isMobile) {
    stage.classList.remove("qr-stage--mobile");
    if (padEl) {
      padEl.hidden = true;
      padEl.setAttribute("aria-hidden", "true");
    }
    applyDesktopWide();
    window.addEventListener("resize", applyDesktopWide);
  }

  let viewport = null,
    virtualPad = null,
    fsMgr = null;
  const padState = { left: false, right: false };

  // --- Arranque desde el modal de inicio ---
  window.QRUI.startModal(async () => {
    // Audio tras gesto
    if (window.QRAudio) {
      try {
        window.QRAudio.init(BASE);
        window.QRAudio.playMusic().catch(() => {});
      } catch (e) {
        console.warn("[QuizRunner] Audio init:", e);
      }
    }

    // Entornos
    if (isMobile) {
      viewport = new QRViewport(canvas, stage, padEl);
      virtualPad = new VirtualPad({
        onJump: () => {
          if (window.game && !window.game.isInputLocked())
            window.game.queueJump();
        },
      });
      fsMgr = new QRFS(appRoot, stage, padEl);
      try {
        await fsMgr.enter();
      } catch {}
      const btnL = document.getElementById("qr-pad-left");
      const btnR = document.getElementById("qr-pad-right");
      (function loopPad() {
        padState.left = !!(
          btnL && btnL.classList.contains("qr-pad__btn--pressed")
        );
        padState.right = !!(
          btnR && btnR.classList.contains("qr-pad__btn--pressed")
        );
        requestAnimationFrame(loopPad);
      })();
    } else {
      stage.classList.remove("qr-stage--mobile");
      if (padEl) {
        padEl.hidden = true;
        padEl.setAttribute("aria-hidden", "true");
      }
    }

    // Selección de personaje
    const malePreview = `${BASE}assets/img/hombre/hombre.png`;
    const femalePreview = `${BASE}assets/img/mujer/mujer.png`;

    QRUI.selectHeroModal(malePreview, femalePreview, async (gender) => {
      try {
        const [heroSprites, fondo, puerta, copa, obstaculo, decosMap] =
          await Promise.all([
            preloadHero(gender),
            preloadBg(),
            preloadDoor(),
            preloadCopa(),
            preloadObstacle(),
            preloadDecos(),
          ]);

        // ✅ Mapeo EXACTO a lo que espera game.js
        const assets = {
          fondo,
          puerta,
          copa,
          obstaculo,
          deco: decosMap, // <- antes era "decos"
          hero: heroSprites, // <- objeto con {idle, stepR, stepL, jump}
        };

        // Instanciar juego con el pad (móvil) o sin él (desktop)
        window.game = new QRGame(
          canvas,
          hudBadge,
          assets,
          isMobile ? padState : { left: false, right: false }
        );

        // Arrancar
        window.game.start();
      } catch (e) {
        console.error(e);
        alert(
          "No se han podido cargar algunas imágenes. Revisa rutas y nombres en /assets/img/."
        );
      }
    });
  });
})();
