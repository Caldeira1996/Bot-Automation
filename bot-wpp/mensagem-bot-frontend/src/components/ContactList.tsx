import { useState } from "react";
import type { Contact } from "../types";

import "../styles/contact-list.css"

interface ContactListProps {
  contacts: Contact[];
  onRemove: (index: number) => void;
}

export default function ContactList({ contacts, onRemove }: ContactListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contactToRemove, setContactToRemove] = useState<number | null>(null);

  if (contacts.length === 0) {
    return <p>Nenhum contato adicionado ainda.</p>;
  }

  function openModal(index: number) {
    setContactToRemove(index);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setContactToRemove(null);
  }

  function confirmRemove() {
    if (contactToRemove !== null) {
      onRemove(contactToRemove);
      closeModal();
    }
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i}>
              <td>{c.nome || "-"}</td>
              <td>{c.telefone}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => openModal(i)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal simples */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="Contact-List-modal">
            <h2>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir este contato?</p>
            <button onClick={confirmRemove} className="btn btn-danger">
              Sim, excluir
            </button>
            <button onClick={closeModal} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
