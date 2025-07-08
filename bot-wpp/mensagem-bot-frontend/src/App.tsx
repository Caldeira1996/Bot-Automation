import { useState, useEffect, useRef } from "react";
import type { Contact } from "./types";
import MessageEditor, { type MessageEditorRef } from "./components/MessageEditor";
import ContactAddModal from "./components/ContactAddModal";
import ContactListModal from "./components/ContactListModal";
import Sidebar from "./components/Sidebar";
import ScheduleForm from "./components/ScheduleForm";

import { FiUserPlus, FiUsers, FiFileText } from "react-icons/fi";
import "./App.css";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "contatos">("manual");
  const [showSelectModal, setShowSelectModal] = useState(false);

  const messageEditorRef = useRef<MessageEditorRef>(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);

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

  const handleOpenSchedule = () => {
  console.log("Abrindo modal de agendamento...");
  setScheduleOpen(true); // Muda o estado para 'true', que abre o modal
};

const handleCloseSchedule = () => {
  console.log("Fechando modal de agendamento...");
  setScheduleOpen(false); // Muda o estado para 'false', que fecha o modal
};

  const handleSchedule = (settings: { start: string; intervalMin: number; intervalMax: number }) => {
    const { start, intervalMin, intervalMax } = settings; // Desestruturando corretamente

    const startTime = new Date(start).getTime();
    const now = Date.now();
    const delay = startTime - now;

    const numbersToSend = contacts.map((c) => c.telefone);
    const message = template;

    if (!message || numbersToSend.length === 0) {
      alert("Preencha a mensagem e contatos.");
      return;
    }

    if (delay < 0) {
      alert("Horário inválido");
      return;
    }

    setTimeout(() => {
      console.log("⏰ Iniciando envio programado");

      let totalDelay = 0; // Iniciar totalDelay como 0

      // Envio de mensagens para todos os contatos
      numbersToSend.forEach((numero, index) => {
        // Calcular intervalo de envio aleatório entre intervalMin e intervalMax
        const interval =
          Math.floor(Math.random() * (intervalMax - intervalMin + 1)) + intervalMin;

        // Calcular o delay total para cada envio, considerando o intervalo
        totalDelay += index === 0 ? 0 : interval * 60 * 1000; // Multiplicar o intervalo (em minutos) por 60 para convertê-lo para milissegundos

        setTimeout(() => {
          fetch("http://localhost:3333/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numbers: [numero], message }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.error) {
                console.error("Erro ao enviar para", numero, res.error);
              } else {
                console.log("✅ Enviado para:", numero);
              }
            })
            .catch((err) =>
              console.error("❌ Erro na requisição:", err.message)
            );
        }, totalDelay); // Ajustar o tempo de envio conforme totalDelay
      });
    }, delay); // Ajustar o delay inicial
    console.log("Agendando com as configurações: ", settings);
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
            onClick={() => setShowSelectModal(true)}
            className={activeTab === "contatos" ? "active" : ""}
          >
            <FiUsers />
          </button>

          <button
            title="Importar Excel"
            onClick={() => messageEditorRef.current?.triggerFileInput()}
          >
            <FiFileText />
          </button>
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
          ref={messageEditorRef}
          template={template}
          setTemplate={setTemplate}
          contacts={contacts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showSelectModal={showSelectModal}
          setShowSelectModal={setShowSelectModal}
          hideControls={true} // aqui controla o esconde botoões
        />

        {/* Apenas uma instância do modal */}
        <ScheduleForm
          isOpen={scheduleOpen}
          onClose={handleCloseSchedule}
          onSchedule={handleSchedule}
        />
      </main>

      <Sidebar
        onAddContact={() => setAddOpen(true)}  // Exemplo de função de adicionar contato
        onViewContacts={() => setListOpen(true)}  // Exemplo de função de ver contatos
        onOpenSchedule={handleOpenSchedule}  // Função para abrir o agendamento
      />


    </>
  );
}
