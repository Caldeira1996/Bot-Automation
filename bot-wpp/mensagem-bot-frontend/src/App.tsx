import { useState, useEffect, useRef } from "react";
import type { Contact } from "./types";
import MessageEditor from "./components/MessageEditor";
import ContactAddModal from "./components/ContactAddModal";
import ContactListModal from "./components/ContactListModal";
import ScheduleForm from "./components/ScheduleForm";
import Sidebar from "./components/Sidebar";

import { FiUserPlus, FiUsers, FiFileText } from "react-icons/fi";
import "./App.css";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "contatos">("manual");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const salvos = localStorage.getItem("contatos");
    if (salvos) {
      try {
        setContacts(JSON.parse(salvos));
      } catch {
        console.error("Erro ao carregar contatos");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contatos", JSON.stringify(contacts));
  }, [contacts]);

  const handleAdd = (c: Contact[]) => setContacts((prev) => [...prev, ...c]);
  const handleRemove = (indexToRemove: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== indexToRemove));
  const handleClearAll = () => setContacts([]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <main className="container" style={{ position: "relative" }}>
        {/* Barra de ícones flutuante */}
        <div className="icon-tab-bar-floating">
          <button
            title="Inserir Manualmente"
            onClick={() => setActiveTab("manual")}
            className={activeTab === "manual" ? "active" : ""}
          >
            <FiUserPlus />
          </button>
          <button
            title="Selecionar Contatos"
            onClick={() => setActiveTab("contatos")}
            className={activeTab === "contatos" ? "active" : ""}
          >
            <FiUsers />
          </button>
          <button title="Importar Excel" onClick={handleFileClick}>
            <FiFileText />
          </button>
          <input
            type="file"
            accept=".xlsx,.xls,.docx"
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>

        <h1>Bot de Mensagens</h1>

        {listOpen && (
          <ContactListModal
            contacts={contacts}
            onClose={() => setListOpen(false)}
            onRemove={handleRemove}
            onClearAll={handleClearAll}
          />
        )}

        {addOpen && (
          <ContactAddModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />
        )}

        <MessageEditor
          template={template}
          setTemplate={setTemplate}
          contacts={contacts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <ScheduleForm onSchedule={(s) => console.log("Agendar", s)} />
      </main>

      <Sidebar
        onAddContact={() => setAddOpen(true)}
        onViewContacts={() => setListOpen(true)}
      />
    </>
  );
}
