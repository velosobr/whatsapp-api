const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
const port = 3000;

// Configuração do cliente WhatsApp com persistência de sessão
const client = new Client({
  authStrategy: new LocalAuth(), // salva sessão localmente
});

// Gera o QR Code no terminal para login
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Loga com sucesso
client.on("ready", () => {
  console.log("WhatsApp conectado com sucesso!");
});

// Inicializar o cliente
client.initialize();

// Endpoint para enviar mensagens
app.get("/send", async (req, res) => {
  const { numero, mensagem } = req.query;
  if (!numero || !mensagem) {
    return res.status(400).send("Número e mensagem são obrigatórios!");
  }

  const chatId = `${numero}@c.us`; // Formato de número para WhatsApp

  try {
    await client.sendMessage(chatId, mensagem);
    res.send("Mensagem enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).send("Erro ao enviar mensagem.");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});