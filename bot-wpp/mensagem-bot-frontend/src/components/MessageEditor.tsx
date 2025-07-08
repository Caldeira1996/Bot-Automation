import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Contact } from "../types";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

import ContactSelectModal from "./ContactSelectModal";
import "../styles/message-editor.css";

interface MessageEditorProps {
  template: string;
  setTemplate: Dispatch<SetStateAction<string>>;
  contacts: Contact[];

  activeTab: "manual" | "contatos";
  setActiveTab: React.Dispatch<React.SetStateAction<"manual" | "contatos">>;
}

export default function MessageEditor({
  template,
  setTemplate,
  contacts,
}: MessageEditorProps) {
  const [manualPhones, setManualPhones] = useState("");
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"manual" | "contatos">("manual");
  const [sending, setSending] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Novo: juntar manual + contatos
  const manualList = manualPhones
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const mergedPhones = Array.from(new Set([...manualList, ...selectedPhones]));

  const validPhones = mergedPhones.filter((p) => /^\d{12,13}$/.test(p));
  const invalidPhones = mergedPhones.filter((p) => !/^\d{12,13}$/.test(p));

  const allPhonesValid = mergedPhones.length > 0 && invalidPhones.length === 0;
  const phoneIsValid = mergedPhones.length > 0 && allPhonesValid;
  const msgIsValid = template.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneIsValid || !msgIsValid) return;

    setSending(true);
    try {
      const res = await fetch("http://localhost:3333/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: mergedPhones,
          message: template,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Mensagem enviada com sucesso!");
        setTemplate("");
        setManualPhones("");
        setSelectedPhones([]);
      } else {
        alert("❌ Erro: " + (data.error || "Falha ao enviar"));
      }
    } catch (err) {
      alert("❌ Falha na requisição: " + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith(".xls") || file.name.endsWith(".xlsx");
    const isDocx = file.name.endsWith(".docx");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const numeros = rows
          .slice(1)
          .map((row) => row[1])
          .filter((n) => !!n)
          .map((n) => n.toString().replace(/[^\d]/g, ""));

        setManualPhones(numeros.join(","));
      };
      reader.readAsArrayBuffer(file);
    } else if (isDocx) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        const numeros = text.match(/\d{12,13}/g)?.map((n) => n.trim()) || [];
        setManualPhones(numeros.join(","));
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Tipo de arquivo não suportado. Use Excel ou Word (.docx)");
    }
  };

  return (
    <>
      <section className="p-4 space-y-4 max-w-xl">
        <h2 className="text-xl font-semibold">Envio de Mensagem</h2>

        <div className="flex space-x-2">
          <button
            className={`btn ${activeTab === "manual" ? "bg-green-700 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("manual")}
          >
            Inserir manualmente
          </button>
          <button
            className={`btn ${activeTab === "contatos" ? "bg-green-700 text-white" : "bg-gray-200"}`}
            onClick={() => setShowSelectModal(true)}
          >
            Selecionar contatos
          </button>
        </div>

        <div className="input-excel">
          <label htmlFor="upload-excel" className="btn btn-secondary" style={{ cursor: "pointer" }}>
            Importar Excel (.xls, .xlsx)
          </label>
          <input
            id="upload-excel"
            type="file"
            accept=".xlsx,.xls,.docx"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </div>

        {/* Contador e balões */}
        {mergedPhones.length > 0 && (
          <div className="import-summary">
            <div className="import-counts">
              <span className="count-ok">{validPhones.length} OK</span>
              <span className="count-error">{invalidPhones.length} X</span>
            </div>

            <div className="phone-bubbles-container">
              {mergedPhones.map((num, index) => {
                const isValid = /^\d{12,13}$/.test(num);
                return (
                  <span key={index} className={`phone-bubble ${isValid ? "valid" : "invalid"}`}>
                    {num}
                    <span className={`icon-circle ${isValid ? "icon-valid" : "icon-invalid"}`}>
                      {isValid ? "✓" : "✗"}
                    </span>
                    <button
                      className={`remove-btn ${isValid ? "valid" : "invalid"}`}
                      onClick={() => {
                        const updatedManual = manualList.filter((p) => p !== num);
                        const updatedSelected = selectedPhones.filter((p) => p !== num);
                        setManualPhones(updatedManual.join(","));
                        setSelectedPhones(updatedSelected);
                      }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Campo de entrada e mensagem */}
        {activeTab === "manual" && (
          <input
            className="input w-full"
            placeholder="Digite um Número: (EX:Números: 55DDDX-XXXX-XXXX,55DDDX-XXXX-XXXX)"
            value={manualPhones}
            onChange={(e) => {
              const onlyDigitsAndComma = e.target.value.replace(/[^\d,]/g, "");
              setManualPhones(onlyDigitsAndComma);
            }}
          />
        )}

        <textarea
          className="input w-full"
          rows={6}
          placeholder="Digite a mensagem..."
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />

        <button
          className="btn"
          disabled={!phoneIsValid || !msgIsValid || sending}
          onClick={handleSubmit}
        >
          {sending ? "Enviando…" : "Enviar Mensagem"}
        </button>
      </section>

      {showSelectModal && (
        <ContactSelectModal
          contacts={contacts}
          selected={selectedPhones}
          onClose={() => setShowSelectModal(false)}
          onConfirm={(selected) => {
            setSelectedPhones(selected);
            setShowSelectModal(false);
          }}
        />
      )}
    </>
  );
}
