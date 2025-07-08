import { useState, useMemo } from "react";
import type { Contact } from "../types";

import "../styles/Contact-Select-Modal.css"

interface ContactSelectModalProps {
  contacts: Contact[];
  selected: string[]; // números selecionados
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
}

export default function ContactSelectModal({
  contacts,
  selected,
  onClose,
  onConfirm,
}: ContactSelectModalProps) {
  const [search, setSearch] = useState("");

  // Filtra contatos por nome ou telefone (case insensitive)
  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.nome.toLowerCase().includes(lower) ||
        c.telefone.includes(lower)
    );
  }, [contacts, search]);

  const [tempSelected, setTempSelected] = useState<string[]>(selected);

  const toggle = (numero: string) => {
    setTempSelected((prev) =>
      prev.includes(numero)
        ? prev.filter((n) => n !== numero)
        : [...prev, numero]
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal p-4 max-w-md mx-auto bg-white rounded shadow">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="mb-4 text-xl font-semibold">Selecionar Contatos</h2>

        <input
          type="search"
          placeholder="Buscar por nome ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full mb-4"
        />

        <div className="max-h-64 overflow-auto mb-4">
          {filtered.length === 0 && <p>Nenhum contato encontrado.</p>}
          {filtered.map((c) => (
            <label key={c.telefone} className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={tempSelected.includes(c.telefone)}
                onChange={() => toggle(c.telefone)}
              />
              <span>
                {c.nome || "(Sem nome)"} ({c.telefone})
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={() => onConfirm(tempSelected)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
