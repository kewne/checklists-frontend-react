import type { User } from 'firebase/auth';
import { useResource } from '../lib/useResource';
import type { HalLink } from '../lib/hal';

interface ChecklistItemProps {
  item: HalLink;
  user: User;
  onDelete: () => void;
}

export function ChecklistItem({ item, user, onDelete }: ChecklistItemProps) {
  const { state, delete: deleteResource } = useResource(item.href, user, { autoFetch: false });

  const handleDelete = async () => {
      await deleteResource();
      onDelete();
  };

  const isDeleting = state.status === 'loading';
  const deleteError = state.status === 'error' ? state.error.message : null;

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
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </li>
  );
}
