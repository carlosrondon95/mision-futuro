<?php
if (!defined('ABSPATH')) exit;

class QR_Shortcode {
  public function register() {
    add_shortcode('quiz_runner', [$this, 'render']);
  }
  public function render($atts = []) {
    ob_start();
    include QR_PLUGIN_DIR . 'templates/app.php';
    return ob_get_clean();
  }
}
