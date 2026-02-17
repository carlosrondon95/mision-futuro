<?php
if (!defined('ABSPATH'))
  exit;

class QR_Plugin
{
  const NONCE = 'qr_nonce_pixel_path';

  public function register()
  {
    (new QR_Mailer())->register();
  }
}
