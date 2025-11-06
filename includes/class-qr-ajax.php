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
    // Validación de nonce (evita envíos falsos)
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], self::NONCE)) {
      wp_send_json_error(['message' => 'Sesión caducada. Recarga la página.'], 403);
    }

    // Honeypot (si viene relleno => bot)
    $hp = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
    if (!empty($hp)) {
      wp_send_json_error(['message' => 'Spam detectado.'], 400);
    }

    // Datos del formulario
    $name = isset($_POST['name']) ? sanitize_text_field(wp_unslash($_POST['name'])) : '';
    $email = isset($_POST['email']) ? sanitize_email(wp_unslash($_POST['email'])) : '';
    $phone = isset($_POST['phone']) ? sanitize_text_field(wp_unslash($_POST['phone'])) : '';
    $consent = (isset($_POST['consent']) && $_POST['consent'] === '1') ? 'Sí' : 'No';
    $answers_json = isset($_POST['answers']) ? wp_unslash($_POST['answers']) : '[]';
    $answers = json_decode($answers_json, true);
    if (!is_array($answers))
      $answers = [];

    if (empty($name) || empty($email) || !is_email($email)) {
      wp_send_json_error(['message' => 'Revisa nombre y email.'], 422);
    }
    if ($consent !== 'Sí') {
      wp_send_json_error(['message' => 'Debes aceptar la política de privacidad.'], 422);
    }

    // Construir cuerpo del correo
    $lines = [];
    $lines[] = "Nuevo lead Pixel Path";
    $lines[] = "---------------------";
    $lines[] = "Nombre: {$name}";
    $lines[] = "Email: {$email}";
    $lines[] = "Teléfono: {$phone}";
    $lines[] = "Consentimiento: {$consent}";
    $lines[] = "";
    $lines[] = "Respuestas:";
    foreach ($answers as $i => $it) {
      $q = isset($it['q']) ? sanitize_text_field($it['q']) : 'Pregunta ' . ($i + 1);
      $a = isset($it['value']) ? sanitize_text_field($it['value']) : '';
      $lines[] = " - {$q}: {$a}";
    }
    $body = implode("\n", $lines);

    // Destino: tu correo; si no es válido, usar admin_email
    $to = 'crondon@grupoprefor.es';
    if (!is_email($to)) {
      $to = get_option('admin_email');
    }

    // Cabeceras correctas: From (dominio del sitio) + Reply-To (usuario)
    $host = parse_url(home_url(), PHP_URL_HOST);
    if (!$host) {
      $host = $_SERVER['HTTP_HOST'] ?? 'example.com';
    }
    $from = 'noreply@' . $host;

    $subject = 'Nuevo lead - Quiz Versus';
    $headers = [
      'Content-Type: text/plain; charset=UTF-8',
      'From: Quiz Versus <' . $from . '>',
      'Reply-To: ' . $name . ' <' . $email . '>',
    ];

    // Enviar
    $sent = wp_mail($to, $subject, $body, $headers);

    if ($sent) {
      wp_send_json_success(['message' => '¡Gracias! Te contactaremos pronto.']);
    } else {
      // Deja un rastro en debug.log si WP_DEBUG_LOG está activo
      if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        error_log('[Quiz Runner] wp_mail() falló. Destino: ' . $to . ' | From: ' . $from . ' | Reply-To: ' . $email);
      }
      wp_send_json_error(['message' => 'No se pudo enviar el correo. Revisa la configuración de email del sitio.'], 500);
    }
  }
}
