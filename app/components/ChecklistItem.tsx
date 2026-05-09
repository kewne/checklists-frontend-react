import type { User } from "firebase/auth";
import { Link } from "react-router";
import { encodeApiUrl } from "../lib/encoding";
import type { HalLink } from "../lib/hal";
import { Button } from "./Button";
import { apiResourceActions } from "~/lib/api";

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
    <>
      <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 ">
        <Link
          to={`/checklists/show/${encodeApiUrl(item.href)}`}
          className="flex-1 text-sm text-gray-800 transition-colors -ml-4 pl-4"
        >
          <div className="font-medium text-indigo-600">
            {item.title ?? item.name}
          </div>
        </Link>
        <Button type="danger" variant="outline" action={handleDelete}>
          Delete
        </Button>
      </li>
    </>
  );
}
