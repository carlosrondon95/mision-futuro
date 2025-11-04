<?php if (!defined('ABSPATH')) exit; ?>
<div id="qr-app">
  <div class="qr-hud">
    <span>Estación: <span class="qr-badge">1 / 8</span></span>
    <span>Usa ← → o A D para moverte</span>
  </div>

  <div id="qr-game">
    <canvas id="qr-canvas" width="960" height="320"></canvas>
  </div>

  <!-- Honeypot invisible para bots -->
  <input type="text" class="qr-hp" name="website" tabindex="-1" aria-hidden="true" />
</div>

<!-- Modal root -->
<div id="qr-modal-root"></div>
