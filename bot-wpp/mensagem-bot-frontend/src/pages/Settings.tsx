import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSenderNumber } from '../components/SenderNumberContext';
import '../styles/settings.css';

/* ---------- util ---------- */
type SessionStatus = 'DISCONNECTED' | 'QRCODE_GENERATED' | 'CONNECTED';

async function fetchStatus(): Promise<{
  status: SessionStatus;
  hasQR: boolean;
  qr?: string;
}> {
  try {
    const r = await fetch('http://localhost:3333/status');
    const j = await r.json();
    return { status: j.status, hasQR: j.hasQR, qr: j.qr };
  } catch {
    return { status: 'DISCONNECTED', hasQR: false };
  }
}

export default function Settings() {
  /* estados básicos */
  const { senderNumber, setSenderNumber } = useSenderNumber();
  const [value, setValue] = useState(senderNumber);
  const navigate = useNavigate();

  /* integração */
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  /* salvar número */
  const handleSave = () => {
    if (!/^\d{12,13}$/.test(value)) {
      alert('Digite no formato 55DDDNUMERO.');
      return;
    }
    setSenderNumber(value);
    alert('Número salvo!');
    navigate(-1);
  };

  /* iniciar integração */
  const startIntegration = async () => {
    /* 1) verifica status atual */
    const s = await fetchStatus();

    if (s.status === 'CONNECTED') {
      alert('WhatsApp já conectado!');
      setConnected(true);
      return;
    }

    if (s.status === 'QRCODE_GENERATED' && s.hasQR && s.qr) {
      // reaproveita QR já existente
      setQrCode(s.qr);
      setShowModal(true);
      return;
    }

    /* 2) chama /start para gerar QR */
    setLoading(true);
    setQrCode(null);

    try {
      const resp = await fetch('http://localhost:3333/start', { method: 'POST' });
      const startJson = await resp.json();

      // se o backend já devolveu QR (caso token inválido)
      if (startJson.qr) {
        setQrCode(startJson.qr);
        setShowModal(true);
      }

      /* 3) inicia polling */
      let tries = 0;
      const max = 30;

      async function tick() {
        tries += 1;
        const st = await fetchStatus();

        if (st.status === 'CONNECTED') {
          setConnected(true);
          stop();
          return;
        }

        if (st.status === 'QRCODE_GENERATED' && st.hasQR && st.qr) {
          setQrCode(st.qr);
          if (!showModal) setShowModal(true);
        }

        if (tries >= max) {
          alert('Timeout: QR não gerado ou sessão não conectou.');
          stop();
        }
      }

      function stop() {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setLoading(false);
      }

      pollingRef.current = setInterval(tick, 2000);
      tick();
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar integração');
      setLoading(false);
    }
  };

  /* limpa intervalo ao desmontar */
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  /* ---------------- render ---------------- */
  return (
    <div className="settings-container">
      <div className="settings-box">
        <button className="settings-back" onClick={() => navigate(-1)}>
          &larr; Voltar
        </button>

        <h2 className="settings-title">Configurar Número Remetente</h2>
        <label className="settings-label">Número do WhatsApp</label>
        <input
          className="settings-input"
          placeholder="5511999999999"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={handleSave} className="settings-button">
          Salvar
        </button>

        <hr style={{ margin: '2rem 0' }} />

        <h2 className="settings-title">Integração WhatsApp</h2>
        {connected ? (
          <p className="text-green-600 font-semibold">✅ Conectado!</p>
        ) : (
          <button
            onClick={startIntegration}
            disabled={loading}
            className="settings-button"
          >
            {loading ? 'Gerando QR...' : 'Integrar WhatsApp'}
          </button>
        )}

        {/* modal QR */}
        {showModal && qrCode && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Escaneie o QR Code</h3>
              <img src={qrCode} alt="QR Code" style={{ width: 220 }} />
              <button onClick={() => setShowModal(false)} style={{ marginTop: 20 }}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
