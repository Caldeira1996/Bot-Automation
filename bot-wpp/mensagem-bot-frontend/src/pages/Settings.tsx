import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSenderNumber } from "../components/SenderNumberContext";
import "../styles/settings.css";

export default function Settings() {
  const { senderNumber, setSenderNumber } = useSenderNumber();
  const [value, setValue] = useState(senderNumber);
  const navigate = useNavigate();

  // Estado para QR code base64
  const [qrCode, setQrCode] = useState<string | null>(null);
  // Estado para mostrar status da integração
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!/^\d{12,13}$/.test(value)) {
      alert("Digite no formato 55DDDNUMERO (apenas dígitos).");
      return;
    }
    setSenderNumber(value);
    alert("Número salvo!");
    navigate(-1);
  };

  // Função para iniciar integração (backend /start)
  const startIntegration = async () => {
    setLoading(true);
    setQrCode(null);
    try {
      await fetch("http://localhost:3333/start", { method: "POST" });

      // Fazer polling a cada 2s para pegar o QR
      const interval = setInterval(async () => {
        const res = await fetch("http://localhost:3333/qr");
        if (res.ok) {
          const data = await res.json();
          setQrCode(data.qr);
          setLoading(false);
          clearInterval(interval);
        }
      }, 2000);
    } catch (error) {
      alert("Erro ao iniciar integração");
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-box">
        {/* Botão Voltar */}
        <button className="settings-back" onClick={() => navigate(-1)}>
          &larr; Voltar
        </button>

        <h2 className="settings-title">Configurar Número Remetente</h2>

        <label className="settings-label">
          Número do WhatsApp (ex: 5511999999999)
        </label>
        <input
          className="settings-input"
          placeholder="5511999999999"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button onClick={handleSave} className="settings-button">
          Salvar
        </button>

        <hr style={{ margin: "2rem 0" }} />

        <h2 className="settings-title">Integração WhatsApp</h2>
        <button
          onClick={startIntegration}
          disabled={loading}
          className="settings-button"
        >
          {loading ? "Gerando QR Code..." : "Integrar WhatsApp"}
        </button>

        {qrCode && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p>Escaneie o QR Code abaixo com seu WhatsApp:</p>
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              style={{ width: "200px", height: "200px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
