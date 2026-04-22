import type { User } from "firebase/auth";
import { Link } from "react-router";
import { encodeApiUrl } from "../lib/encoding";
import type { HalLink } from "../lib/hal";
import { useHeadlessResource, useResource } from "../lib/useResource";

interface ChecklistInstanceListProps {
  href: string;
  user: User;
}

interface ChecklistInstanceItemProps {
  item: HalLink;
  user: User;
  onDeleted: () => void;
}

function ChecklistInstanceItem({ item, user, onDeleted }: ChecklistInstanceItemProps) {
  const { state, delete: deleteInstance } = useHeadlessResource(item.href, user);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteInstance();
    onDeleted();
  };

  const isDeleting = state.status === 'updating' && state.action === 'delete';

  return (
    <li className="flex items-center text-sm text-gray-800">
      <Link
        to={`/checklist-run/${encodeApiUrl(item.href)}`}
        className="flex-1 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="font-medium text-indigo-600">{item.title ?? item.name}</div>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="mr-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </li>
  );
}

export function ChecklistInstanceList({ href, user }: ChecklistInstanceListProps) {
  const { state, get } = useResource(href, user);

  if (state.status === 'loading') {
    return (
      <div className="mt-4">
        <div className="animate-pulse text-gray-500 text-sm">Loading checklist instances...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mt-4 text-red-600 text-sm">Failed to load checklist instances: {state.error.message}</div>
    );
  }

  const items = state.resource.getLinkArray('items');

  return (
    <ul aria-label="checklist instances" className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md">
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">No checklist instances found.</li>
      ) : (
        items.map((item) => (
          <ChecklistInstanceItem key={item.href} item={item} user={user} onDeleted={get} />
        ))
      )}
    </ul>
  );
}
