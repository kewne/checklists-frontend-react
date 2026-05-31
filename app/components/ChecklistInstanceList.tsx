import { type ApiLink } from "~/lib/api";
import { encodeApiUrl } from "../lib/encoding";
import { Button } from "./Button";
import { Link } from "./Link";
import { List } from "./List";

interface ChecklistInstanceListProps {
  items: ApiLink[];
  onDelete: (href: string) => () => Promise<void>;
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
    <List
      ariaLabel="checklist instances"
      items={items.map((item) => (
        <>
          <Link to={`/runs/show/${encodeApiUrl(item.href)}`}>
            {item.title ?? item.name}
          </Link>
          <Button variant="danger" action={onDelete(item.href)}>
            Delete
          </Button>
        </>
      ))}
    />
  );
}
