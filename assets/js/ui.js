// assets/js/ui.js
(function () {
  // ⬅️ El modal cuelga de #qr-stage para quedar dentro de la ventana de juego
  let root = document.querySelector("#qr-stage #qr-modal-root");
  if (!root) {
    const stage = document.getElementById("qr-stage");
    root = document.createElement("div");
    root.id = "qr-modal-root";
    if (stage) stage.appendChild(root);
  }

  function emit(name) {
    window.dispatchEvent(new CustomEvent(name));
  }
  function close() {
    const m = document.querySelector(".qr-modal");
    if (m) m.remove();
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

  /* ✅ Bloqueo de scroll con ESPACIO dentro de la app (captura global y no molesta a inputs) */
  (function installSpaceScrollGuard() {
    const app = document.getElementById("qr-app");
    const handler = (e) => {
      const code = e.code || e.key;
      const isSpace = code === "Space" || code === "Spacebar" || e.key === " ";
      if (!isSpace) return;
      if (isTypingTarget(e.target)) return; // permitir escribir en inputs
      const insideApp = !!(app && app.contains(e.target));
      const modalOpen = !!document.querySelector("#qr-stage .qr-modal");
      if (insideApp || modalOpen) {
        e.preventDefault(); // evita el scroll de la página
      }
    };
    document.addEventListener("keydown", handler, {
      passive: false,
      capture: true,
    });
  })();

  /* ===== Menú de inicio ===== */
  function startModal(onPlay) {
    if (document.querySelector(".qr-modal")) return;

    const mobile = isMobile();

    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-card--start";

    const desktopList = `
      <ul class="qr-startlist">
        <li>Mueve al personaje con ← → / A D.</li>
        <li>Salta y doble salto con ↑ / W / Espacio.</li>
        <li>Acércate a la Puerta 1 para empezar.</li>
        <li>Completa las 8 para tu recomendación.</li>
      </ul>`;

    const mobileList = `
      <ul class="qr-startlist">
        <li>Al pulsar Jugar se abrirá en horizontal.</li>
        <li>Usa los botones táctiles para moverte/saltar.</li>
        <li>Ve hasta la Puerta 1 para empezar.</li>
        <li>Completa las 8 y verás tu resultado.</li>
      </ul>`;

    card.innerHTML = `
      <h3 class="qr-title">🎮 Misión Futuro</h3>
      <p class="qr-lead"><strong>Tu futuro empieza hoy.</strong></p>
      ${mobile ? mobileList : desktopList}
      <div class="qr-start-actions">
        <button class="qr-btn" id="qrStartBtn">Jugar</button>
      </div>
    `;

    modal.appendChild(card);
    root.appendChild(modal);

    const cleanup = () => {
      window.removeEventListener("keydown", keyHandler);
      close();
    };
    const start = () => {
      // La música se inicia desde bootstrap tras el clic (QRAudio.init + play)
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

    document.getElementById("qrStartBtn").addEventListener("click", start);
    window.addEventListener("keydown", keyHandler);
    emit("qr:modal:open");
  }

  /* ===== Selección de personaje ===== */
  function selectHeroModal(maleUrl, femaleUrl, onSelect) {
    if (document.querySelector(".qr-modal")) return;

    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-card--select";

    card.innerHTML = `
      <h3 class="qr-title">Elige tu personaje</h3>
      <div class="qr-select" role="listbox" aria-label="Elige personaje">
        <button class="qr-select__item" id="selMale"  aria-label="Hombre">
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

    // 🎵 Sonido al abrir la selección de personaje
    if (window.QRAudio) window.QRAudio.playDoor();

    const pick = (g) => {
      // 🎵 Sonido al seleccionar personaje
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

    // Accesibilidad teclado
    const items = card.querySelectorAll(".qr-select__item");
    let idx = 0;
    items[idx].focus();
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

    emit("qr:modal:open");
  }

  /* ===== Modal de pregunta ===== */
  function questionModal(qObj, onAnswer) {
    if (document.querySelector(".qr-modal")) return;
    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card";

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
        // SFX respuesta
        if (window.QRAudio) window.QRAudio.playAnswer();
        close();
        onAnswer && onAnswer(op);
      });
      opts.appendChild(b);
    });

    modal.appendChild(card);
    root.appendChild(modal);
    emit("qr:modal:open");
  }

  /* ===== Modal de formulario (compacto, centrado, sin saltos) ===== */
  function formModal(onSubmit) {
    if (document.querySelector(".qr-modal")) return;

    // === Inyecta estilos compactos específicos del formulario (incluye estilo del link azul/subrayado) ===
    if (!document.getElementById("qr-form-compact-css")) {
      const css = `
      .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,1px,1px);white-space:nowrap;border:0}
      .qr-modal{align-items:center!important;justify-content:center!important;padding:8px}
      .qr-form--compact{
        width:min(500px,92vw);
        padding:10px;
        border-width:4px!important; outline-width:4px!important;
        box-shadow:0 0 0 4px var(--gray-dark),0 6px 0 var(--black)!important;
        max-height:calc((var(--vh,1dvh)*100) - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        overflow:visible;
      }
      .qr-form--compact .qr-title{font-size:14px;margin:4px 0 6px}
      .qr-form--compact .qr-row{margin:6px 0;gap:3px}
      .qr-form--compact .qr-input{padding:8px 10px;font-size:13px}
      .qr-form--compact .qr-error{
        color:#d32f2f;font-size:11px;line-height:1.2;height:14px;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      .qr-form--compact .qr-btn{padding:9px 12px;font-size:13px}
      .qr-form--compact .qr-consent{font-size:12px}
      .qr-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      @media (max-width:360px){ .qr-grid-2{grid-template-columns:1fr;gap:6px} }
      .qr-form-actions{position:sticky;bottom:0;background:#fff;padding-top:8px;padding-bottom:calc(6px + env(safe-area-inset-bottom))}
      #qr-app.qr-app--fs .qr-form--compact{width:min(480px,92vw)}
      .qr-link{color:#1976d2;text-decoration:underline;font-weight:600}
      .qr-link:focus,.qr-link:hover{text-decoration:underline}
      `;
      const st = document.createElement("style");
      st.id = "qr-form-compact-css";
      st.textContent = css;
      document.head.appendChild(st);
    }

    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card qr-card--form qr-form--compact";

    card.innerHTML = `
      <form id="qrLeadForm" novalidate>
        <h3 class="qr-title">📩 Tus datos</h3>

        <div class="qr-grid-2">
          <div class="qr-row">
            <label for="fName" class="sr-only">Nombre</label>
            <input class="qr-input" id="fName" type="text" placeholder="Nombre" maxlength="99" autocomplete="name">
            <div class="qr-error" id="errName"></div>
          </div>
          <div class="qr-row">
            <label for="fPhone" class="sr-only">Teléfono</label>
            <input class="qr-input" id="fPhone" type="tel" placeholder="Teléfono" inputmode="numeric" autocomplete="tel" pattern="\\d*">
            <div class="qr-error" id="errPhone"></div>
          </div>
        </div>

        <div class="qr-row">
          <label for="fEmail" class="sr-only">Email</label>
          <input class="qr-input" id="fEmail" type="email" placeholder="Email" autocomplete="email" inputmode="email">
          <div class="qr-error" id="errEmail"></div>
        </div>

        <div class="qr-row qr-consent">
          <label for="fConsent">
            <input id="fConsent" type="checkbox">
            Acepto la <a id="policyLink" class="qr-link" href="https://versuselearning.com/politica-de-privacidad/" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          </label>
          <div class="qr-error" id="errConsent"></div>
        </div>

        <div class="qr-form-actions">
          <button class="qr-btn" id="btnSend" type="submit">Enviar</button>
        </div>
      </form>
    `;

    modal.appendChild(card);
    const rootNode =
      document.querySelector("#qr-stage #qr-modal-root") ||
      document.getElementById("qr-modal-root");
    rootNode.appendChild(modal);

    // Evitar que el click en el enlace marque/desmarque el checkbox
    const policyLink = card.querySelector("#policyLink");
    if (policyLink) {
      policyLink.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // === Validación (igual que antes) ===
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
      requestAnimationFrame(fitCardHeight);
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
          return setErr(phoneI, errPhone, "9 dígitos si es español."), false;
      } else {
        if (!/^\+\d{8,15}$/.test(v))
          return (
            setErr(phoneI, errPhone, "Formato internacional +XX..."), false
          );
      }
      setErr(phoneI, errPhone, "");
      return true;
    }
    function validateEmail() {
      const v = (mailI.value || "").trim();
      if (!v) return setErr(mailI, errEmail, "El email es obligatorio."), false;
      if (!emailRe.test(v))
        return setErr(mailI, errEmail, "Email no válido."), false;
      setErr(mailI, errEmail, "");
      return true;
    }
    function validateConsent() {
      if (!consI.checked)
        return setErr(consI, errCons, "Debes aceptar la Política."), false;
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

    const refit = () => requestAnimationFrame(fitCardHeight);
    nameI.addEventListener("input", () => {
      validateName();
      refit();
    });
    mailI.addEventListener("input", () => {
      validateEmail();
      refit();
    });
    phoneI.addEventListener("input", () => {
      sanitizePhone();
      validatePhone();
      refit();
    });
    consI.addEventListener("change", () => {
      validateConsent();
      refit();
    });

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

    function getStageHeight() {
      const stage = document.getElementById("qr-stage");
      return stage ? stage.clientHeight : window.innerHeight;
    }
    function fitCardHeight() {
      const card = document.querySelector(".qr-form--compact");
      if (!card) return;
      const avail = getStageHeight() - 16;
      card.style.transform = "";
      card.style.transformOrigin = "center center";
      card.style.willChange = "transform";
      const rect = card.getBoundingClientRect();
      const scale = Math.min(1, Math.max(0.82, avail / rect.height));
      if (scale < 1) {
        card.style.transform = `scale(${scale})`;
      }
    }

    const onResize = () => fitCardHeight();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("qr:viewport:change", onResize);
    const cleanup = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("qr:viewport:change", onResize);
    };
    window.addEventListener("qr:modal:close", cleanup, { once: true });

    requestAnimationFrame(fitCardHeight);

    emit("qr:modal:open");
  }

  /* ===== Pantalla final ===== */
  function endingModal(result, onRestart) {
    const { top1, top2, bullets } = result;
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
        <button class="qr-btn" id="btnRestart">Reiniciar</button>
      </div>
    `;

    modal.appendChild(card);
    root.appendChild(modal);
    document.getElementById("btnRestart").addEventListener("click", onRestart);
    emit("qr:modal:open");
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
