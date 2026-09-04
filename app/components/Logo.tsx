interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClass = sizeMap[size];
  const baseClass = className ? `${sizeClass} ${className}` : sizeClass;

  return (
    <img
      src="/logo_checkoff.svg"
      alt="CheckOff Logo"
      className={baseClass}
      aria-hidden="true"
    />
  );
}
