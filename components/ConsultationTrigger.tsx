"use client";

import { ReactNode } from "react";
import { useConsultationModal } from "@/context/ConsultationModalContext";

interface ConsultationTriggerProps {
  children: ReactNode;
  className?: string;
}

export default function ConsultationTrigger({
  children,
  className,
}: ConsultationTriggerProps) {
  const { openModal } = useConsultationModal();

  return (
    <button type="button" className={className} onClick={openModal}>
      {children}
    </button>
  );
}
