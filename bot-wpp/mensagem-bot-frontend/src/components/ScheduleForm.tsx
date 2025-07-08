import { Dialog } from "@headlessui/react"; // Certifique-se de que esse componente está correto
import { useState } from "react";

import "../styles/schedule-form.css"

// Recebe os parâmetros: isOpen, onClose e onSchedule
export default function ScheduleForm({
  isOpen,
  onClose,
  onSchedule,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (params: { start: string; intervalMin: number; intervalMax: number }) => void;
}) {
  const [start, setStart] = useState(""); // Defina um estado para "start"
  const [intervalMin, setIntervalMin] = useState(0);
  const [intervalMax, setIntervalMax] = useState(0);

  if (!isOpen) return null; // Se o modal não estiver aberto, não renderize nada

  return (
    <Dialog open={isOpen} onClose={onClose} className="modal">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-panel">
        <Dialog.Title className="text-lg font-semibold mb-2" id="schedule-send">Agendar Envio</Dialog.Title>

        {/* Botão de Fechar */}
        <button 
        type="button"
        className="close-btn"
        onClick={onClose} // chama a função onClose para fechar o modal
        >
          X
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSchedule({ start, intervalMin, intervalMax }); // Passa as configurações para onSchedule
          }}
        >
          <div>
            <label>Data de Início</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Intervalo Mínimo (minutos)</label>
            <input
              type="number"
              value={intervalMin}
              onChange={(e) => setIntervalMin(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label>Intervalo Máximo (minutos)</label>
            <input
              type="number"
              value={intervalMax}
              onChange={(e) => setIntervalMax(Number(e.target.value))}
              required
            />
          </div>

          <button id="Shedule" type="submit">Agendar</button>
        </form>
      </div>
    </Dialog>
  );
}
