import { FiUserPlus, FiSettings, FiLogOut, FiEye, FiClock, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { startCheckout } from "./Checkout/StartCheckout";

import "../styles/sidebar.css"


interface SidebarProps {
  onAddContact: () => void;
  onViewContacts: () => void;
  onOpenSchedule: () => void;  // A função para abrir o modal de agendamento
}

export default function Sidebar({ onAddContact, onViewContacts, onOpenSchedule }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <button title="Adicionar Contato" onClick={onAddContact}>
        <FiUserPlus />
      </button>
      <button title="Ver Contatos" onClick={onViewContacts}>
        <FiEye />
      </button>
      <button title="Agendamentos de envio" onClick={onOpenSchedule}>
        <FiClock />
      </button>
      <button title="Assinar Plano Premium" onClick={startCheckout}>
        <FiShoppingCart />
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
