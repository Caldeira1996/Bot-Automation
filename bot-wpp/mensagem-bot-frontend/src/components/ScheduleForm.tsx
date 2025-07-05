import { useState } from "react";

import "../styles/schedule-form.css"

export default function ScheduleForm({
  onSchedule,
}: {
  onSchedule: (settings: {
    start: string;
    intervalMin: number;
    intervalMax: number;
  }) => void;
}) {
  const [start, setStart] = useState("");
  const [intervalMin, setMin] = useState(15);
  const [intervalMax, setMax] = useState(30);

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-2">Agendamento</h2>
      <div className="flex gap-4 mb-4">
        <label className="flex flex-col">
          Início
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col">
          Intervalo (min)
          <input
            type="number"
            value={intervalMin}
            onChange={(e) => setMin(+e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col">
          Intervalo (máx)
          <input
            type="number"
            value={intervalMax}
            onChange={(e) => setMax(+e.target.value)}
            className="input"
          />
        </label>
      </div>
      <button
        className="btn btn-primary"
        id="btn-schedule-shipments"
        onClick={() => onSchedule({ start, intervalMin, intervalMax })}
      >
        Agendar envios
      </button>
    </section>
  );
}
