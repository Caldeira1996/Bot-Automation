import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSenderNumber } from "../components/SenderNumberContext";
import "../styles/settings.css";

export default function Settings() {
  const { senderNumber, setSenderNumber } = useSenderNumber();
  const [value, setValue] = useState(senderNumber);
  const navigate = useNavigate();

  const handleSave = () => {
    if (!/^\d{12,13}$/.test(value)) {
      alert("Digite no formato 55DDDNUMERO (apenas dígitos).");
      return;
    }
    setSenderNumber(value);
    alert("Número salvo!");
    navigate(-1);
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
      </div>
    </div>
  );
}
