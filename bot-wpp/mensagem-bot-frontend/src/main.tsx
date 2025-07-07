import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { SenderNumberProvider } from "./components/SenderNumberContext"; // ⬅️ novo import
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Provider mantém o número disponível em todo o app */}
    <SenderNumberProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SenderNumberProvider>
  </React.StrictMode>
);
