import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import type { ButtonType, ButtonVariant, ButtonSize } from "./Button";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { ChevronDown } from "../icons/ChevronDown";
import { ChevronUp } from "../icons/ChevronUp";

export interface DrawerProps {
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function Drawer({
  type = "secondary",
  variant = "normal",
  size = "large",
  disabled = false,
  ariaLabel,
  children,
}: DrawerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLSpanElement>(null);
  const location = useLocation();

  const label = ariaLabel ?? t("nav.menu");

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on route change (also covers clicking a link inside the drawer)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  const close = () => {
    setIsOpen(false);
    toggleRef.current?.querySelector("button")?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      close();
    }
  };

  return (
    <div
      className="relative block"
      ref={drawerRef}
      onKeyDown={handleKeyDown}
    >
      <span ref={toggleRef} className="block">
        <Button
          type={type}
          variant={variant}
          size="full"
          action={() => (isOpen ? close() : setIsOpen(true))}
          disabled={disabled}
          aria-label={label}
        >
          <span className="flex items-center justify-between gap-2">
            {label}
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </span>
        </Button>
      </span>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />
          <div
            role="menu"
            aria-label={label}
            className="absolute inset-x-0"
            style={{
              top: toggleRef.current?.getBoundingClientRect().bottom ?? 0,
            }}
          >
            <Panel className="flex flex-col gap-2 max-w-4xl mx-auto px-4">
              {children}
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
