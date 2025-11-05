<?php if (!defined('ABSPATH')) exit; ?>
<div id="qr-app">
  <div class="qr-hud">
    <span>Estación: <span class="qr-badge">1 / 8</span></span>
    <span>Usa ← → / A D y ↑ / W / Espacio para saltar (doble salto)</span>
  </div>

  <!-- Stage: calcula letterboxing/escala y centra el canvas -->
  <div id="qr-stage" class="qr-stage">
    <canvas id="qr-canvas" width="960" height="320"></canvas>
  </div>

  <!-- Honeypot invisible para bots -->
  <input type="text" class="qr-hp" name="website" tabindex="-1" aria-hidden="true" />
</div>

<!-- Controles táctiles -->
<div id="qr-pad" class="qr-pad" aria-hidden="true">
  <div class="qr-pad__left" role="group" aria-label="Movimiento">
    <button id="qr-pad-left"  class="qr-pad__btn" aria-label="Mover a la izquierda">←</button>
    <button id="qr-pad-right" class="qr-pad__btn" aria-label="Mover a la derecha">→</button>
  </div>
  <div class="qr-pad__right" role="group" aria-label="Acción">
    <button id="qr-pad-jump" class="qr-pad__btn qr-pad__btn--primary" aria-label="Saltar">⤒</button>
  </div>
</div>

<!-- Modal root -->
<div id="qr-modal-root"></div>
