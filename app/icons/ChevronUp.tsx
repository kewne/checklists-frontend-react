interface ChevronUpProps {
  className?: string;
}

export function ChevronUp({ className = "w-4 h-4" }: ChevronUpProps) {
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
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}
