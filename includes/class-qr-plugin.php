<?php
if (!defined('ABSPATH'))
  exit;

class QR_Plugin
{
  const NONCE = 'qr_nonce_pixel_path';

  public function register()
  {
    // Antiguamente aquí registraba submódulos.
    // Usé esta clase como el núcleo central para almacenar constantes globales del proyecto.
  }
}
