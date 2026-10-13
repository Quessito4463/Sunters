# Sunters ♡ — sitio pastel + apelaciones a Discord

## Requisitos
- Node.js 18 o superior instalado en tu PC.
- Un servidor de Discord donde tengas permiso para crear webhooks.
- Un servicio para alojar Node.js (por ejemplo, Render o Railway). GitHub Pages/Netlify estático por sí solo NO ejecuta `server.js`.

## Probarlo en tu PC
1. Descomprime el ZIP.
2. Instala Node.js desde https://nodejs.org/ (versión LTS).
3. Abre una terminal dentro de la carpeta `sunters_web`.
4. Ejecuta `npm install`.
5. Copia `.env.example` y renombra la copia a `.env`.
   - Windows: puedes duplicar el archivo y cambiarle el nombre; confirma que no quede como `.env.txt`.
6. En Discord, abre el canal privado donde quieras recibir las apelaciones → Editar canal → Integraciones → Webhooks → Nuevo webhook.
7. Copia la URL del webhook y pégala en `.env` después de `DISCORD_WEBHOOK_URL=`.
   - No compartas esta URL, no la publiques y no la pegues en `public/app.js` ni en `index.html`.
8. En la terminal ejecuta `npm start`.
9. Abre http://localhost:3000 en tu navegador y envía una apelación de prueba.
10. Comprueba que el mensaje llegue al canal elegido.

## Personalizar
- `public/index.html`: textos, secciones, reglas y el enlace de invitación. Busca `https://discord.com/` y reemplázalo por tu invitación real, por ejemplo `https://discord.gg/TUINVITACION`.
- `public/style.css`: colores y decoración. Las variables principales están al principio, dentro de `:root`.
- `public/app.js`: cambio de secciones y envío del formulario. Normalmente no hace falta modificarlo.
- `server.js`: validación del formulario y formato del mensaje de Discord.
- `.env`: URL secreta del webhook. No se sube a GitHub ni se comparte.

## Publicarlo en internet (importante)
Necesitas hosting que ejecute Node.js. En Render, por ejemplo:
1. Sube la carpeta del proyecto a un repositorio privado de GitHub, pero **no subas `.env`**. El `.gitignore` ya excluye ese archivo.
2. Crea un servicio Web Service desde ese repositorio.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. En Environment Variables añade `DISCORD_WEBHOOK_URL` con la URL completa y, si el panel lo pide, `NODE_VERSION` con `20`.
6. Publica y abre la URL que te da el hosting. Haz una prueba.
Los nombres exactos de los botones pueden cambiar según el hosting. Mantén el webhook en las variables de entorno del servidor.

## Seguridad y límites
- El webhook se guarda solo en el servidor, nunca en el código del navegador.
- Hay un límite de 5 envíos por IP cada 15 minutos, validación de campos y un campo trampa básico para bots.
- Para un servidor grande, añade CAPTCHA/Turnstile y controles adicionales antiabuso.
- No se adjuntan archivos; el campo de evidencia acepta un enlace HTTPS.
- Un formulario enviado no significa que la sanción será retirada. Informa a los usuarios de cómo se revisan las apelaciones.
- Si alguna vez publicas accidentalmente el webhook, elimínalo y crea uno nuevo en Discord.
