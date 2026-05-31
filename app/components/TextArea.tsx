import type { ComponentProps } from "react";

const BASE_CLASSES =
  "w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 resize-none";

export function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={className ? `${BASE_CLASSES} ${className}` : BASE_CLASSES}
      {...props}
    />
  );
}
