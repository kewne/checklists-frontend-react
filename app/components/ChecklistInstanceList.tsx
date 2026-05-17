import type { User } from "firebase/auth";
import { encodeApiUrl } from "../lib/encoding";
import type { HalLink } from "../lib/hal";
import { Button } from "./Button";
import { apiResourceActions } from "~/lib/api";
import { Link } from "./Link";

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
    <div className="flex px-4 py-3 items-center justify-between">
      <Link to={`/runs/show/${encodeApiUrl(item.href)}`}>
        {item.title ?? item.name}
      </Link>
      <Button type="danger" variant="outline" action={handleDelete}>
        Delete
      </Button>
    </div>
  );
}

export function ChecklistInstanceList({
  items,
  user,
  onRefresh,
}: ChecklistInstanceListProps) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-3 text-gray-500 text-sm">
        No checklist instances found.
      </div>
    );
  }
  return (
    <ul
      aria-label="checklist instances"
      className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
    >
      {items.map((item) => (
        <li key={item.href} className="hover:bg-gray-50">
          <ChecklistInstanceItem
            item={item}
            user={user}
            onDeleted={onRefresh}
          />
        </li>
      ))}
    </ul>
  );
}
