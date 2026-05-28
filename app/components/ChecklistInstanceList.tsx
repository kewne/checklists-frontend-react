import { type ApiLink } from "~/lib/api";
import { encodeApiUrl } from "../lib/encoding";
import { Button } from "./Button";
import { Link } from "./Link";

interface ChecklistInstanceListProps {
  items: ApiLink[];
  onDelete: (href: string) => () => Promise<void>;
}

interface ChecklistInstanceItemProps {
  item: ApiLink;
  onDelete: (href: string) => () => Promise<void>;
}

function ChecklistInstanceItem({ item, onDelete }: ChecklistInstanceItemProps) {
  return (
    <div className="flex px-4 py-3 items-center justify-between">
      <Link to={`/runs/show/${encodeApiUrl(item.href)}`}>
        {item.title ?? item.name}
      </Link>
      <Button variant="danger" action={onDelete(item.href)}>
        Delete
      </Button>
    </div>
  );
}

export function ChecklistInstanceList({
  items,
  onDelete,
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
      className="mt-4 divide-y divide-gray-100 border border-gray-200 bg-white"
    >
      {items.map((item) => (
        <li key={item.href} className="hover:bg-gray-50">
          <ChecklistInstanceItem item={item} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
