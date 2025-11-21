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
     * ANTES:
     *  - Filtrábamos por has_shortcode() sobre post_content.
     *  - Elementor no guarda el shortcode en post_content sino en metadatos/plantillas.
     *  - Resultado: no cargaban JS/CSS y el juego no arrancaba.
     *
     * AHORA:
     *  - Cargamos assets en cualquier página singular.
     *  - Esto hace que funcione tanto con Gutenberg como con Elementor.
     */
    if (!is_singular()) {
      return;
    }

    // Versión por fichero (cache bust)
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

    // UI/Data
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

    // Datos para AJAX/branding + base_url para rutas
    wp_localize_script('qr-bootstrap', 'qrAjax', [
      'ajax_url' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce(QR_Ajax::NONCE),
      'brand' => ['primary' => '#d09e55', 'font' => 'Poppins'],
      'base_url' => QR_PLUGIN_URL,
    ]);
  }
}
