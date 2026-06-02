import { Link as RouterLink } from "react-router";
import { getSizeClasses, type ButtonSize } from "~/components/Button";

export type LinkVariant = "inline" | "inline-block";

export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: LinkVariant;
  size?: ButtonSize;
}

function getVariantClasses(variant: LinkVariant) {
  switch (variant) {
    case "inline":
      return [
        "text-gray-700",
        "underline",
        "decoration",
        "decoration-gray-400",
        "underline-offset-4",
        "border",
        "border-transparent",
        "outline-transparent",
        "hover:decoration-emerald-500",
        "focus-visible:border",
        "focus-visible:outline",
        "focus-visible:border-emerald-500",
        "focus-visible:outline-emerald-500",
        "focus-visible:decoration-emerald-500",
      ].join(" ");
    case "inline-block":
      return [
        "bg-white",
        "underline",
        "decoration",
        "decoration-gray-400",
        "inline-block",
        "border",
        "border-gray-200",
        "outline",
        "outline-transparent",
        "hover:border-emerald-500",
        "hover:outline",
        "hover:outline-emerald-500",
        "hover:decoration-emerald-500",
        "focus-visible:border-emerald-500",
        "focus-visible:outline-emerald-500",
        "focus-visible:decoration-emerald-500",
      ].join(" ");
  }
}

export function Link({
  to,
  children,
  className,
  variant = "inline",
  size,
}: LinkProps) {
  const baseClasses =
    "text-emerald-700 active:text-emerald-600 underline-offset-4";
  const sizeClasses = getSizeClasses(size ?? "medium");
  const classes = [
    getVariantClasses(variant),
    sizeClasses,
    baseClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <RouterLink to={to} className={classes}>
      {children}
    </RouterLink>
  );
}
