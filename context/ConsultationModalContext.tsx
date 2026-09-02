"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConsultationModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ConsultationModalContext = createContext<ConsultationModalContextType | undefined>(
  undefined
);

export function ConsultationModalProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <ConsultationModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ConsultationModalContext.Provider>
  );
}

export function useConsultationModal() {
  const context = useContext(ConsultationModalContext);
  if (!context) {
    throw new Error("useConsultationModal must be used within a ConsultationModalProvider");
  }
  return context;
}
