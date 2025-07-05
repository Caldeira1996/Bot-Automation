import type { Contact } from "../types";

interface ContactListProps {
  contacts: Contact[];
  onRemove: (index: number) => void;
}

export default function ContactList({ contacts, onRemove }: ContactListProps) {
  if (contacts.length === 0) {
    return <p>Nenhum contato adicionado ainda.</p>;
  }

  return (
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
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(i)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
