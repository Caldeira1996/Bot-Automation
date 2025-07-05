import { useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import type { Contact } from "../types";
import "../styles/contact-modal.css";

interface ContactAddModalProps {
  onClose: () => void;
  onAdd: (contacts: Contact[]) => void;
}

export default function ContactAddModal({ onClose, onAdd }: ContactAddModalProps) {
  /* ---------- estado ---------- */
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const { register, handleSubmit, reset } = useForm<Contact>();
  const [bulkNumbers, setBulkNumbers] = useState("");

  /* ---------- helpers ---------- */
  const parseBulkContacts = (s: string): Contact[] =>
    s.split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((tel) => ({ nome: "", telefone: tel }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bytes = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(bytes, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const imported: Contact[] = rows.slice(1).map((r) => ({
        nome: r[0] ?? "",
        telefone: String(r[1] ?? ""),
      }));
      onAdd(imported);
      onClose();
    };
    reader.readAsArrayBuffer(file);
  };

  /* ---------- submits ---------- */
  const onSubmitSingle = (data: Contact) => {
    onAdd([data]);
    reset();
    onClose();
  };

  const onSubmitBulk = () => {
    onAdd(parseBulkContacts(bulkNumbers));
    setBulkNumbers("");
    onClose();
  };

  /* ---------- UI ---------- */
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>Adicionar Contatos</h2>

        {/* seletor de modo */}
        <div className="mode-switch">
          <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
            Um a um
          </button>
          <button className={mode === "bulk" ? "active" : ""} onClick={() => setMode("bulk")}>
            Múltiplos números
          </button>
        </div>

        {/* importação Excel */}
        <div className="import-excel">
          <label htmlFor="upload-excel" className="btn btn-secondary" id="import-excel">
            Importar Excel
          </label>
          <input
            id="upload-excel"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </div>

        {/* formulários */}
        {mode === "single" && (
          <form onSubmit={handleSubmit(onSubmitSingle)} className="form">
            <input className="input" {...register("nome", { required: true })} placeholder="Nome" />
            <input
              className="input"
              {...register("telefone", { required: true })}
              placeholder="Telefone"
            />
            <button className="btn btn-primary">Adicionar</button>
          </form>
        )}

        {mode === "bulk" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitBulk();
            }}
            className="form"
          >
            <textarea
              className="input"
              rows={4}
              placeholder="Digite números separados por vírgula"
              value={bulkNumbers}
              onChange={(e) => setBulkNumbers(e.target.value)}
            />
            <button className="btn btn-primary">Adicionar múltiplos</button>
          </form>
        )}
      </div>
    </div>
  );
}
