import { useState } from "react";

export type ButtonType = "primary" | "secondary";
export type ButtonVariant = "normal" | "danger";
export type ButtonSizeOpts = "small" | "medium" | "large" | "full";
export type ButtonSize =
  | ButtonSizeOpts
  | [width: ButtonSizeOpts, height: ButtonSizeOpts];

export interface ButtonProps {
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize | [width: ButtonSize, height: ButtonSize];
  action: (() => void | Promise<void>) | "submit";
  disabled?: boolean;
  "aria-label"?: string;
  children: React.ReactNode;
}

export function getSizeClasses(size: Required<ButtonProps>["size"]) {
  const [width, height] = typeof size === "string" ? [size, size] : size;
  let widthClasses: string;
  switch (width) {
    case "small":
      widthClasses = "px-1.5";
      break;
    case "medium":
      widthClasses = "px-2";
      break;
    case "large":
      widthClasses = "px-4";
      break;
    case "full":
      widthClasses = "px-4 w-full";
      break;
    default:
      throw new Error(`Unsupported width ${width}`);
  }
  let heightClasses: string;
  switch (height) {
    case "small":
      heightClasses = "py-0.5";
      break;
    case "medium":
      heightClasses = "py-1";
      break;
    case "large":
      heightClasses = "py-2";
      break;
    case "full":
      heightClasses = "py-2 h-full";
      break;
    default:
      throw new Error(`Unsupported height ${height}`);
  }
  const textClass =
    height === "small" || width === "small" ? "text-xs" : "text-sm";
  return `${widthClasses} ${heightClasses} ${textClass}`;
}

export function getColorClasses(type: ButtonType, variant: ButtonVariant) {
  switch (variant) {
    case "normal":
      switch (type) {
        case "primary":
          return [
            "text-white",
            "bg-emerald-700",
            "border-emerald-700",
            "outline-emerald-700",
            "hover:bg-emerald-500",
            "hover:border-emerald-500",
            "hover:outline-emerald-500",
            "focus-visible:bg-emerald-500",
            "focus-visible:border-emerald-500",
            "focus-visible:outline-emerald-500",
            "active:border-emerald-500",
            "dark:bg-emerald-600",
            "dark:border-emerald-600",
            "dark:outline-emerald-600",
            "dark:text-gray-900",
            "dark:hover:bg-emerald-400",
            "dark:hover:border-emerald-400",
            "dark:hover:outline-emerald-400",
            "dark:focus-visible:bg-emerald-400",
            "dark:focus-visible:border-emerald-400",
            "dark:focus-visible:outline-emerald-400",
            "dark:active:border-emerald-400",
          ].join(" ");
        case "secondary":
          return [
            "text-emerald-700",
            "border-transparent",
            "outline-emerald-700",
            "hover:border-emerald-500",
            "hover:outline-emerald-500",
            "focus-visible:border-emerald-500",
            "active:border-emerald-500",
            "dark:text-emerald-600",
            "dark:outline-emerald-600",
            "dark:hover:border-emerald-400",
            "dark:hover:outline-emerald-400",
            "dark:focus-visible:border-emerald-400",
            "dark:active:border-emerald-400",
          ].join(" ");
      }
      break;
    case "danger":
      switch (type) {
        case "primary":
          return [
            "text-white",
            "bg-rose-600",
            "border-rose-600",
            "outline-rose-600",
            "hover:bg-rose-400",
            "hover:border-rose-400",
            "hover:outline-rose-400",
            "focus-visible:bg-rose-400",
            "focus-visible:border-rose-400",
            "focus-visible:outline-rose-400",
          ].join(" ");
        case "secondary":
          return [
            "text-rose-600",
            "border-transparent",
            "hover:border-rose-400",
            "hover:outline-rose-400",
            "focus-visible:border-rose-400",
            "active:outline-rose-400",
            "active:border-rose-400",
          ].join(" ");
      }
  }
}

export function Button({
  type = "secondary",
  variant = "normal",
  size = "medium",
  action,
  disabled = false,
  "aria-label": ariaLabel,
  children,
}: ButtonProps) {
  const [isWorking, setWorking] = useState(false);

  const sizeClasses = getSizeClasses(size);
  const baseClasses = `${sizeClasses} font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-transform border-1 outline-1 active:[border-style:inset] active:[outline-style:inset]`;
  const colorClasses = getColorClasses(type, variant);

  const isSubmit = action === "submit";

  const handleAction = isSubmit
    ? undefined
    : async () => {
        setWorking(true);
        try {
          await (action as () => Promise<void>)();
        } finally {
          setWorking(false);
        }
      };

  return (
    <button
      type={isSubmit ? "submit" : "button"}
      onClick={handleAction}
      disabled={disabled || isWorking}
      aria-label={ariaLabel}
      className={`${baseClasses} ${colorClasses}`}
    >
      {children}
    </button>
  );
}
