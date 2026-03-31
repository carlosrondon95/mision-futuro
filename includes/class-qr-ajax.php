<?php
if (!defined('ABSPATH'))
  exit;

class QR_Ajax
{
  const NONCE = QR_Plugin::NONCE;

  public function register()
  {
    add_action('wp_ajax_qr_send_lead', [$this, 'handle']);
    add_action('wp_ajax_nopriv_qr_send_lead', [$this, 'handle']);
  }

  public function handle()
  {
    // Valido el nonce de seguridad que envié desde el front
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], self::NONCE)) {
      wp_send_json_error(['message' => 'Sesión caducada. Recarga la página.'], 403);
    }

    // Mi honeypot oculto (si viene relleno, asumo que es un bot y lo rechazo)
    $hp = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
    if (!empty($hp)) {
      wp_send_json_error(['message' => 'Spam detectado.'], 400);
    }

    // Recojo y sanitizo estrictamente los datos del formulario
    $name = isset($_POST['name']) ? sanitize_text_field(wp_unslash($_POST['name'])) : '';
    $email = isset($_POST['email']) ? sanitize_email(wp_unslash($_POST['email'])) : '';
    $phone = isset($_POST['phone']) ? sanitize_text_field(wp_unslash($_POST['phone'])) : '';
    $consent = (isset($_POST['consent']) && $_POST['consent'] === '1') ? 'Sí' : 'No';

    // Guardo el JSON íntegro de respuestas por si necesito sacar analítica en el futuro
    $answers_json = isset($_POST['answers']) ? wp_unslash($_POST['answers']) : '[]';
    $answers = json_decode($answers_json, true);
    if (!is_array($answers)) {
      $answers = [];
    }

    // Recojo los cálculos del ganador que ya hizo mi motor JS
    $academy1 = isset($_POST['academy1']) ? sanitize_text_field(wp_unslash($_POST['academy1'])) : '';
    $academy2 = isset($_POST['academy2']) ? sanitize_text_field(wp_unslash($_POST['academy2'])) : '';

    // Mis validaciones de negocio en backend
    if (empty($name) || empty($email) || !is_email($email)) {
      wp_send_json_error(['message' => 'Revisa nombre y email.'], 422);
    }
    if ($consent !== 'Sí') {
      wp_send_json_error(['message' => 'Debes aceptar la política de privacidad.'], 422);
    }

    // === Lógica que desarrollé para generar el backup en CSV (Excel) ===
    $upload_dir = wp_upload_dir();
    if (!empty($upload_dir['error'])) {
      wp_send_json_error(['message' => 'No se pudo acceder al directorio de subidas.'], 500);
    }

    $dir = trailingslashit($upload_dir['basedir']) . 'mision-futuro/';
    if (!wp_mkdir_p($dir)) {
      wp_send_json_error(['message' => 'No se pudo crear el directorio de leads.'], 500);
    }

    $file = $dir . 'mision-futuro-leads.csv';
    $is_new = !file_exists($file);

    $fh = @fopen($file, 'a');
    if (!$fh) {
      wp_send_json_error(['message' => 'No se pudo escribir el fichero de leads.'], 500);
    }

    if ($is_new) {
      fwrite($fh, "\xEF\xBB\xBF");

      $header = ['NOMBRE', 'TELEFONO', 'MAIL', 'ACADEMIA 1', 'ACADEMIA 2', 'FECHA'];
      fputcsv($fh, $header, ';');
    }

    // Hallo la fecha actual del registro usando el reloj de WordPress
    $fecha = current_time('Y-m-d');

    $row = [$name, $phone, $email, $academy1, $academy2, $fecha];
    fputcsv($fh, $row, ';');

    fclose($fh);

    wp_send_json_success(['message' => '¡Gracias! Tus datos se han registrado correctamente.']);
  }
}
