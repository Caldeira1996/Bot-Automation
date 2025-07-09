import { useState } from 'react';
import './CheckoutScreen.css'; 

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'boleto'>('credit');
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const handlePayment = () => {
    alert('Assinatura confirmada! 🚀');
  };

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
