import { useState, useEffect, useRef } from "react";
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
  // Estado para controlar se modal está aberto
  const [showModal, setShowModal] = useState(false);

  // Guarda o ID do intervalo para limpar depois
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = () => {
    if (!/^\d{12,13}$/.test(value)) {
      alert("Digite no formato 55DDDNUMERO (apenas dígitos).");
      return;
    }
    setSenderNumber(value);
    alert("Número salvo!");
    navigate(-1);
  };

  const startIntegration = async () => {
    console.log("🚀 Iniciando integração...");
    setLoading(true);
    setQrCode(null);

    try {
      const response = await fetch("http://localhost:3333/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Start response:", result);

      // Limpa se já tiver um intervalo rodando
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      let attempts = 0;
      const maxAttempts = 30; // 60 segundos total

      // Fazer polling a cada 2s para pegar o QR
      pollingIntervalRef.current = setInterval(async () => {
        attempts++;
        console.log(`🔄 Tentativa ${attempts}/${maxAttempts} - Buscando QR...`);

        try {
          const res = await fetch("http://localhost:3333/qr");

          if (res.ok) {
            const data = await res.json();
            console.log("📱 QR Response:", { hasQR: !!data.qr, status: data.status });

            if (data.qr) {
              console.log("✅ QR Code recebido!");
              setQrCode(data.qr);
              setLoading(false);
              setShowModal(true); // Abre modal quando QR disponível
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          } else {
            console.log("⚠️ QR não disponível ainda...");
          }

          if (attempts >= maxAttempts) {
            console.log("⏰ Timeout - Máximo de tentativas atingido");
            setLoading(false);
            alert("Timeout: QR Code não foi gerado a tempo. Tente novamente.");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (error) {
          console.error("❌ Erro ao buscar QR code:", error);

          if (attempts >= maxAttempts) {
            setLoading(false);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Erro ao iniciar integração:", error);
      alert("Erro ao iniciar integração: " + error);
      setLoading(false);
    }
  };

  // Cleanup do intervalo ao desmontar o componente
  useEffect(() => {
    // Opcional: iniciar integração automaticamente na carga da página
    // startIntegration();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-box">
        {/* Botão Voltar */}
        <button className="settings-back" onClick={() => navigate(-1)}>
          &larr; Voltar
        </button>

        <h2 className="settings-title">Configurar Número Remetente</h2>

        <label className="settings-label">Número do WhatsApp (ex: 5511999999999)</label>
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
        <button onClick={startIntegration} disabled={loading} className="settings-button">
          {loading ? "Gerando QR Code..." : "Integrar WhatsApp"}
        </button>

        {/* Modal do QR Code */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Escaneie o QR Code com seu WhatsApp</h3>
              <img src={qrCode ?? ""} alt="QR Code WhatsApp" style={{ width: 200, height: 200 }} />
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
