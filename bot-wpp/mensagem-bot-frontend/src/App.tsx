import { useState, useEffect } from "react";
import type { Contact } from "./types";
import { Link } from "react-router-dom";

import ContactAddModal from "./components/ContactAddModal";
import ContactListModal from "./components/ContactListModal";
import MessageEditor from "./components/MessageEditor";
import ScheduleForm from "./components/ScheduleForm";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

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

  return (
    <main className="container">
      <h1>Bot de Mensagens</h1>

      <Link to="/settings" className="text-sm underline">
        Configurações
      </Link>

      <div className="button-group">
        <button className="btn" onClick={() => setAddOpen(true)}>
          Adicionar Contatos
        </button>

        <button className="btn" onClick={() => setListOpen(true)}>
          Ver Contatos ({contacts.length})
        </button>
      </div>

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
      />

      <ScheduleForm onSchedule={(s) => console.log("Agendar", s)} />
    </main>
  );
}
