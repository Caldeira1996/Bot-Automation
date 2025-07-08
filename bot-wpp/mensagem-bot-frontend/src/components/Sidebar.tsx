import { FiUserPlus, FiUsers, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onAddContact: () => void;
  onViewContacts: () => void;
}

export default function Sidebar({ onAddContact, onViewContacts }: SidebarProps) {
  const navigate = useNavigate();
  return (
     <div className="sidebar">
      <button title="Adicionar Contato" onClick={onAddContact}>
        <FiUserPlus />
      </button>
      <button title="Ver Contatos" onClick={onViewContacts}>
        <FiUsers />
      </button>
      <button title="Configurações" onClick={() => navigate("/settings")}>
        <FiSettings />
      </button>
    </div>
  );
}
