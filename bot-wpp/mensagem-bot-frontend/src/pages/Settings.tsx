import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSenderNumber } from "../components/SenderNumberContext";

export default function Settings() {
  const { senderNumber, setSenderNumber } = useSenderNumber();
  const [value, setValue] = useState(senderNumber);
  const navigate = useNavigate();

  const handleSave = () => {
    // Validação simples: só dígitos, 12‑13 caracteres (ex.: 5511999999999)
    if (!/^\d{12,13}$/.test(value)) {
      alert("Digite no formato 55DDDNUMERO (apenas dígitos).");
      return;
    }
    setSenderNumber(value);
    alert("Número salvo!");
    navigate(-1); // Volta para a página anterior
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-12 p-6 rounded-2xl shadow-lg bg-slate-800">
      <h1 className="text-xl font-semibold text-center">Configurar número remetente</h1>

      <input
        className="p-3 rounded-lg text-black"
        placeholder="5511999999999"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-emerald-600 hover:bg-emerald-700 transition rounded-lg py-2 font-medium"
      >
        Salvar
      </button>
    </div>
  );
}