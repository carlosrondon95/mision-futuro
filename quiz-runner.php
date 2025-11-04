<?php
/**
 * Plugin Name: Quiz Runner – Pixel Path
 * Description: Minijuego pixel-art horizontal con 8 estaciones (preguntas), scoring y envío por email (sin BD). Shortcode: [quiz_runner]
 * Version: 2.0.0
 * Author: Tu Empresa
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('QR_PLUGIN_FILE', __FILE__);
define('QR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('QR_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once QR_PLUGIN_DIR . 'includes/class-qr-plugin.php';
require_once QR_PLUGIN_DIR . 'includes/class-qr-assets.php';
require_once QR_PLUGIN_DIR . 'includes/class-qr-ajax.php';
require_once QR_PLUGIN_DIR . 'includes/class-qr-shortcode.php';

add_action('plugins_loaded', function () {
  // Inicializa componentes
  (new QR_Assets())->register();
  (new QR_Ajax())->register();
  (new QR_Shortcode())->register();
  (new QR_Plugin())->register();
});
