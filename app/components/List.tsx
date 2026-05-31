import React from "react";

interface ListProps {
  items: React.ReactNode[];
  ariaLabel?: string;
}

export function List({ items, ariaLabel }: ListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      aria-label={ariaLabel}
      className="mt-4 divide-y divide-gray-100 border border-gray-200 bg-white"
    >
      {items.map((item, index) => (
        <li key={index} className="hover:bg-gray-50">
          <div className="flex px-4 py-3 items-center justify-between">
            {item}
          </div>
        </li>
      ))}
    </ul>
  );
}
