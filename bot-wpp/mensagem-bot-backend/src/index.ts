import express from 'express';
import cors from 'cors';
import { create, Whatsapp } from 'venom-bot';
import Stripe from 'stripe';
import dotenv from 'dotenv';

import { authRouter } from './auth-api';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRouter);

/* ---------- Variáveis globais do Venom Bot ---------- */
let client: Whatsapp | null = null;
let qrCodeBase64 = '';
type MyStatus = 'DISCONNECTED' | 'QRCODE_GENERATED' | 'CONNECTED';
let sessionStatus: MyStatus = 'DISCONNECTED';

/* ---------- Helper para log ---------- */
function log(...args: any[]) {
  console.log('[BOT]', ...args);
}

/* ---------- Rota Stripe - Criar sessão de checkout ---------- */
app.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        //   {
        //   price: 'price_1Rj4AsHJCubfDy0QPcEkL3RC', // ✅ Coloque seu price_id aqui
        //   quantity: 1,
        // },
        // {
        //   price: 'price_1Rj499HJCubfDy0QOpZvCF3F',
        //   quantity: 1,
        // }

        {
          price: 'price_1Rj7iFHJCubfDy0Qb6tp5wCJ',
          quantity: 1,
        }

      ],
      success_url: 'http://localhost:5173/sucesso',
      cancel_url: 'http://localhost:5173/cancelado',
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/* ---------- Rota Venom Bot - iniciar sessão ---------- */
app.post('/start', async (_req, res) => {
  if (client && sessionStatus === 'CONNECTED') {
    return res.json({ message: 'Sessão já iniciada e conectada', qr: qrCodeBase64 });
  }

  if (client && sessionStatus !== 'CONNECTED') {
    client = null;
    qrCodeBase64 = '';
  }

  qrCodeBase64 = '';
  sessionStatus = 'DISCONNECTED';

  try {
    client = await create(
      'sessionName',
      (qr) => {
        qrCodeBase64 = `data:image/png;base64,${qr}`;
        sessionStatus = 'QRCODE_GENERATED';
        log('📱 QR Code gerado!');
      },
      (raw) => {
        const s = raw.toLowerCase();
        if (['islogged', 'inchat'].includes(s)) sessionStatus = 'CONNECTED';
        else if (['qrread', 'qrreadsuccess'].includes(s)) sessionStatus = 'QRCODE_GENERATED';
        else if (['disconnected', 'logout', 'browserclose', 'qrtimeout', 'closed'].includes(s)) {
          sessionStatus = 'DISCONNECTED';
          client = null;
          qrCodeBase64 = '';
        }
        log('Status sessão:', raw, '→', sessionStatus);
      },
      {
        folderNameToken: './tokens',
        headless: false,
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

/* ---------- Rota para pegar QR Code ---------- */
app.get('/qr', (_req, res) => {
  if (qrCodeBase64) {
    return res.json({ qr: qrCodeBase64, status: sessionStatus });
  }
  res.status(404).json({ error: 'QR não disponível', status: sessionStatus });
});

/* ---------- Rota para status da sessão ---------- */
app.get('/status', (_req, res) => {
  res.json({
    status: sessionStatus,
    hasClient: !!client,
    hasQR: !!qrCodeBase64,
    qr: qrCodeBase64 || null,
  });
});

/* ---------- Rota para enviar mensagem para múltiplos números ---------- */
app.post('/send-message', async (req, res) => {
  if (!client || sessionStatus !== 'CONNECTED') {
    log('❌ Tentativa de enviar mensagem mas o bot não está conectado');
    return res.status(400).json({ error: 'Bot não conectado' });
  }

  const { numbers, message } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
    log('❌ Números ou mensagem inválidos');
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
      log(`✅ Mensagem enviada para ${number}`);
      results.push({ number, status: 'success' });
    } catch (err: any) {
      log(`❌ Erro ao enviar para ${number}:`, err);
      results.push({ number, status: 'error', detail: String(err.message || err) });
    }
  }

  res.json({ results });
});

/* ---------- Rota para logout (opcional) ---------- */
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

/* ---------- Rota para enviar mensagem de debug ---------- */
app.post('/debug-send', async (req, res) => {
  if (!client) return res.status(400).json({ error: 'client == null' });

  const { number } = req.body;
  const chatId = number
    ? `${String(number).replace(/\D/g, '')}@c.us`
    : '5553991299269@c.us'; // coloque seu número para teste

  try {
    const result = await client.sendText(chatId, 'Mensagem TESTE via /debug');
    log('sendText result =', result);
    res.json({ ok: true, result });
  } catch (e) {
    console.error('sendText erro', e);
    res.status(500).json({ error: String(e) });
  }
});

/* ---------- Inicializa servidor ---------- */
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => log(`Servidor rodando na porta ${PORT}`));
