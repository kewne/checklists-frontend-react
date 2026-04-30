import type { User } from 'firebase/auth';
import { useState } from 'react';
import { useHeadlessResource } from '../lib/useResource';

interface RunItemCompleted {
  completed_at: string;
  note?: string;
}

interface RunItemProps {
  title: string;
  description?: string;
  completed?: RunItemCompleted;
  completeHref?: string;
  markIncompleteHref?: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

interface RunItemActionsProps {
  completeHref?: string;
  markIncompleteHref?: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

interface CompleteButtonProps {
  href: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

function CompleteButton({ href, user, onItemUpdated }: CompleteButtonProps) {
  const { state, post } = useHeadlessResource(href, user);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [note, setNote] = useState('');

  const handleCompleted = async () => {
    await post({}, { onSuccess: onItemUpdated });
  };

  const handleCompleteWithNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await post({ note }, {
      onSuccess: async () => {
        setIsNoteModalOpen(false);
        setNote('');
        await onItemUpdated();
      }
    });
  };

  const handleNoteModalCancel = () => {
    setIsNoteModalOpen(false);
    setNote('');
  };

  const isPosting = state.status === 'updating' && state.action === 'post';

  return (
    <>
      <div className="flex gap-1">
        <button
          onClick={handleCompleted}
          disabled={isPosting}
          className="px-3 py-1 text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? 'Marking complete...' : 'Mark complete'}
        </button>
        <button
          onClick={() => setIsNoteModalOpen(true)}
          disabled={isPosting}
          className="px-2 py-1 text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Complete with note"
        >
          &hellip;
        </button>
      </div>

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Complete with note</h2>
            <form onSubmit={handleCompleteWithNote}>
              <label htmlFor="complete-note" className="block text-sm font-medium text-gray-700 mb-1">
                Note (optional)
              </label>
              <textarea
                id="complete-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this completion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm mb-4"
                autoFocus
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleNoteModalCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? 'Marking complete...' : 'Mark complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

interface MarkIncompleteButtonProps {
  href: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

function MarkIncompleteButton({ href, user, onItemUpdated }: MarkIncompleteButtonProps) {
  const { state, post } = useHeadlessResource(href, user);

  const handleMarkIncomplete = async () => {
    await post({}, { onSuccess: onItemUpdated });
  };

  const isPosting = state.status === 'updating' && state.action === 'post';

  return (
    <button
      onClick={handleMarkIncomplete}
      disabled={isPosting}
      className="px-3 py-1 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPosting ? 'Marking incomplete...' : 'Mark Incomplete'}
    </button>
  );
}

function RunItemActions({ completeHref, markIncompleteHref, user, onItemUpdated }: RunItemActionsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {completeHref && (
        <CompleteButton href={completeHref} user={user} onItemUpdated={onItemUpdated} />
      )}
      {markIncompleteHref && (
        <MarkIncompleteButton href={markIncompleteHref} user={user} onItemUpdated={onItemUpdated} />
      )}
    </div>
  );
}

export function RunItem({ title, description, completed, completeHref, markIncompleteHref, user, onItemUpdated }: RunItemProps) {
  const completedAt = completed
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(completed.completed_at))
    : null;

  return (
    <li className="p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          {description && (
            <p className="text-gray-500 text-sm mt-1 whitespace-pre-wrap">{description}</p>
          )}
        </div>
        <RunItemActions
          completeHref={completeHref}
          markIncompleteHref={markIncompleteHref}
          user={user}
          onItemUpdated={onItemUpdated}
        />
      </div>
      {completed && (
        <div className="pt-3 border-t border-gray-200 text-xs text-gray-400">
          <span>Completed on {completedAt}</span>
          {completed.note && (
            <p className="mt-1 text-gray-500 italic">{completed.note}</p>
          )}
        </div>
      )}
    </li>
  );
}
