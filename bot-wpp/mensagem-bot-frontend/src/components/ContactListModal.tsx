import { useState } from "react";
import type { Contact } from "../types";
import ConfirmModal from "./ConfirmModal";
import "../styles/contact-list.css";

interface ContactListModalProps {
  contacts: Contact[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export default function ContactListModal({
  contacts,
  onClose,
  onRemove,
  onClearAll,
}: ContactListModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="modal-backdrop">
      <div className="contact-list-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Lista de Contatos</h2>

        {contacts.length === 0 ? (
          <p>Nenhum contato adicionado.</p>
        ) : (
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
                        className="btn btn-danger" 
                        id="btn-remove-contact"
                        onClick={() => onRemove(i)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="button-group">
              <button
                className="btn btn-danger" 
                id="btn-remove-all-contact"
                onClick={() => setShowConfirm(true)}
                disabled={contacts.length === 0}
              >
                Remover todos os contatos
              </button>
            </div>
          </>
        )}

        {showConfirm && (
          <ConfirmModal
            message="Tem certeza que deseja remover todos os contatos?"
            onConfirm={() => {
              onClearAll();
              setShowConfirm(false);
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}
