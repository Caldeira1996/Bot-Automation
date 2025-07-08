import express from 'express';
import cors from 'cors';
import { create, Whatsapp } from 'venom-bot';

const venom = require("venom-bot")

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- Variáveis globais ---------- */
let client: Whatsapp | null = null;
let qrCodeBase64 = '';
type MyStatus = 'DISCONNECTED' | 'QRCODE_GENERATED' | 'CONNECTED';
let sessionStatus: MyStatus = 'DISCONNECTED';

/* ---------- Helpers ---------- */
function log(...args: any[]) {
  console.log('[BOT]', ...args);
}

/* ---------- POST /start ---------- */
  app.post('/start', async (_req, res) => {
  /* Se já existe cliente, apenas devolve estado atual */
  if (client && sessionStatus === 'CONNECTED') {
    return res.json({ message: 'Sessão já iniciada e conectada', qr: qrCodeBase64 });
  }
  
  // Se cliente não conectado, reinicie sessão
  if (client && sessionStatus !== 'CONNECTED') {
    client = null;
    qrCodeBase64 = '';
  }

  qrCodeBase64 = '';
  sessionStatus = 'DISCONNECTED';

  try {
    client = await create(
      'sessionName',
      /* QR callback */
      (qr) => {
        qrCodeBase64 = `data:image/png;base64,${qr}`;
        sessionStatus = 'QRCODE_GENERATED';
        log('📱 QR Code gerado!');
      },
      /* Status callback */
      (raw) => {
        const s = raw.toLowerCase();

        if (['islogged', 'inchat'].includes(s)) {
          sessionStatus = 'CONNECTED';
        } else if (['qrread', 'qrreadsuccess'].includes(s)) {
          sessionStatus = 'QRCODE_GENERATED';
        } else if (['disconnected', 'logout', 'browserclose', 'qrtimeout', 'closed'].includes(s)) {
          sessionStatus = 'DISCONNECTED';
          client = null;
          qrCodeBase64 = '';
        }

        log('Status sessão:', raw, '→', sessionStatus);
      },
      /* Opções */
      {
        folderNameToken: './tokens',
        headless: false, // use 'new' para headless moderno
        devtools: false,
        debug: false,
        logQR: false,
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      }
    );

    res.json({ message: 'Sessão iniciada', qr: qrCodeBase64 });
  } catch (err) {
    console.error('❌ Falha ao criar sessão:', err);
    res.status(500).json({ error: 'Falha ao criar sessão', detail: String(err) });
  }
});

/* ---------- GET /qr ---------- */
app.get('/qr', (_req, res) => {
  if (qrCodeBase64) {
    return res.json({ qr: qrCodeBase64, status: sessionStatus });
  }
  res.status(404).json({ error: 'QR não disponível', status: sessionStatus });
});

/* ---------- GET /status ---------- */
app.get('/status', (_req, res) => {
  res.json({
    status: sessionStatus,
    hasClient: !!client,
    hasQR: !!qrCodeBase64,
    qr: qrCodeBase64 || null,
  });
});

/* ---------- POST /send-message (múltiplos números) ---------- */
app.post('/send-message', async (req, res) => {
  if (!client || sessionStatus !== 'CONNECTED') {
    console.log('❌ Tentativa de enviar mensagem mas o bot não está conectado');
    return res.status(400).json({ error: 'Bot não conectado' });
  }

  const { numbers, message } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
    console.log('❌ Números ou mensagem inválidos');
    return res.status(400).json({ error: 'Informe ao menos um número válido e uma mensagem' });
  }

  const results: { number: string; status: string; detail?: string }[] = [];

  for (const numberRaw of numbers) {
    const number = String(numberRaw).replace(/\D/g, '');
    const chatId = `${number}@c.us`;

    if (!/^\d{12,13}$/.test(number)) {
      results.push({ number, status: 'invalid_format' });
      continue;
    }

    try {
      const result = await client.sendText(chatId, message);
      console.log(`✅ Mensagem enviada para ${number}`);
      results.push({ number, status: 'success' });
    } catch (err: any) {
      console.error(`❌ Erro ao enviar para ${number}:`, err);
      results.push({ number, status: 'error', detail: String(err.message || err) });
    }
  }

  res.json({ results });
});


/* ---------- POST /logout (opcional) ---------- */
app.post('/logout', async (_req, res) => {
  if (!client) return res.json({ message: 'Nenhuma sessão ativa' });
  try {
    await client.logout();
    client = null;
    qrCodeBase64 = '';
    sessionStatus = 'DISCONNECTED';
    res.json({ message: 'Logout realizado. Escaneie novo QR para reconectar.' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ---------- POST /debug-send ---------- */
app.post('/debug-send', async (req, res) => {
  if (!client) return res.status(400).json({ error: 'client == null' });

  const { number } = req.body;
  const chatId = number
    ? `${String(number).replace(/\D/g, '')}@c.us`
    : '5553991299269@c.us'; // substitua por seu número p/ teste

  try {
    const result = await client.sendText(chatId, 'Mensagem TESTE via /debug');
    log('sendText result =', result);
    res.json({ ok: true, result });
  } catch (e) {
    console.error('sendText erro', e);
    res.status(500).json({ error: String(e) });
  }
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => log(`Servidor rodando na porta ${PORT}`));
