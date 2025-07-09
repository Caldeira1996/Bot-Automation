import { useState } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import './CheckoutScreen.css'; 

const stripePromise = loadStripe('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'); // use sua public key (começa com pk_test_)

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'boleto'>('credit');
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  async function handlePayment() {
  const response = await fetch('http://localhost:3001/create-checkout-session', {
    method: 'POST',
  });

   const data = await response.json();

  const stripe = await stripePromise;
  if (stripe && data.url) {
    window.location.href = data.url; // redireciona pro checkout do Stripe
  } else {
    alert('Erro ao redirecionar para o Stripe!');
  }
}

  return (
    <div className="container">
      <h1>Finalizar Assinatura</h1>

      <div className="section">
        <h2>Produto</h2>
        <p>🔒 Acesso Premium Mensal</p>
        <p style={{ fontWeight: 'bold' }}>R$ 29,90 / mês</p>
      </div>

      <div className="section">
        <h2>Forma de Pagamento</h2>
        <div className="button-group">
          <button
            className={`btn ${paymentMethod === 'credit' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('credit')}
          >
            Cartão
          </button>
          <button
            className={`btn ${paymentMethod === 'pix' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('pix')}
          >
            Pix
          </button>
          <button
            className={`btn ${paymentMethod === 'boleto' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('boleto')}
          >
            Boleto
          </button>
        </div>
      </div>

      {paymentMethod === 'credit' && (
        <div className="section">
          <input
            type="text"
            className="input"
            placeholder="Nome no cartão"
            value={cardData.name}
            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
          />
          <input
            type="text"
            className="input"
            placeholder="Número do cartão"
            value={cardData.number}
            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Validade (MM/AA)"
              value={cardData.expiry}
              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
            />
            <input
              type="text"
              className="input"
              placeholder="CVV"
              value={cardData.cvv}
              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'pix' && (
        <p className="section">⚡ Você receberá um QR Code para pagamento instantâneo.</p>
      )}

      {paymentMethod === 'boleto' && (
        <p className="section">📄 Um boleto será gerado com vencimento em até 2 dias úteis.</p>
      )}

      <div className="button-group">
        <button className="btn" onClick={handlePayment}>
          Confirmar Assinatura
        </button>
      </div>
    </div>
  );
}
