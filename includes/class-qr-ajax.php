<?php
if (!defined('ABSPATH')) exit;

class QR_Ajax {
  const NONCE = QR_Plugin::NONCE;

  public function register() {
    add_action('wp_ajax_qr_send_lead', [$this, 'handle']);
    add_action('wp_ajax_nopriv_qr_send_lead', [$this, 'handle']);
  }

  public function handle() {
    check_ajax_referer(self::NONCE, 'nonce');

    // Honeypot
    $hp = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
    if (!empty($hp)) wp_send_json_error(['message' => 'Spam detectado.'], 400);

    $name   = isset($_POST['name'])  ? sanitize_text_field(wp_unslash($_POST['name']))  : '';
    $email  = isset($_POST['email']) ? sanitize_email(wp_unslash($_POST['email']))       : '';
    $phone  = isset($_POST['phone']) ? sanitize_text_field(wp_unslash($_POST['phone']))  : '';
    $consent= (isset($_POST['consent']) && $_POST['consent']==='1') ? 'Sí' : 'No';
    $answers_json = isset($_POST['answers']) ? wp_unslash($_POST['answers']) : '[]';
    $answers = json_decode($answers_json, true);
    if (!is_array($answers)) $answers = [];

    if (empty($name) || empty($email) || !is_email($email)) {
      wp_send_json_error(['message' => 'Revisa nombre y email.'], 422);
    }
    if ($consent !== 'Sí') {
      wp_send_json_error(['message' => 'Debes aceptar la política de privacidad.'], 422);
    }

    // Arma email
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
      $q = isset($it['q']) ? sanitize_text_field($it['q']) : 'Pregunta '.($i+1);
      $a = isset($it['value']) ? sanitize_text_field($it['value']) : '';
      $lines[] = " - {$q}: {$a}";
    }
    $body = implode("\n", $lines);

    // ⚠️ CAMBIAR CORREO
    $to      = 'crondon@grupoprefor.es';
    $subject = 'Nuevo lead - Pixel Path';
    $headers = ['Content-Type: text/plain; charset=UTF-8'];

    $sent = wp_mail($to, $subject, $body, $headers);
    if ($sent) wp_send_json_success(['message' => '¡Gracias! Te contactaremos pronto.']);
    wp_send_json_error(['message' => 'No se pudo enviar el correo.'], 500);
  }
}
