// assets/js/ui.js
(function () {
  // ===== Util: total de puertas (preguntas + formulario final) =====
  function getTotalDoors() {
    return window.QRData && Array.isArray(window.QRData.QUESTIONS)
      ? window.QRData.QUESTIONS.length
      : 0;
  }

  function setBadge(currentOneBased) {
    var badge = document.querySelector(".qr-badge");
    var total = getTotalDoors();
    if (badge && total > 0) {
      var curr = Math.max(1, currentOneBased || 1);
      badge.textContent = curr + " / " + total;
    }
  }
  setBadge(1);

  window.addEventListener("qr:station", function (ev) {
    var idx =
      ev && ev.detail && typeof ev.detail.index === "number"
        ? ev.detail.index
        : 0;
    setBadge(idx + 1);
  });

  // ===== Resolver base de assets =====
  function resolveAssetsBase() {
    if (window.QR_ASSETS_BASE) {
      return String(window.QR_ASSETS_BASE).replace(/\/?$/, "/");
    }
    const scripts = document.scripts || document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      const m = src.match(/^(.*\/assets\/)js\/ui\.js(?:\?.*)?$/i);
      if (m) return m[1];
    }
    return "assets/";
  }
  const ASSETS = resolveAssetsBase();

  // ===== Infra modal =====
  const stageEl = document.getElementById("qr-stage");
  let root = document.querySelector("#qr-stage #qr-modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "qr-modal-root";
    if (stageEl) stageEl.appendChild(root);
  }
  const appEl = document.getElementById("qr-app");

  function markStageModalOpen(on) {
    if (!stageEl) return;
    stageEl.classList.toggle("qr-stage--modal-open", !!on);
  }
  function emit(name) {
    window.dispatchEvent(new CustomEvent(name));
  }
  function close() {
    const m = document.querySelector("#qr-stage .qr-modal");
    if (m) m.remove();
    const any = document.querySelector("#qr-stage .qr-modal");
    markStageModalOpen(!!any);
    emit("qr:modal:close");
  }
  function isMobile() {
    return document.body.classList.contains("is-mobile");
  }
  function isTypingTarget(el) {
    if (!el) return false;
    const t = (el.tagName || "").toLowerCase();
    return (
      t === "input" ||
      t === "textarea" ||
      t === "select" ||
      el.isContentEditable === true
    );
  }

  // Bloquear scroll con espacio
  (function installSpaceScrollGuard() {
    const handler = (e) => {
      const code = e.code || e.key;
      const isSpace = code === "Space" || code === "Spacebar" || e.key === " ";
      if (!isSpace) return;
      if (isTypingTarget(e.target)) return;
      const insideApp = !!(appEl && appEl.contains(e.target));
      const modalOpen = !!document.querySelector("#qr-stage .qr-modal");
      if (insideApp || modalOpen) e.preventDefault();
    };
    document.addEventListener("keydown", handler, {
      passive: false,
      capture: true,
    });
  })();

  // Ajuste de escala
  function fitCardToStage(card, minScale = 0.85) {
    if (!card || !stageEl) return;
    const rectStage = stageEl.getBoundingClientRect();
    const padW = 16,
      padH = 16;
    const availW = Math.max(1, rectStage.width - padW);
    const availH = Math.max(1, rectStage.height - padH);

    card.style.transform = "none";
    card.style.transformOrigin = "center center";
    card.style.willChange = "transform";

    const rect = card.getBoundingClientRect();
    const scaleW = availW / Math.max(1, rect.width);
    const scaleH = availH / Math.max(1, rect.height);
    const scale = Math.min(1, Math.max(minScale, Math.min(scaleW, scaleH)));

    if (scale < 1) card.style.transform = `scale(${scale})`;
  }

  // ===== Pantalla de inicio (portada + botón start.png) =====
  function startModal(onPlay) {
    if (document.querySelector("#qr-stage .qr-modal")) return;

    const modal = document.createElement("div");
    modal.className = "qr-modal qr-modal--start"; // SIN gris: fondo transparente

    const card = document.createElement("div");
    card.className = "qr-card qr-card--start";

    card.innerHTML = `
      <div class="qr-start-cover">
        <img
          src="${ASSETS}img/portada.png"
          alt="Pantalla de inicio"
          class="qr-start-cover__img"
        />
        <button class="qr-start-btn-img" id="qrStartBtn" type="button" aria-label="Jugar">
          <img
            src="${ASSETS}img/buttons/start.png"
            alt="Jugar"
            class="qr-start-btn-img__icon"
          />
        </button>
      </div>
    `;

    modal.appendChild(card);
    root.appendChild(modal);
    markStageModalOpen(true);
    emit("qr:modal:open");

    const refit = () => requestAnimationFrame(() => fitCardToStage(card, 0.95));
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.addEventListener("qr:viewport:change", refit);
    window.addEventListener(
      "qr:modal:close",
      () => {
        window.removeEventListener("resize", refit);
        window.removeEventListener("orientationchange", refit);
        window.removeEventListener("qr:viewport:change", refit);
      },
      { once: true }
    );

    const cleanup = () => {
      window.removeEventListener("keydown", keyHandler);
      close();
    };

    async function requestFSNow() {
      if (!isMobile()) return;
      try {
        if (!document.fullscreenElement && appEl && appEl.requestFullscreen) {
          await appEl.requestFullscreen({ navigationUI: "hide" });
        }
      } catch (_) {}
    }

    const start = async () => {
      await requestFSNow();
      cleanup();
      onPlay && onPlay();
    };

    const keyHandler = (e) => {
      const k = (e.key || "").toLowerCase();
      if (k === "enter" || k === " ") {
        e.preventDefault();
        start();
      }
    };

    const btn = card.querySelector("#qrStartBtn");
    if (btn) btn.addEventListener("click", start);
    window.addEventListener("keydown", keyHandler);
  }

  // ===== Selección de personaje =====
  function selectHeroModal(maleUrl, femaleUrl, onSelect) {
    if (document.querySelector("#qr-stage .qr-modal")) return;

    const modal = document.createElement("div");
    modal.className = "qr-modal qr-modal--select"; // SIN gris: fondo transparente
    const card = document.createElement("div");
    card.className = "qr-card qr-card--select";

    card.innerHTML = `
      <h3 class="qr-title">Elige tu personaje</h3>
      <div class="qr-select" role="listbox" aria-label="Elige personaje">
        <button class="qr-select__item" id="selMale" aria-label="Hombre">
          <div class="qr-select__imgwrap">
            <img class="qr-select__img" src="${maleUrl}" alt="Hombre" />
          </div>
        </button>
        <button class="qr-select__item" id="selFemale" aria-label="Mujer">
          <div class="qr-select__imgwrap">
            <img class="qr-select__img" src="${femaleUrl}" alt="Mujer" />
          </div>
        </button>
      </div>
    `;

    modal.appendChild(card);
    root.appendChild(modal);
    markStageModalOpen(true);
    emit("qr:modal:open");

    if (window.QRAudio) window.QRAudio.playDoor();

    const refit = () => requestAnimationFrame(() => fitCardToStage(card, 0.8));
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.addEventListener("qr:viewport:change", refit);
    window.addEventListener(
      "qr:modal:close",
      () => {
        window.removeEventListener("resize", refit);
        window.removeEventListener("orientationchange", refit);
        window.removeEventListener("qr:viewport:change", refit);
      },
      { once: true }
    );

    const pick = (g) => {
      if (window.QRAudio) window.QRAudio.playAnswer();
      close();
      onSelect && onSelect(g);
    };

    card
      .querySelector("#selMale")
      .addEventListener("click", () => pick("hombre"));
    card
      .querySelector("#selFemale")
      .addEventListener("click", () => pick("mujer"));

    const items = card.querySelectorAll(".qr-select__item");
    let idx = 0;
    if (items[0]) items[0].focus();
    card.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        idx = Math.min(items.length - 1, idx + 1);
        items[idx].focus();
      }
      if (e.key === "ArrowLeft") {
        idx = Math.max(0, idx - 1);
        items[idx].focus();
      }
      if (e.key === "Enter") {
        items[idx].click();
      }
    });
  }

  // ===== Pregunta =====
  function questionModal(qObj, onAnswer) {
    if (document.querySelector("#qr-stage .qr-modal")) return;
    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-card--question";

    card.innerHTML = `
      <div class="qr-q">${qObj.q}</div>
      <div class="qr-opts"></div>
    `;

    const opts = card.querySelector(".qr-opts");
    qObj.opts.forEach((op) => {
      const b = document.createElement("button");
      b.className = "qr-opt";
      b.textContent = op;
      b.addEventListener("click", () => {
        if (window.QRAudio) window.QRAudio.playAnswer();
        close();
        onAnswer && onAnswer(op);
      });
      opts.appendChild(b);
    });

    modal.appendChild(card);
    root.appendChild(modal);
    markStageModalOpen(true);
    emit("qr:modal:open");

    const refit = () => requestAnimationFrame(() => fitCardToStage(card, 0.85));
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.addEventListener("qr:viewport:change", refit);
    window.addEventListener(
      "qr:modal:close",
      () => {
        window.removeEventListener("resize", refit);
        window.removeEventListener("orientationchange", refit);
        window.removeEventListener("qr:viewport:change", refit);
      },
      { once: true }
    );
  }

  // ===== Formulario (TUS DATOS) =====
  function formModal(onSubmit) {
    if (document.querySelector("#qr-stage .qr-modal")) return;

    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-card--form";

    card.innerHTML = `
      <form id="qrLeadForm" novalidate>
        <h3 class="qr-title">📩 TUS DATOS</h3>

        <div class="qr-form-grid">
          <div class="qr-row">
            <label for="fName">Nombre</label>
            <input class="qr-input" id="fName" type="text" placeholder="Nombre" maxlength="99" autocomplete="name">
            <div class="qr-error" id="errName"></div>
          </div>
          <div class="qr-row">
            <label for="fPhone">Teléfono</label>
            <input class="qr-input" id="fPhone" type="tel" placeholder="Teléfono" inputmode="numeric" autocomplete="tel" pattern="\\d*">
            <div class="qr-error" id="errPhone"></div>
          </div>
        </div>

        <div class="qr-row">
          <label for="fEmail">Email</label>
          <input class="qr-input" id="fEmail" type="email" placeholder="Email" autocomplete="email" inputmode="email">
          <div class="qr-error" id="errEmail"></div>
        </div>

        <div class="qr-row qr-consent">
          <label>
            <input id="fConsent" type="checkbox">
            Acepto la <a id="policyLink" class="qr-link" href="https://versuselearning.com/politica-de-privacidad/" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          </label>
          <div class="qr-error" id="errConsent"></div>
        </div>

        <div class="qr-start-actions">
          <button class="qr-btn--img" id="btnSend" type="submit" aria-label="Enviar">
            <img src="${ASSETS}img/buttons/send.png" alt="Enviar" class="qr-btn--img__icon" />
          </button>
        </div>
      </form>
    `;

    modal.appendChild(card);
    (document.querySelector("#qr-stage #qr-modal-root") || root).appendChild(
      modal
    );
    markStageModalOpen(true);
    emit("qr:modal:open");

    const refit = () => requestAnimationFrame(() => fitCardToStage(card, 0.85));
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.addEventListener("qr:viewport:change", refit);
    window.addEventListener(
      "qr:modal:close",
      () => {
        window.removeEventListener("resize", refit);
        window.removeEventListener("orientationchange", refit);
        window.removeEventListener("qr:viewport:change", refit);
      },
      { once: true }
    );

    const policyLink = card.querySelector("#policyLink");
    if (policyLink)
      policyLink.addEventListener("click", (e) => e.stopPropagation());

    // Validación
    const form = card.querySelector("#qrLeadForm");
    const nameI = card.querySelector("#fName");
    const mailI = card.querySelector("#fEmail");
    const phoneI = card.querySelector("#fPhone");
    const consI = card.querySelector("#fConsent");
    const errName = card.querySelector("#errName");
    const errEmail = card.querySelector("#errEmail");
    const errPhone = card.querySelector("#errPhone");
    const errCons = card.querySelector("#errConsent");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    function setErr(inputEl, errEl, msg) {
      if (msg) {
        errEl.textContent = msg;
        inputEl && inputEl.classList.add("is-invalid");
      } else {
        errEl.textContent = "";
        inputEl && inputEl.classList.remove("is-invalid");
      }
    }
    function validateName() {
      const v = (nameI.value || "").trim();
      if (!v) return setErr(nameI, errName, "El nombre es obligatorio."), false;
      if (v.length > 99)
        return setErr(nameI, errName, "Máximo 99 caracteres."), false;
      setErr(nameI, errName, "");
      return true;
    }
    function sanitizePhone() {
      let v = phoneI.value.replace(/[^\d+]/g, "");
      if (v.includes("+"))
        v = "+" + v.replace(/[+]/g, "").replace(/[^\d]/g, "");
      phoneI.value = v;
    }
    function validatePhone() {
      sanitizePhone();
      const v = phoneI.value.trim();
      if (!v)
        return setErr(phoneI, errPhone, "El teléfono es obligatorio."), false;
      const isIntl = v.startsWith("+");
      if (!isIntl) {
        if (!/^\d{9}$/.test(v))
          return (
            setErr(phoneI, errPhone, "Debe tener 9 dígitos si es español."),
            false
          );
      } else {
        if (!/^\+\d{8,15}$/.test(v))
          return (
            setErr(
              phoneI,
              errPhone,
              "Formato internacional no válido (+XX...)."
            ),
            false
          );
      }
      setErr(phoneI, errPhone, "");
      return true;
    }
    function validateEmail() {
      const v = (mailI.value || "").trim();
      if (!v) return setErr(mailI, errEmail, "El email es obligatorio."), false;
      if (!emailRe.test(v))
        return setErr(mailI, errEmail, "Introduce un email válido."), false;
      setErr(mailI, errEmail, "");
      return true;
    }
    function validateConsent() {
      if (!consI.checked)
        return (
          setErr(consI, errCons, "Debes aceptar la Política de Privacidad."),
          false
        );
      setErr(consI, errCons, "");
      return true;
    }
    function validateAll() {
      const a = validateName(),
        b = validateEmail(),
        c = validatePhone(),
        d = validateConsent();
      return a && b && c && d;
    }

    nameI.addEventListener("input", validateName);
    mailI.addEventListener("input", validateEmail);
    phoneI.addEventListener("input", () => {
      sanitizePhone();
      validatePhone();
    });
    consI.addEventListener("change", validateConsent);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateAll()) {
        if (!validateName()) return nameI.focus();
        if (!validateEmail()) return mailI.focus();
        if (!validatePhone()) return phoneI.focus();
        if (!validateConsent()) return consI.focus();
        return;
      }
      close();
      onSubmit &&
        onSubmit({
          name: nameI.value.trim(),
          email: mailI.value.trim(),
          phone: phoneI.value.trim(),
          consent: consI.checked ? "1" : "0",
        });
    });
  }

  // ===== Final =====
  function endingModal(result, onRestart) {
    const { top1, top2, bullets } = result;
    if (document.querySelector("#qr-stage .qr-modal")) return;

    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-end";

    card.innerHTML = `
      <h3 class="qr-title">🎖 Ceremonia de Asignación</h3>
      <p class="qr-end-lead"><strong>Tu perfil ideal:</strong> ${top1}</p>
      <div class="qr-end-badges">
        <div class="qr-badge">${top1}</div>
        ${top2 ? `<div class="qr-badge">También encajas en: ${top2}</div>` : ""}
      </div>
      <ul class="qr-end-list">
        ${bullets.map((b) => `<li>${b}</li>`).join("")}
      </ul>
      <div class="qr-end-actions">
        <button class="qr-btn" id="btnRestart" type="button">Reiniciar</button>
      </div>
    `;

    modal.appendChild(card);
    root.appendChild(modal);
    markStageModalOpen(true);
    emit("qr:modal:open");

    const refit = () => requestAnimationFrame(() => fitCardToStage(card, 0.85));
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.addEventListener("qr:viewport:change", refit);
    window.addEventListener(
      "qr:modal:close",
      () => {
        window.removeEventListener("resize", refit);
        window.removeEventListener("orientationchange", refit);
        window.removeEventListener("qr:viewport:change", refit);
      },
      { once: true }
    );

    const btnRestart = document.getElementById("btnRestart");
    if (btnRestart) btnRestart.addEventListener("click", onRestart);
  }

  window.QRUI = {
    startModal,
    selectHeroModal,
    questionModal,
    formModal,
    endingModal,
    close,
  };
})();
