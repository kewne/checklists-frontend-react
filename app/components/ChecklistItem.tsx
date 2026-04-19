import { useState } from 'react';
import type { User } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router';
import { useHeadlessResource } from '../lib/useResource';
import { encodeApiUrl } from '../lib/encoding';
import type { HalLink } from '../lib/hal';

interface ChecklistItemProps {
  item: HalLink;
  user: User;
  onDelete: () => void;
}

export function ChecklistItem({ item, user, onDelete }: ChecklistItemProps) {
  const { state, post, delete: deleteResource } = useHeadlessResource(item.href, user);
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteResource();
    onDelete();
  };

  const handleRun = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRunning(true);
    try {
      const location = await post({});
      if (location) {
        navigate(`/checklist-run/${encodeApiUrl(location)}`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const isDeleting = state.status === 'updating';
  const deleteError = state.status === 'error' ? state.error.message : null;

  return (
    <li className="flex justify-between items-center">
      <NavLink
        to={`/checklists/${encodeApiUrl(item.href)}`}
        className="flex-1 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <div className="font-medium text-indigo-600">{item.title ?? item.name}</div>
        {deleteError && (
          <div className="text-red-600 text-xs mt-1">{deleteError}</div>
        )}
      </NavLink>
      <button
        onClick={handleRun}
        disabled={isRunning || isDeleting}
        className="mr-2 px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? 'Creating run...' : 'Run'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting || isRunning}
        className="mr-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </li>
  );
}
