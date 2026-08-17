interface HexCheckboxProps {
  className?: string;
}

export function HexCheckbox({ className = "h-5 w-5" }: HexCheckboxProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.5 L20.66 7.25 V16.75 L12 21.5 L3.34 16.75 V7.25 Z" />
    </svg>
  );
}
