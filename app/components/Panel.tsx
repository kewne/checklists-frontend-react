import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  const baseClasses =
    "p-4 ring ring-emerald-700 bg-white focus-within:ring-emerald-500 dark:bg-black dark:ring-emerald-600 dark:focus-within:ring-emerald-400";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return <div className={combinedClasses}>{children}</div>;
}
