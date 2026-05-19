import type { User } from "firebase/auth";
import { useRevalidator } from "react-router";
import { ChecklistItem } from "./ChecklistItem";
import type { ApiResource } from "~/lib/api";

interface ChecklistListProps {
  resource: ApiResource;
  user: User;
}

export function ChecklistList({ resource, user }: ChecklistListProps) {
  const { revalidate } = useRevalidator();
  const items = resource.getLinkArray("items");

  return (
    <ul
      aria-label="checklists"
      className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
    >
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">
          No checklists found.
        </li>
      ) : (
        items.map((item) => (
          <li key={item.href}>
            <ChecklistItem item={item} onDelete={revalidate} />
          </li>
        ))
      )}
    </ul>
  );
}
