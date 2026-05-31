import React, { useEffect } from "react";
import { Panel } from "./Panel";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropOpacity?: "5" | "10" | "20" | "30" | "40" | "50";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  backdropOpacity = "10",
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const backdropClasses = {
    "5": "bg-black/5",
    "10": "bg-black/10",
    "20": "bg-black/20",
    "30": "bg-black/30",
    "40": "bg-black/40",
    "50": "bg-black/50",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClasses[backdropOpacity]}`}
      onClick={handleBackdropClick}
    >
      <Panel className={`w-full max-w-sm mx-4 ${className}`}>{children}</Panel>
    </div>
  );
}
