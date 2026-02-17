<?php
if (!defined('ABSPATH')) exit;

class QR_Mailer
{
  /**
   * Configura PHPMailer para SMTP si hay constantes definidas.
   *
   * @param PHPMailer $phpmailer Instancia de PHPMailer pasada por el hook 'phpmailer_init'.
   */
  public function setup_smtp($phpmailer)
  {
    if (!defined('QR_SMTP_HOST') || !QR_SMTP_HOST) {
      return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host = QR_SMTP_HOST;
    $phpmailer->Port = defined('QR_SMTP_PORT') ? (int) QR_SMTP_PORT : 587;

    $user = defined('QR_SMTP_USER') ? QR_SMTP_USER : '';
    $pass = defined('QR_SMTP_PASS') ? QR_SMTP_PASS : '';

    if ($user) {
      $phpmailer->SMTPAuth = true;
      $phpmailer->Username = $user;
      $phpmailer->Password = $pass;
    } else {
      $phpmailer->SMTPAuth = false;
    }

    $secure = defined('QR_SMTP_SECURE') ? strtolower(QR_SMTP_SECURE) : 'tls';
    if ($secure === 'ssl' || $secure === 'tls') {
      $phpmailer->SMTPSecure = $secure;
      $phpmailer->SMTPAutoTLS = ($secure === 'tls');
    } else {
      $phpmailer->SMTPSecure = '';
      $phpmailer->SMTPAutoTLS = false;
    }

    // Configuración del remitente 'From'
    if (defined('QR_SMTP_FROM') && QR_SMTP_FROM) {
      $fromName = defined('QR_SMTP_FROM_NAME') ? QR_SMTP_FROM_NAME : 'Misión Futuro';
      $phpmailer->setFrom(QR_SMTP_FROM, $fromName, false);
    } else {
      $host = parse_url(home_url(), PHP_URL_HOST);
      if (!$host) $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
      $phpmailer->setFrom('noreply@' . $host, 'Misión Futuro', false);
    }

    $phpmailer->CharSet = 'UTF-8';
  }

  /**
   * Envía un correo electrónico utilizando wp_mail().
   *
   * @param string $to Destinatario
   * @param string $subject Asunto
   * @param string $message Mensaje (HTML)
   * @return bool True si se envió correctamente, False en caso contrario.
   */
  public function send($to, $subject, $message)
  {
    $headers = [
      'Content-Type: text/html; charset=UTF-8'
    ];
    return wp_mail($to, $subject, $message, $headers);
  }

  /**
   * Registra los hooks necesarios para el mailer.
   */
  public function register()
  {
    add_action('phpmailer_init', [$this, 'setup_smtp']);
    add_action('wp_mail_failed', [$this, 'log_mail_error']);
  }

  public function log_mail_error($wp_error)
  {
    if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
      error_log('[Mision Futuro Mailer] Error: ' . $wp_error->get_error_message());
    }
  }
}
