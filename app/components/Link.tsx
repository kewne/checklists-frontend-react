import { Link as RouterLink } from "react-router";
import { getSizeClasses, type ButtonSize } from "~/components/Button";

export type LinkVariant = "inline" | "inline-block" | "row";

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
            return "underline decoration decoration-gray-200 underline-offset-4 hover:decoration-indigo-400";
        case "inline-block":
            return "underline decoration decoration-gray-200 inline-block rounded border border-gray-200 hover:outline hover:decoration-indigo-400";
        case "row":
            return "block hover:bg-gray-100";
    }
}

export function Link({
  to,
  children,
  className,
  variant = "inline",
  size,
}: LinkProps) {
  const baseClasses = "text-indigo-600 active:text-indigo-400 underline-offset-4 transition ease-in-out";
  const sizeClasses = getSizeClasses(size ?? "medium");
  const classes = [getVariantClasses(variant), sizeClasses, baseClasses, className]
    .filter(Boolean)
    .join(" ");
  return (
    <RouterLink to={to} className={classes}>
      {children}
    </RouterLink>
  );
}
