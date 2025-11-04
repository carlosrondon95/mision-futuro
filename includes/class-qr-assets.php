<?php
if (!defined('ABSPATH')) exit;

class QR_Assets {
  public function register() {
    add_action('wp_enqueue_scripts', [$this, 'enqueue']);
  }

  public function enqueue() {
    // Solo carga si el shortcode está presente (optimización ligera)
    if (!is_singular() || !has_shortcode(get_post_field('post_content', get_the_ID()), 'quiz_runner')) {
      return;
    }

    $ver = '2.0.0';

    // CSS
    wp_enqueue_style('qr-app', QR_PLUGIN_URL . 'assets/css/app.css', [], $ver);

    // JS vendor (micro loop + input) — sin dependencias externas
    wp_enqueue_script('qr-microloop', QR_PLUGIN_URL . 'assets/js/vendor/microloop.js', [], $ver, true);

    // Núcleo del juego, modular
    wp_enqueue_script('qr-data',      QR_PLUGIN_URL . 'assets/js/data.js',      [], $ver, true);
    wp_enqueue_script('qr-ui',        QR_PLUGIN_URL . 'assets/js/ui.js',        [], $ver, true);
    wp_enqueue_script('qr-game',      QR_PLUGIN_URL . 'assets/js/game.js',      ['qr-microloop','qr-data','qr-ui'], $ver, true);
    wp_enqueue_script('qr-bootstrap', QR_PLUGIN_URL . 'assets/js/bootstrap.js', ['qr-game'], $ver, true);

    // Datos para AJAX/branding
    wp_localize_script('qr-bootstrap', 'qrAjax', [
      'ajax_url' => admin_url('admin-ajax.php'),
      'nonce'    => wp_create_nonce(QR_Ajax::NONCE),
      'brand'    => [ 'primary' => '#00BCD4', 'font' => 'Poppins' ],
    ]);
  }
}
