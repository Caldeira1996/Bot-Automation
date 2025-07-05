import { useForm } from "react-hook-form";
import type { Contact } from "../types";

interface ContactTableProps {
  contacts: Contact[];
  onAdd: (contacts: Contact[]) => void;
}

export default function ContactTable({ contacts, onAdd }: ContactTableProps) {
  const { register, handleSubmit, reset } = useForm<Contact>();

  return (
    <section>
      <h2>Contatos</h2>
      <form
        onSubmit={handleSubmit((data) => {
          onAdd([data]);
          reset();
        })}
      >
        <input className="input" {...register("nome")} placeholder="Nome" />
        <input className="input" {...register("telefone")} placeholder="Telefone" />
        <button className="btn" type="submit">Adicionar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i}>
              <td>{c.nome}</td>
              <td>{c.telefone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
