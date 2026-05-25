import { encodeApiUrl } from "../lib/encoding";
import { Button } from "./Button";
import { type ApiLink } from "~/lib/api";
import { Link } from "./Link";

interface ChecklistItemProps {
  item: ApiLink;
  onDelete: (href: string) => () => Promise<void>;
}

export function ChecklistItem({ item, onDelete }: ChecklistItemProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
      <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
        {item.title ?? item.name}
      </Link>
      <Button type="danger" variant="outline" action={onDelete(item.href)}>
        Delete
      </Button>
    </div>
  );
}
