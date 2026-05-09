import type { User } from "firebase/auth";
import { Link } from "react-router";
import { encodeApiUrl } from "../lib/encoding";
import type { HalLink } from "../lib/hal";
import { Button } from "./Button";
import { apiResourceActions } from "~/lib/api";

interface ChecklistInstanceListProps {
  items: HalLink[];
  user: User;
  onRefresh: () => void;
}

interface ChecklistInstanceItemProps {
  item: HalLink;
  user: User;
  onDeleted: () => void;
}

function ChecklistInstanceItem({
  item,
  user,
  onDeleted,
}: ChecklistInstanceItemProps) {
  const { delete: deleteInstance } = apiResourceActions(item.href, user);

  const handleDelete = async () => {
    await deleteInstance();
    onDeleted();
  };

  return (
    <li className="flex items-center text-sm text-gray-800">
      <Link
        to={`/runs/show/${encodeApiUrl(item.href)}`}
        className="flex-1 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="font-medium text-indigo-600">
          {item.title ?? item.name}
        </div>
      </Link>
      <span className="mr-4">
        <Button type="danger" variant="outline" action={handleDelete}>
          Delete
        </Button>
      </span>
    </li>
  );
}

export function ChecklistInstanceList({
  items,
  user,
  onRefresh,
}: ChecklistInstanceListProps) {
  return (
    <ul
      aria-label="checklist instances"
      className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
    >
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">
          No checklist instances found.
        </li>
      ) : (
        items.map((item) => (
          <ChecklistInstanceItem
            key={item.href}
            item={item}
            user={user}
            onDeleted={onRefresh}
          />
        ))
      )}
    </ul>
  );
}
