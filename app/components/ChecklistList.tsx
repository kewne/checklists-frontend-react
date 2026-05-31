import { encodeApiUrl } from "../lib/encoding";
import { Button } from "./Button";
import { Link } from "./Link";
import { List } from "./List";
import type { ApiResource } from "~/lib/api";

interface ChecklistListProps {
  resource: ApiResource;
  onDelete: (href: string) => () => Promise<void>;
}

export function ChecklistList({ resource, onDelete }: ChecklistListProps) {
  const items = resource.getLinkArray("items");

  if (items.length === 0) {
    return (
      <div className="px-4 py-3 text-gray-500 text-sm">
        No checklists found.
      </div>
    );
  }

  return (
    <List
      ariaLabel="checklists"
      items={items.map((item) => (
        <>
          <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
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
