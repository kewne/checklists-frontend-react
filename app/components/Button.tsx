import { useState } from "react";

export type ButtonType = "primary" | "secondary";
export type ButtonVariant = "normal" | "danger";
export type ButtonSize = "small" | "medium" | "large" | "full";

export interface ButtonProps {
    type?: ButtonType;
    variant?: ButtonVariant;
    size?: ButtonSize | [width: ButtonSize, height: ButtonSize];
    action: (() => Promise<void>) | "submit";
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
                    return "bg-emerald-500 border-emerald-500 outline-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400 hover:outline-emerald-400 active:border-emerald-400 hover:outline-emerald-400";
                case "secondary":
                    return "text-emerald-500 border-transparent outline-emerald-500 hover:border-emerald-500 active:border-emerald-300";
            }
            break;
        case "danger":
            switch (type) {
                case "primary":
                    return "bg-red-600 border-red-600 outline-red-600 hover:bg-red-400 hover:border-red-400 hover:outline-red-400 text-white";
                case "secondary":
                    return "text-red-500 border-transparent hover:border-red-300 active:outline-red-300 active:border-red-300";
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
