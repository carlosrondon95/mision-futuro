<?php
if (!defined('ABSPATH'))
  exit;

class QR_Plugin
{
  const NONCE = 'qr_nonce_pixel_path';

  public function register()
  {
    // SMTP solo si defines constantes en wp-config.php
    add_action('phpmailer_init', [$this, 'setup_smtp']);

    // Log de errores de correo (aparece en debug.log si WP_DEBUG_LOG = true)
    add_action('wp_mail_failed', [$this, 'log_mail_error'], 10, 1);
  }

  /**
   * Configura PHPMailer para SMTP si hay constantes definidas.
   * No afecta a producción si no defines nada.
   *
   * Puedes definir en wp-config.php:
   *  define('QR_SMTP_HOST', 'sandbox.smtp.mailtrap.io'); // o 'smtp.gmail.com' / '127.0.0.1'
   *  define('QR_SMTP_PORT', 2525);                       // 2525 (Mailtrap), 1025 (MailHog), 587 (TLS), 465 (SMTPS)
   *  define('QR_SMTP_USER', 'USUARIO');                  // opcional (vacío si MailHog)
   *  define('QR_SMTP_PASS', 'PASSWORD');                 // opcional
   *  define('QR_SMTP_SECURE', 'tls');                    // 'tls' | 'ssl' | 'none'
   *  define('QR_SMTP_FROM', 'noreply@tu-dominio.test');  // recomendado
   *  define('QR_SMTP_FROM_NAME', 'Quiz Versus');         // opcional
   */
  public function setup_smtp($phpmailer)
  {
    if (!defined('QR_SMTP_HOST') || !QR_SMTP_HOST) {
      return; // sin constantes => no tocamos nada
    }

    // SMTP ON
    $phpmailer->isSMTP();
    $phpmailer->Host = QR_SMTP_HOST;
    $phpmailer->Port = defined('QR_SMTP_PORT') ? (int) QR_SMTP_PORT : 587;

    // Auth opcional (MailHog/Mailpit no la usan)
    $hasUser = defined('QR_SMTP_USER') && QR_SMTP_USER;
    $phpmailer->SMTPAuth = $hasUser;
    if ($hasUser) {
      $phpmailer->Username = QR_SMTP_USER;
      $phpmailer->Password = defined('QR_SMTP_PASS') ? QR_SMTP_PASS : '';
    }

    // Capa de seguridad
    $secure = defined('QR_SMTP_SECURE') ? strtolower(QR_SMTP_SECURE) : 'tls';
    if ($secure === 'ssl' || $secure === 'tls') {
      $phpmailer->SMTPSecure = $secure;
      $phpmailer->SMTPAutoTLS = ($secure === 'tls');
    } else {
      // 'none'
      $phpmailer->SMTPSecure = '';
      $phpmailer->SMTPAutoTLS = false;
    }

    // From recomendado (dominio local o el que quieras)
    if (defined('QR_SMTP_FROM') && QR_SMTP_FROM) {
      $phpmailer->setFrom(QR_SMTP_FROM, defined('QR_SMTP_FROM_NAME') ? QR_SMTP_FROM_NAME : 'Quiz Versus', false);
    } else {
      // fallback a dominio del sitio
      $host = parse_url(home_url(), PHP_URL_HOST);
      if (!$host) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
      }
      $phpmailer->setFrom('noreply@' . $host, 'Quiz Versus', false);
    }

    // Charset
    $phpmailer->CharSet = 'UTF-8';
  }

  public function log_mail_error($wp_error)
  {
    if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
      error_log('[Quiz Runner] wp_mail_failed: ' . $wp_error->get_error_message());
    }
  }
}
