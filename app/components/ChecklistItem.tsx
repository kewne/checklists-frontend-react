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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runTitle, setRunTitle] = useState('');

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteResource();
    onDelete();
  };

  const handleRun = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const location = await post({});
      if (location) {
        navigate(`/checklist-run/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      // Error is handled by the hook state
    }
  };

  const handleRunWithTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const location = await post({ title: runTitle });
      if (location) {
        setIsModalOpen(false);
        setRunTitle('');
        navigate(`/checklist-run/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      // Error is handled by the hook state
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setRunTitle('');
  };

  const isRunning = state.status === 'updating' && state.action === 'post';
  const isDeleting = state.status === 'updating' && state.action === 'delete';
  const deleteError = state.status === 'error' ? state.error.message : null;

  return (
    <>
      <li className="flex justify-between items-center">
        <NavLink
          to={`/checklist/${encodeApiUrl(item.href)}`}
          className="flex-1 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-indigo-600">{item.title ?? item.name}</div>
          {deleteError && (
            <div className="text-red-600 text-xs mt-1">{deleteError}</div>
          )}
        </NavLink>
        <div className="mr-2 inline-flex rounded border border-green-200">
          <button
            onClick={handleRun}
            disabled={isRunning || isDeleting}
            className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-l text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Creating run...' : 'Run'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isRunning || isDeleting}
            className="px-2 py-1 text-green-600 hover:bg-green-50 rounded-r border-l border-green-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Run with title"
          >
            &hellip;
          </button>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isRunning}
          className="mr-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </li>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Run with title</h2>
            <form onSubmit={handleRunWithTitle}>
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
                <button
                  type="button"
                  onClick={handleModalCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunning}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? 'Creating run...' : 'Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
