import { createContext, useContext, useState, useEffect } from "react";

type SenderCtx = {
  senderNumber: string;
  setSenderNumber: (num: string) => void;
};

const SenderNumberContext = createContext<SenderCtx | null>(null);

export const SenderNumberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [senderNumber, setSenderNumber] = useState("");

  // carrega do localStorage na 1ª render
  useEffect(() => {
    const saved = localStorage.getItem("senderNumber");
    if (saved) setSenderNumber(saved);
  }, []);

  // salva sempre que mudar
  useEffect(() => {
    if (senderNumber) localStorage.setItem("senderNumber", senderNumber);
  }, [senderNumber]);

  return (
    <SenderNumberContext.Provider value={{ senderNumber, setSenderNumber }}>
      {children}
    </SenderNumberContext.Provider>
  );
};

export const useSenderNumber = () => {
  const ctx = useContext(SenderNumberContext);
  if (!ctx) throw new Error("useSenderNumber precisa estar dentro do Provider");
  return ctx;
};
