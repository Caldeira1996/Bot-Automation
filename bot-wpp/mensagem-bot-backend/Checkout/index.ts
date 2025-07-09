import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Valida se a chave existe
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error('❌ STRIPE_SECRET_KEY não definida no .env');
}

// ✅ Instância segura da Stripe
const stripe = new Stripe(secretKey, {
  apiVersion: '2025-06-30.basil', // novo valor aceito
});

// ✅ Endpoint do checkout
app.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_12345', // ✅ Coloque seu price_id aqui
          quantity: 1,
        },
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

// ✅ Inicializa o servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`✅ Servidor Stripe rodando em http://localhost:${PORT}`);
});
