import { useState } from "react";
import type { Contact } from "./types";

import "./styles/main.css";
import "./styles/layout.css";

import ContactAddModal from "./components/ContactAddModal";
import ContactListModal from "./components/ContactListModal";
import MessageEditor from "./components/MessageEditor";
import ScheduleForm from "./components/ScheduleForm";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const handleAdd = (c: Contact[]) => setContacts((prev) => [...prev, ...c]);
  const handleRemove = (indexToRemove: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== indexToRemove));

  const handleClearAll = () => setContacts([]);
  return (
    <main className="container">
      <h1>Bot de Mensagens</h1>

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

      {addOpen && <ContactAddModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}

      <MessageEditor template={template} setTemplate={setTemplate} />
      <ScheduleForm onSchedule={(s) => console.log("Agendar", s)} />
    </main>
  );
}
