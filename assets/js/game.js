(function () {
  const { createLoop, Keys } = window.MicroLoop;
  const { QUESTIONS, freshScore, applyScoring, winner, bullets } =
    window.QRData;
  const { questionModal, formModal, endingModal } = window.QRUI;

  const BRAND = {
    dark: "#9a794a",
    light: "#d09e55",
    gDark: "#706f6f",
    gLite: "#9d9d9c",
    black: "#000000",
  };

  class QRGame {
    constructor(canvas, hudBadge, assets, pad) {
      this.cv = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      this.hudBadge = hudBadge;
      this.assets = assets || {};
      this.pad = pad || { left: false, right: false, onJump: () => {} };

      this.W = this.cv.width;
      this.H = this.cv.height;
      this.groundY = this.H - 64;
      this.stations = 8;
      this.spacing = 360;
      this.startX = 60;
      this.portalX = Array.from(
        { length: this.stations },
        (_, i) => this.startX + i * this.spacing
      );

      this.step = 0; // 0..7
      this.answers = [];
      this.score = freshScore();

      this.gravity = 1800;
      this.jumpSpeed = 600;
      this.maxJumps = 2;
      this.jumpCount = 0;
      this.coyoteTime = 0.08;
      this.coyoteTimer = 0;
      this.jumpBuffer = 0.12;
      this.jumpBufferT = 0;

      this.hero = {
        x: this.startX - 140,
        y: this.groundY - 8,
        w: 42,
        h: 42,
        dx: 0,
        vy: 0,
      };
      this.camX = 0;

      this.loop = createLoop(this.update.bind(this), this.render.bind(this));

      this.onKeyDown = (e) => {
        const code = e.code || e.key;
        const isScrollKey =
          code === "Space" ||
          code === "ArrowUp" ||
          code === "ArrowDown" ||
          e.key === " " ||
          code === "Spacebar";
        if (isScrollKey && !this.isTypingTarget(e.target)) e.preventDefault();
        if (code === "Space" || code === "ArrowUp" || code === "KeyW")
          this.queueJump();
      };
      window.addEventListener("keydown", this.onKeyDown, { passive: false });
    }

    isTypingTarget(el) {
      if (!el) return false;
      const t = (el.tagName || "").toLowerCase();
      return (
        t === "input" ||
        t === "textarea" ||
        t === "select" ||
        el.isContentEditable === true
      );
    }

    queueJump() {
      this.jumpBufferT = this.jumpBuffer;
    }

    start() {
      this.loop.start();
    }
    stop() {
      this.loop.stop();
    }

    onGround() {
      return this.hero.y >= this.groundY - 8 - 0.5;
    }

    tryJump() {
      const canGroundJump = this.onGround() || this.coyoteTimer > 0;
      const canAirJump = this.jumpCount < this.maxJumps;
      if (canGroundJump || canAirJump) {
        this.hero.vy = -this.jumpSpeed;
        if (this.onGround() || this.coyoteTimer > 0) this.jumpCount = 1;
        else this.jumpCount++;
        this.coyoteTimer = 0;
        return true;
      }
      return false;
    }

    update(dt) {
      const goRight =
        Keys.isDown("ArrowRight") || Keys.isDown("KeyD") || !!this.pad.right;
      const goLeft =
        Keys.isDown("ArrowLeft") || Keys.isDown("KeyA") || !!this.pad.left;

      if (goRight) this.hero.dx += 0.8;
      if (goLeft) this.hero.dx -= 0.7;

      this.hero.dx *= 0.9;
      const MAX_SPEED = 7;
      if (this.hero.dx > MAX_SPEED) this.hero.dx = MAX_SPEED;
      if (this.hero.dx < -MAX_SPEED) this.hero.dx = -MAX_SPEED;

      this.hero.x += this.hero.dx;

      if (this.jumpBufferT > 0) {
        if (this.tryJump()) this.jumpBufferT = 0;
      }

      this.hero.vy += this.gravity * dt;
      this.hero.y += this.hero.vy * dt;

      const groundFoot = this.groundY - 8;
      if (this.hero.y > groundFoot) {
        this.hero.y = groundFoot;
        this.hero.vy = 0;
        this.jumpCount = 0;
        this.coyoteTimer = this.coyoteTime;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      }

      this.jumpBufferT = Math.max(0, this.jumpBufferT - dt);

      const targetCam = this.hero.x - this.W / 2;
      this.camX += (targetCam - this.camX) * 0.07;

      const px = this.portalX[this.step];

      if (Math.abs(this.hero.x - px) < 36 && this.onGround()) {
        this.hero.dx = 0;
        this.stop();

        const qObj = QUESTIONS[this.step];

        if (qObj.id === "form") {
          // Estación 8: formulario (envío AJAX)
          formModal(async ({ name, email, phone, consent }) => {
            try {
              const payload = new URLSearchParams();
              payload.append("action", "qr_send_lead");
              payload.append("nonce", qrAjax.nonce);
              payload.append("name", name);
              payload.append("email", email);
              payload.append("phone", phone);
              payload.append("consent", consent);
              payload.append("answers", JSON.stringify(this.answers));
              // (honeypot opcional) payload.append("website","");

              const r = await fetch(qrAjax.ajax_url, {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                },
                body: payload.toString(),
                credentials: "same-origin",
              });

              let data = null;
              try {
                data = await r.json();
              } catch (e) {}

              // Fallo: no continuar el juego; muestra error y relanza el loop
              if (!r.ok || !data || data.success !== true) {
                const msg =
                  data && data.data && data.data.message
                    ? data.data.message
                    : "No se pudo enviar el correo.";
                alert(msg);
                this.start(); // volver al juego sin finalizar
                return;
              }

              // OK
              this.finish();
            } catch (e) {
              alert("Error de red. Inténtalo de nuevo.");
              this.start();
            }
          });
          return;
        }

        // Estaciones 1..7: pregunta normal
        questionModal(qObj, (opt) => {
          const choice = { id: qObj.id, q: qObj.q, value: opt };
          this.answers.push(choice);
          applyScoring(this.score, choice);

          this.step++;
          if (this.hudBadge)
            this.hudBadge.textContent = `${Math.min(this.step + 1, 8)} / 8`;

          this.start();
          this.hero.dx = 1.2;
        });
      }
    }

    finish() {
      const win = winner(this.score);
      endingModal(
        { top1: win.top1, top2: win.top2, bullets: bullets(win.top1) },
        () => location.reload()
      );
    }

    render() {
      const ctx = this.ctx,
        W = this.W,
        H = this.H,
        gy = this.groundY;

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#f3f3f3");
      g.addColorStop(1, "#ffffff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(-this.camX, 0);

      ctx.fillStyle = BRAND.gDark;
      ctx.fillRect(-5000, gy, 10000, 8);
      ctx.fillStyle = BRAND.gLite;
      for (let x = -5000; x < 5000; x += 32) ctx.fillRect(x, gy + 8, 16, 6);

      for (let i = 0; i < this.stations; i++) {
        const x = this.portalX[i];
        const yTop = gy - 72;

        if (this.assets.portal) {
          const pw = 56,
            ph = 80;
          ctx.drawImage(this.assets.portal, x - pw / 2, gy - ph, pw, ph);
        } else {
          ctx.fillStyle = i <= this.step ? BRAND.light : BRAND.gLite;
          ctx.fillRect(x - 24, yTop, 48, 72);
          ctx.lineWidth = 6;
          ctx.strokeStyle = BRAND.gDark;
          ctx.strokeRect(x - 24, yTop, 48, 72);
        }

        ctx.fillStyle = BRAND.gDark;
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, gy - 80);
      }

      const foot = gy - 8;
      const lift = Math.max(0, foot - this.hero.y);
      const maxLift = 120;
      const t = Math.min(1, lift / maxLift);
      const sx = 26 * (1 - 0.6 * t);
      const sy = 8 * (1 - 0.7 * t);
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(
        this.hero.x,
        gy + 6,
        Math.max(8, sx),
        Math.max(3, sy),
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = BRAND.black;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(this.hero.x, this.hero.y);
      if (this.assets.hero) {
        const w = this.hero.w,
          h = this.hero.h;
        ctx.drawImage(this.assets.hero, -w / 2, -h, w, h);
      } else {
        ctx.fillStyle = BRAND.light;
        ctx.fillRect(-this.hero.w / 2, -this.hero.h, this.hero.w, this.hero.h);
        ctx.lineWidth = 3;
        ctx.strokeStyle = BRAND.gDark;
        ctx.strokeRect(
          -this.hero.w / 2,
          -this.hero.h,
          this.hero.w,
          this.hero.h
        );
        ctx.fillStyle = "#fff";
        ctx.fillRect(-10, -this.hero.h + 6, 20, 12);
      }
      ctx.restore();

      ctx.restore();
    }
  }

  window.QRGame = QRGame;
})();
