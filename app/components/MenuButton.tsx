import { useEffect, useRef, useState } from "react";
import type { ButtonType, ButtonVariant, ButtonSize } from "./Button";
import { getSizeClasses, getColorClasses, Button } from "./Button";
import { Panel } from "./Panel";

export interface MenuItem {
  title: string;
  action: () => Promise<void>;
}

export interface MenuButtonProps {
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function MenuButton({
  type = "primary",
  variant = "normal",
  size = "medium",
  disabled = false,
  children,
  ariaLabel,
}: MenuButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click-outside for dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative inline-block bg-white dark:bg-black" ref={dropdownRef}>
      <Button
        type={type}
        variant={variant}
        size={size}
        action={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        aria-label={ariaLabel || "Menu"}
      >
        <div className="aspect-square text-xl font-black">⋮</div>
      </Button>

      <div
        className={`${isDropdownOpen ? "" : "scale-y-0 -translate-y-1/2"} transition-transform duration-300 ease-in-out absolute right-0 top-full mt-1 z-50 bg-white p-2 dark:bg-black`}
      >
        {children}
      </div>
    </div>
  );
}
