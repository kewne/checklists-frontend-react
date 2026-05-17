import { Link as RouterLink } from "react-router";
import { getSizeClasses, type ButtonSize } from "~/components/Button";

export type LinkVariant = 'inline' | 'block';

export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: LinkVariant;
  size?: ButtonSize;
}

export function Link({ to, children, className, variant = 'inline', size }: LinkProps) {
  const baseClasses = "text-indigo-600 underline decoration-dotted underline-offset-4 hover:decoration-solid active:text-indigo-400";
  const variantClasses = variant === 'block' ? "block bg-gray-100 hover:bg-gray-200 rounded" : "";
  const sizeClasses = size ? getSizeClasses(size) : "";
  const classes = [variantClasses, sizeClasses, baseClasses, className].filter(Boolean).join(" ");
  return (
    <RouterLink to={to} className={classes}>
      {children}
    </RouterLink>
  );
}
