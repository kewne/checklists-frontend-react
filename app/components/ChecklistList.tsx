import { ChecklistItem } from "./ChecklistItem";
import type { ApiResource } from "~/lib/api";

interface ChecklistListProps {
  resource: ApiResource;
  onDelete: (href: string) => () => Promise<void>;
}

export function ChecklistList({ resource, onDelete }: ChecklistListProps) {
  const items = resource.getLinkArray("items");

  return (
    <ul
      aria-label="checklists"
      className="mt-4 divide-y divide-gray-100 border border-gray-200"
    >
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">
          No checklists found.
        </li>
      ) : (
        items.map((item) => (
          <li key={item.href}>
            <ChecklistItem item={item} onDelete={onDelete} />
          </li>
        ))
      )}
    </ul>
  );
}
