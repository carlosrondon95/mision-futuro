MISIÓN FUTURO

MISIÓN FUTURO es un pequeño videojuego web que desarrollé como proyecto para integrarlo dentro de WordPress. La idea es sencilla: convertir un cuestionario típico en una experiencia más entretenida. En lugar de rellenar un formulario “a pelo”, el usuario recorre un escenario tipo runner, esquiva obstáculos y va respondiendo preguntas a medida que avanza.

Al final del recorrido aparece un formulario para completar sus datos. Con esa información, el juego determina una o dos academias recomendadas según las respuestas y las registra para el equipo.

🎮 ¿Qué hace exactamente el juego?

El jugador avanza por un mundo en 2D con estética retro.

Cada puerta del escenario corresponde a una pregunta.

Las respuestas influyen en la recomendación final.

Al terminar, el usuario rellena su nombre, mail y teléfono.

Finalmente se muestra una pequeña ceremonia con el resultado.

Todo ocurre sin recargar la página y sin pantallas intermedias raras. La experiencia es directa y muy fluida.

📊 Gestión de los leads

Cuando alguien completa MISIÓN FUTURO y envía sus datos, el plugin:

no envía correos,

no crea posts,

no toca la base de datos.

Simplemente guarda cada lead en un archivo CSV ubicado en:

/wp-content/uploads/mision-futuro/mision-futuro-leads.csv


Cada línea incluye:

Nombre

Teléfono

Email

Academia recomendada (1 y 2)

Fecha

Este archivo se puede abrir directamente con Excel o Google Sheets y mantener internamente sin depender de terceros.

⚙️ Integración en WordPress

MISIÓN FUTURO funciona como un plugin normal:

Se sube como ZIP desde el panel de WordPress.

Se activa.

Se incrusta en una página mediante shortcode.

No tiene dependencias externas, así que su despliegue es rápido.

🛠️ ¿Con qué está hecho?

El juego combina JavaScript (canvas 2D) con un backend muy ligero en PHP. El motor de juego es propio y está pensado para funcionar igual en móvil que en escritorio. El resto del plugin se centra únicamente en mostrar el juego y almacenar los leads.

🎯 Por qué existe este proyecto

El objetivo era claro: hacer más atractivo un proceso que normalmente es aburrido.
A través de una mecánica simple y un estilo visual reconocible, MISIÓN FUTURO convierte un formulario en algo más memorable y mucho menos intrusivo.
