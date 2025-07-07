import express from 'express';
import cors from 'cors';
import { create, Whatsapp } from 'venom-bot';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

let client: Whatsapp | null = null;
let qrCodeBase64 = '';
let sessionStatus = 'DISCONNECTED';

app.post('/start', async (_req, res) => {
  if (client) return res.json({ message: 'Cliente já iniciado', qr: qrCodeBase64 });

  qrCodeBase64 = '';

  try {
    client = await create(
  'sessionName',
  (qr) => {
    qrCodeBase64 = qr; // O venom-bot já retorna com o prefixo data:image/png;base64,
    console.log('📱 QR Code gerado! Tamanho:', qr.length);
  },
  (status) => {
    sessionStatus = status;
    console.log('Status da sessão:', status);
    if (status === 'DISCONNECTED' || status === 'CLOSED') {
      client = null;
      qrCodeBase64 = '';
    }
  },
  {
    folderNameToken: './tokens',
    headless: false, // Navegador vai abrir visualmente
    devtools: false,
    debug: false,
    logQR: false,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
);

    // Retorna mensagem + qr atual (pode estar vazio se ainda não gerou)
    return res.json({ message: 'Cliente iniciado', qr: qrCodeBase64 });

  } catch (err) {
    console.error('❌ Erro ao iniciar cliente:', err);
    return res.status(500).json({ 
    error: (err instanceof Error) ? err.message : JSON.stringify(err),
    stack: (err instanceof Error) ? err.stack : undefined,
  });
  }
});


app.get('/qr', (_req, res) => {
  console.log('🔍 Solicitação de QR - Disponível:', !!qrCodeBase64);
  
  if (qrCodeBase64) {
    return res.json({ qr: qrCodeBase64, status: sessionStatus });
  } else {
    return res.status(404).json({ 
      error: 'QR não disponível', 
      status: sessionStatus 
    });
  }
});

// Rota para status da sessão
app.get('/status', (_req, res) => {
  res.json({ 
    status: sessionStatus, 
    hasClient: !!client, 
    hasQR: !!qrCodeBase64 
  });
});

app.post('/send-message', async (req, res) => {
  if (!client) return res.status(400).json({ error: 'Cliente não iniciado' });

  const { number, message } = req.body;
  if (!number || !message)
    return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });

  try {
    const chatId = `${String(number).replace(/\D/g, '')}@c.us`;
    const status = await client.checkNumberStatus(chatId);
    if (!status?.canReceiveMessage)
      return res.status(400).json({ error: 'Número não registrado no WhatsApp' });

    await client.sendText(chatId, message);
    return res.json({ message: 'Mensagem enviada com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));