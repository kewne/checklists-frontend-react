import { forwardRef, type ComponentProps } from "react";

const BASE_CLASSES =
  "w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 resize-none dark:bg-black dark:text-white dark:border-gray-700 dark:focus:ring-emerald-600";

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  function TextArea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={className ? `${BASE_CLASSES} ${className}` : BASE_CLASSES}
        {...props}
      />
    );
  }
);
