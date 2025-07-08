import { FiUserPlus, FiUsers, FiSettings, FiHome, FiAtSign, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "../styles/sidebar.css"

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
      <button title="Sair" onClick={() => navigate("/Home")}>
        <FiLogOut />
      </button>
    </div>
  );
}
