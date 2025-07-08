import { useState, useEffect } from "react";
import type { Contact } from "./types";
import MessageEditor from "./components/MessageEditor";
import ContactAddModal from "./components/ContactAddModal";
import ContactListModal from "./components/ContactListModal";
import ScheduleForm from "./components/ScheduleForm";
import Sidebar from "./components/Sidebar"; // <-- ✅ IMPORTADO

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
    <>
      <main className="container">
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
