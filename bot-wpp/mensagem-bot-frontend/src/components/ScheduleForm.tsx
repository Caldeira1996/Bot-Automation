import { useState } from "react";
import "../styles/schedule-form.css";

export default function ScheduleForm({
  isOpen,
  onClose,
  onSchedule,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (params: { start: string; intervalMin: number; intervalMax: number }) => void;
}) {
  const [start, setStart] = useState("");
  const [intervalMin, setIntervalMin] = useState(0);
  const [intervalMax, setIntervalMax] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="schedule-modal">
        <button type="button" className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>Agendar Envio</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSchedule({ start, intervalMin, intervalMax });
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

          <button type="submit" className="btn-primary">Agendar</button>
        </form>
      </div>
    </div>
  );
}
