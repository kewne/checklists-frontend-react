import { Link as RouterLink } from "react-router";

export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function Link({ to, children, className }: LinkProps) {
  const baseClasses = "text-indigo-600 hover:underline";
  return (
    <RouterLink to={to} className={className ? `${baseClasses} ${className}` : baseClasses}>
      {children}
    </RouterLink>
  );
}
