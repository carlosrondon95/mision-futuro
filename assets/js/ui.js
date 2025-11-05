(function () {
  const root = document.getElementById("qr-modal-root");

  function close() {
    const m = document.querySelector(".qr-modal");
    if (m) m.remove();
  }

  /* ===== Menú de inicio ===== */
  function startModal(onPlay) {
    if (document.querySelector(".qr-modal")) return;
    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card";
    card.innerHTML = `
      <h3 class="qr-title">🎮 Quiz Versus</h3>
      <p class="qr-lead">
        <strong>Tu futuro empieza hoy: prepárate y alcanza tu meta.</strong>
      </p>
      <ul class="qr-startlist">
        <li>Mueve el personaje con <span class="qr-startkbd">←</span> <span class="qr-startkbd">→</span> o <span class="qr-startkbd">A</span> <span class="qr-startkbd">D</span>.</li>
        <li><strong>Salta y doble salto</strong> con <span class="qr-startkbd">↑</span> / <span class="qr-startkbd">W</span> / <span class="qr-startkbd">Espacio</span>.</li>
        <li>Desplázate hasta la <strong>puerta 1</strong> para comenzar.</li>
        <li>Responde las <strong>8 preguntas</strong> y descubre tu recomendación.</li>
      </ul>
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
      cleanup();
      onPlay && onPlay();
    };
    const keyHandler = (e) => {
      const k = e.key.toLowerCase();
      if (k === "enter" || k === " ") {
        e.preventDefault();
        start();
      }
    };

    document.getElementById("qrStartBtn").addEventListener("click", start);
    window.addEventListener("keydown", keyHandler);
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
        close();
        onAnswer && onAnswer(op);
      });
      opts.appendChild(b);
    });

    modal.appendChild(card);
    root.appendChild(modal);
  }

  /* ===== Modal de formulario ===== */
  function formModal(onSubmit) {
    if (document.querySelector(".qr-modal")) return;
    const modal = document.createElement("div");
    modal.className = "qr-modal";
    const card = document.createElement("div");
    card.className = "qr-card";

    card.innerHTML = `
      <div class="qr-q">Déjanos tus datos y te enviaremos tu resultado</div>
      <div class="qr-row"><label>Nombre</label><input class="qr-input" id="fName" type="text" placeholder="Tu nombre"></div>
      <div class="qr-row"><label>Email</label><input class="qr-input" id="fEmail" type="email" placeholder="tu@email">
      </div>
      <div class="qr-row"><label>Teléfono</label><input class="qr-input" id="fPhone" type="tel" placeholder="+34 600 000 000"></div>
      <div class="qr-row qr-consent"><label><input id="fConsent" type="checkbox"> Acepto la Política de Privacidad</label></div>
      <button class="qr-btn" id="btnSend">Enviar</button>
    `;

    card.querySelector("#btnSend").addEventListener("click", () => {
      const name = val("#fName");
      const email = val("#fEmail");
      const phone = val("#fPhone");
      const consent = checked("#fConsent") ? "1" : "0";
      if (!name || !email) return alert("Nombre y email son obligatorios");
      if (consent !== "1") return alert("Debes aceptar la política");
      close();
      onSubmit && onSubmit({ name, email, phone, consent });
    });

    modal.appendChild(card);
    root.appendChild(modal);
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
  }

  // Helpers
  function val(sel) {
    const n = document.querySelector(sel);
    return n ? n.value.trim() : "";
  }
  function checked(sel) {
    const n = document.querySelector(sel);
    return !!(n && n.checked);
  }

  window.QRUI = { startModal, questionModal, formModal, endingModal, close };
})();
