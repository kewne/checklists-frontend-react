import type { User } from 'firebase/auth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { encodeApiUrl } from '../lib/encoding';
import type { HalLink } from '../lib/hal';
import { useHeadlessResource } from '../lib/useResource';
import { Button } from './Button';

interface ChecklistItemProps {
  item: HalLink;
  user: User;
  onDelete: () => void;
}

export function ChecklistItem({ item, user, onDelete }: ChecklistItemProps) {
  const { state, post, delete: deleteResource } = useHeadlessResource(item.href, user);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runTitle, setRunTitle] = useState('');

  const handleDelete = async () => {
    await deleteResource();
    onDelete();
  };

  const handleRun = async () => {
    try {
      const location = await post({});
      if (location) {
        navigate(`/runs/show/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      // Error is handled by the hook state
    }
  };

  const handleRunWithTitle = async () => {
    try {
      const location = await post({ title: runTitle });
      if (location) {
        setIsModalOpen(false);
        setRunTitle('');
        navigate(`/runs/show/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      // Error is handled by the hook state
    }
  };

  const handleModalCancel = async () => {
    setIsModalOpen(false);
    setRunTitle('');
  };

  const isRunning = state.status === 'updating' && state.action === 'post';
  const isDeleting = state.status === 'updating' && state.action === 'delete';
  const deleteError = state.status === 'error' ? state.error.message : null;

  return (
    <>
      <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 ">
        <Link
          to={`/checklists/show/${encodeApiUrl(item.href)}`}
          className="flex-1 text-sm text-gray-800 transition-colors -ml-4 pl-4"
        >
          <div className="font-medium text-indigo-600">{item.title ?? item.name}</div>
          {deleteError && (
            <div className="text-red-600 text-xs mt-1">{deleteError}</div>
          )}
        </Link>
        <Button
          type="danger"
          variant="outline"
          action={handleDelete}
          disabled={state.status === 'updating'}
        >
          Delete
        </Button>
      </li>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Run with title</h2>
            <label htmlFor="run-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="run-title"
              type="text"
              value={runTitle}
              onChange={(e) => setRunTitle(e.target.value)}
              placeholder="Enter a title for this run"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="secondary"
                variant="text"
                action={handleModalCancel}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                action={handleRunWithTitle}
                disabled={isRunning}
              >
                {isRunning ? 'Creating run...' : 'Run'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
