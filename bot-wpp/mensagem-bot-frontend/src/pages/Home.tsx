import { useNavigate } from "react-router-dom";

import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="container center">
      <h1 className="welcome">Bem-vindo ao Bot de Mensagens</h1>
      <button className="btn btn-primary" 
      id="btn-start"
      onClick={() => navigate("/app")}>
        Iniciar
      </button>
    </main>
  );
}
