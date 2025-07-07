import express from 'express';
import cors from 'cors';
import { create, Whatsapp } from 'venom-bot';

const app = express();
app.use(cors());
app.use(express.json());

let client: Whatsapp | null = null;
let qrCodeBase64 = '';                      // <‑‑ guarda o QR para o front

/** Inicia a sessão e gera o QR */
app.post('/start', async (_req, res) => {
  if (client) return res.json({ message: 'Cliente já iniciado' });

  try {
    client = await create(
      'sessionName',
      (base64Qr) => {
        qrCodeBase64 = base64Qr;
        console.log('QR gerado/atualizado');
      },
      (state) => {
        console.log('Estado da sessão:', state);
        if (state === 'CONNECTED') {
          console.log('Cliente conectado com sucesso!');
        } else if (state === 'DISCONNECTED') {
          console.log('Cliente desconectado. Precisa reiniciar a sessão.');
          client = null;
        }
      }
    );

    return res.json({ message: 'Cliente iniciado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao iniciar cliente' });
  }
});

/** Disponibiliza o QR Code para o frontend */
app.get('/status', (req, res) => {
  if (client) {
    return res.json({ connected: true });
  }
  return res.json({ connected: false });
});

/** Envio de mensagem */
app.post('/send-message', async (req, res) => {
  if (!client)
    return res.status(400).json({ error: 'Cliente não iniciado' });

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
