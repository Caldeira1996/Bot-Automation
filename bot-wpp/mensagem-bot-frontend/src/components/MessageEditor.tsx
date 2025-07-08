import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Contact } from "../types";

interface MessageEditorProps {
  template: string;
  setTemplate: Dispatch<SetStateAction<string>>;
  contacts: Contact[];
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

  const manualList = manualPhones
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const allPhones = activeTab === "manual" ? manualList : selectedPhones;

  const allPhonesValid = allPhones.every((p) => /^\d{12,13}$/.test(p));
  const phoneIsValid = allPhones.length > 0 && allPhonesValid;
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
          numbers: allPhones,
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

  const togglePhone = (numero: string) => {
    setSelectedPhones((prev) =>
      prev.includes(numero)
        ? prev.filter((n) => n !== numero)
        : [...prev, numero]
    );
  };

  return (
    <section className="p-4 space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Envio de Mensagem</h2>

      <div className="flex space-x-2">
        <button
          className={`btn ${
            activeTab === "manual" ? "bg-green-700 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("manual")}
        >
          Inserir manualmente
        </button>
        <button
          className={`btn ${
            activeTab === "contatos" ? "bg-green-700 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("contatos")}
        >
          Selecionar contatos
        </button>
      </div>

      {activeTab === "manual" ? (
        <input
          className="input w-full"
          placeholder="Números: 55DDDXXXXXXXXX,55DDDXXXXXXXXX"
          value={manualPhones}
          onChange={(e) => {
            const onlyDigitsAndComma = e.target.value.replace(/[^\d,]/g, "");
            setManualPhones(onlyDigitsAndComma);
          }}
        />
      ) : (
        <div className="space-y-2 border p-2 rounded">
          {contacts.length === 0 ? (
            <p>Nenhum contato salvo.</p>
          ) : (
            contacts.map((c) => (
              <label key={c.telefone} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPhones.includes(c.telefone)}
                  onChange={() => togglePhone(c.telefone)}
                />
                <span>
                  {c.nome || "(Sem nome)"} ({c.telefone})
                </span>
              </label>
            ))
          )}
        </div>
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
  );
}
