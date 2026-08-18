interface ChevronDownProps {
  className?: string;
}

export function ChevronDown({ className = "w-4 h-4" }: ChevronDownProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}
