import { Link as RouterLink } from "react-router";
import { getSizeClasses, type ButtonSize } from "~/components/Button";

export type LinkVariant = "inline" | "inline-block";

export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: LinkVariant;
  size?: ButtonSize;
  target?: string;
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
        "dark:text-gray-100",
        "dark:decoration-gray-500",
        "dark:hover:decoration-emerald-600",
        "dark:focus-visible:border-emerald-600",
        "dark:focus-visible:outline-emerald-600",
        "dark:focus-visible:decoration-emerald-600",
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
        "dark:bg-black",
        "dark:text-gray-100",
        "dark:border-gray-700",
        "dark:decoration-gray-500",
        "dark:hover:border-emerald-600",
        "dark:hover:outline-emerald-600",
        "dark:hover:decoration-emerald-600",
        "dark:focus-visible:border-emerald-600",
        "dark:focus-visible:outline-emerald-600",
        "dark:focus-visible:decoration-emerald-600",
      ].join(" ");
  }
}

export function Link({
  to,
  children,
  className,
  variant = "inline",
  size,
  target,
}: LinkProps) {
  const baseClasses =
    "text-emerald-700 active:text-emerald-600 underline-offset-4";
  const sizeClasses = variant !== "inline" ? getSizeClasses(size ?? "medium") : null;
  const classes = [
    getVariantClasses(variant),
    sizeClasses,
    baseClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <RouterLink to={to} className={classes} target={target}>
      {children}
    </RouterLink>
  );
}
