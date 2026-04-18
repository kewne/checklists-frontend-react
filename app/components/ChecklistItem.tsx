import { useState } from 'react';
import type { User } from 'firebase/auth';
import { useResource } from '../lib/useResource';
import type { HalLink } from '../lib/hal';

interface ChecklistItemProps {
  item: HalLink;
  user: User;
  onDelete: () => void;
}

export function ChecklistItem({ item, user, onDelete }: ChecklistItemProps) {
  const { delete: deleteResource } = useResource(item.href, user, { autoFetch: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteResource();
      onDelete();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete checklist'
      );
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <li className="px-4 py-3 text-sm text-gray-800 flex justify-between items-center">
        <span className="text-gray-500">Deleting...</span>
      </li>
    );
  }

  return (
    <li className="px-4 py-3 text-sm text-gray-800 flex justify-between items-center">
      <div className="flex-1">
        <div>{item.title ?? item.name}</div>
        {deleteError && (
          <div className="text-red-600 text-xs mt-1">{deleteError}</div>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Delete
      </button>
    </li>
  );
}
