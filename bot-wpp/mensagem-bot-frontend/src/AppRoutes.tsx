import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BotApp from "./App";
import Settings from "./pages/Settings";   // ⬅️ 1. importe a página

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<BotApp />} />

      {/* 2. adicione a rota explícita */}
      <Route path="/settings" element={<Settings />} />

      {/* rota coringa deve vir por último */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
