import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BotApp from "./App";           // seu componente que tem o modal, etc.

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<BotApp />} />
      {/* rota coringa: qualquer URL desconhecida redireciona pra home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
