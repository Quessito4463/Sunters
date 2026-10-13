require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = (process.env.DISCORD_WEBHOOK_URL || "").trim();

app.disable("x-powered-by");
app.use(express.json({ limit: "12kb" }));
app.use(express.static(path.join(__dirname, "public")));

const appealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Has enviado demasiadas solicitudes. Espera 15 minutos e inténtalo de nuevo." }
});

function clean(value, max = 1000) {
  return String(value || "").trim().replace(/[<>]/g, "").slice(0, max);
}

app.post("/api/appeals", appealLimiter, async (req, res) => {
  if (!/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[^/\s]+$/.test(WEBHOOK_URL)) {
    return res.status(500).json({ error: "El administrador aún no ha configurado correctamente el webhook en el archivo .env." });
  }

  const body = req.body || {};
  // Campo trampa básico para bots.
  if (body.nickname) return res.json({ ok: true });

  const type = clean(body.type, 30);
  const discordName = clean(body.discordName, 80);
  const userId = clean(body.userId, 30);
  const punishment = clean(body.punishment, 80);
  // Discord permite un máximo de 1024 caracteres por valor de campo de embed.
  const reason = clean(body.reason, 1000);
  const explanation = clean(body.explanation, 1000);
  const evidence = clean(body.evidence, 500);

  if (!["Warn", "Mute", "Kick", "Ban", "Otro"].includes(type) || !discordName || !reason || !explanation) {
    return res.status(400).json({ error: "Completa los campos obligatorios y revisa el tipo de sanción." });
  }
  if (userId && !/^\d{17,20}$/.test(userId)) {
    return res.status(400).json({ error: "El ID de Discord debe tener entre 17 y 20 dígitos, o dejarse vacío." });
  }
  if (evidence && !/^https:\/\/\S+$/i.test(evidence)) {
    return res.status(400).json({ error: "La evidencia debe ser un enlace HTTPS válido." });
  }

  const colors = { Warn: 0xf3a6c8, Mute: 0xd9b8f2, Kick: 0xffc6d9, Ban: 0xf08cae, Otro: 0xe7b6e5 };
  const embed = {
    title: "🌸 Nueva apelación · Sunters",
    color: colors[type],
    fields: [
      { name: "Tipo de sanción", value: type, inline: true },
      { name: "Usuario de Discord", value: discordName || "No proporcionado", inline: true },
      { name: "ID de Discord", value: userId || "No proporcionado", inline: true },
      { name: "Sanción / fecha", value: punishment || "No especificada", inline: false },
      { name: "Motivo de la sanción", value: reason || "No proporcionado", inline: false },
      { name: "Explicación de la apelación", value: explanation || "No proporcionada", inline: false },
      { name: "Evidencia / enlaces", value: evidence || "No adjuntó enlaces", inline: false }
    ],
    footer: { text: "Sunters · Formulario de apelaciones" },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Sunters · Apelaciones",
        embeds: [embed],
        allowed_mentions: { parse: [] }
      })
    });

    if (!response.ok) {
      // Loguea el motivo de Discord para poder diagnosticar errores sin mostrar el webhook.
      const details = await response.text();
      console.error("Error de Discord:", response.status, details);
      return res.status(502).json({ error: "Discord no aceptó la apelación. Revisa la terminal del servidor." });
    }

    return res.json({ ok: true, message: "¡Apelación enviada! El equipo de Sunters podrá revisarla." });
  } catch (err) {
    console.error("No se pudo enviar la apelación:", err.message);
    return res.status(502).json({ error: "No se pudo conectar con Discord. Inténtalo más tarde." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Sunters está listo en http://localhost:${PORT}`));
