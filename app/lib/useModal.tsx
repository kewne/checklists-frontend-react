import React, { useCallback, useState } from "react";
import { Modal } from "~/components/Modal";
import type { ModalProps } from "~/components/Modal";

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  Modal: React.ComponentType<Omit<ModalProps, "isOpen" | "onClose">>;
}

export function useModal(initialOpen: boolean = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const ModalWrapper = (props: Omit<ModalProps, "isOpen" | "onClose">) => (
    <Modal isOpen={isOpen} onClose={close} {...props} />
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    Modal: ModalWrapper,
  };
}
