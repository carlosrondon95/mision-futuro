<?php
if (!defined('ABSPATH')) {
  exit;
}

class QR_Assets
{
  public function register()
  {
    add_action('wp_enqueue_scripts', [$this, 'enqueue']);
  }

  public function enqueue()
  {
    /**
     * NOTA DE DESARROLLO:
     * Al principio filtraba por has_shortcode() sobre post_content, pero me di cuenta
     * de que builders como Elementor no guardan el shortcode directamente ahí.
     * Por eso decidí cargar mis assets en cualquier página singular (is_singular()), 
     * garantizando que el juego funcione de forma transparente en cualquier theme.
     */
    if (!is_singular()) {
      return;
    }

    // Función auxiliar que creé para el cache busting de archivos estáticos
    $ver = function ($relPath) {
      $path = QR_PLUGIN_DIR . ltrim($relPath, '/');
      return file_exists($path) ? (string) filemtime($path) : (string) time();
    };

    // CSS
    wp_enqueue_style(
      'qr-app',
      QR_PLUGIN_URL . 'assets/css/app.css',
      [],
      $ver('assets/css/app.css')
    );

    // JS vendor
    wp_enqueue_script(
      'qr-microloop',
      QR_PLUGIN_URL . 'assets/js/vendor/microloop.js',
      [],
      $ver('assets/js/vendor/microloop.js'),
      true
    );

    // Data (questions + scoring)
    wp_enqueue_script(
      'qr-data',
      QR_PLUGIN_URL . 'assets/js/data.js',
      [],
      $ver('assets/js/data.js'),
      true
    );
    wp_enqueue_script(
      'qr-ui',
      QR_PLUGIN_URL . 'assets/js/ui.js',
      [],
      $ver('assets/js/ui.js'),
      true
    );

    // Responsive + Virtual Pad + Fullscreen
    wp_enqueue_script(
      'qr-viewport',
      QR_PLUGIN_URL . 'assets/js/viewport.js',
      [],
      $ver('assets/js/viewport.js'),
      true
    );
    wp_enqueue_script(
      'qr-virtualpad',
      QR_PLUGIN_URL . 'assets/js/virtualpad.js',
      [],
      $ver('assets/js/virtualpad.js'),
      true
    );
    wp_enqueue_script(
      'qr-fs',
      QR_PLUGIN_URL . 'assets/js/fs.js',
      [],
      $ver('assets/js/fs.js'),
      true
    );

    // AUDIO
    wp_enqueue_script(
      'qr-audio',
      QR_PLUGIN_URL . 'assets/js/audio.js',
      [],
      $ver('assets/js/audio.js'),
      true
    );

    // Game + Bootstrap
    wp_enqueue_script(
      'qr-game',
      QR_PLUGIN_URL . 'assets/js/game.js',
      ['qr-microloop', 'qr-data', 'qr-ui', 'qr-viewport', 'qr-virtualpad'],
      $ver('assets/js/game.js'),
      true
    );
    wp_enqueue_script(
      'qr-bootstrap',
      QR_PLUGIN_URL . 'assets/js/bootstrap.js',
      ['qr-game', 'qr-fs', 'qr-audio'],
      $ver('assets/js/bootstrap.js'),
      true
    );

    // Inyecto mis variables de entorno y paths en window.qrAjax para usarlos desde JS
    wp_localize_script('qr-bootstrap', 'qrAjax', [
      'ajax_url' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce(QR_Ajax::NONCE),
      'brand' => ['primary' => '#d09e55', 'font' => 'Poppins'],
      'base_url' => QR_PLUGIN_URL,
    ]);
  }
}
