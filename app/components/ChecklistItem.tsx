import type { User } from "firebase/auth";
import { encodeApiUrl } from "../lib/encoding";
import type { HalLink } from "../lib/hal";
import { Button } from "./Button";
import { apiResourceActions } from "~/lib/api";
import { Link } from "./Link";

interface ChecklistItemProps {
  item: HalLink;
  user: User;
  onDelete: () => void;
}

export function ChecklistItem({ item, user, onDelete }: ChecklistItemProps) {
  const { delete: deleteResource } = apiResourceActions(item.href, user);

  const handleDelete = async () => {
    await deleteResource();
    onDelete();
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
      <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
        {item.title ?? item.name}
      </Link>
      <Button type="danger" variant="outline" action={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
