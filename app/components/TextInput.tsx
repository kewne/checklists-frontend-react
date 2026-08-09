import type { ComponentProps } from "react";

const BASE_CLASSES =
  "w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:bg-black dark:text-white dark:border-gray-700 dark:focus:ring-emerald-600";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={className ? `${BASE_CLASSES} ${className}` : BASE_CLASSES}
      {...props}
    />
  );
}
