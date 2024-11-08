const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const app = express();
const port = process.env.PORT || 3000;

// Variável para armazenar o QR Code temporariamente
let qrCodeData = null;

// Configuração do cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Quando o QR Code é gerado, ele é armazenado na variável `qrCodeData`
client.on("qr", (qr) => {
  qrCodeData = qr;
  console.log("QR Code recebido. Acesse /qrcode para escanear.");
});

// Evento quando o cliente está pronto e autenticado
client.on("ready", () => {
  console.log("WhatsApp conectado com sucesso!");
  // Limpa o QR Code, pois já está autenticado
  qrCodeData = null;
});

// Inicializar o cliente
client.initialize();

// Endpoint para exibir o QR Code como uma imagem
app.get("/qrcode", async (req, res) => {
  // Se o QR Code não foi gerado ainda ou já expirou
  if (!qrCodeData) {
    return res.send("QR Code ainda não gerado ou já autenticado. Aguarde alguns instantes ou reinicie o cliente.");
  }

  try {
    // Gera a imagem do QR Code em base64 e exibe como <img>
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);
    res.send(`
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1>Escaneie o QR Code abaixo para conectar ao WhatsApp</h1>
        <img src="${qrCodeImage}" alt="QR Code para WhatsApp" />
      </div>
    `);
  } catch (error) {
    console.error("Erro ao gerar QR Code", error);
    res.status(500).send("Erro ao gerar QR Code.");
  }
});

// Endpoint padrão
app.get("/", (req, res) => {
  res.send("API de WhatsApp - Acesse /qrcode para obter o QR Code.");
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});