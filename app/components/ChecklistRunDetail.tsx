import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import type { Resource } from '../lib/hal';
import { RunItem } from './RunItem';

interface RunItemData {
  name: string;
  title?: string;
  description?: string;
  completed?: { completed_at: string; note?: string };
}

interface ChecklistRunDetailProps {
  resource: Resource<ChecklistRun>;
  user: User;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => void;
}

interface DeleteRunButtonProps {
  confirmationText?: string;
  onDelete?: () => void;
}

function DeleteRunButton({ confirmationText, onDelete }: DeleteRunButtonProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    if (confirmationText) {
      setIsConfirmDialogOpen(true);
    } else {
      performDelete();
    }
  };

  const performDelete = async () => {
    setIsConfirmDialogOpen(false);
    setIsDeleting(true);
    try {
      onDelete?.();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    performDelete();
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 hover:border-red-400"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      {isConfirmDialogOpen && confirmationText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Delete run?</h2>
            <p className="text-gray-600 text-sm mb-6">
              {confirmationText}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ChecklistRunDetail({ resource, user, onItemUpdated, onDelete }: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const allItemsCompleted = items.length > 0 && items.every((item) => item.completed);
  const firstToDoItemIndex = items.findIndex((item) => item.completed == null)

  const listRef = useRef<HTMLUListElement>(null)
  const confirmationText = allItemsCompleted ? undefined : 'This run has incomplete items. Delete anyway?';

  useEffect(() => {
    const listNode = listRef.current
    if (listNode && firstToDoItemIndex !== -1) {
      const itemNodes = listNode?.querySelectorAll('li')
      itemNodes[Math.max(firstToDoItemIndex - 1, 0)].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

  }, [resource, user])

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resource.properties.title}</h1>
        </div>
        <DeleteRunButton
          confirmationText={confirmationText}
          onDelete={onDelete}
        />
      </div>

      {allItemsCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold text-lg">🎉 Congratulations!</p>
          <p className="text-green-700 text-sm mt-1">You've completed all items in this checklist.</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto overscroll-y-contain max-h-100 snap-y snap-mandatory" ref={listRef}>
          {items.map((item) => {
            const completeLink = resource.getLinkArray('complete-item').find(
              (l) => l.name === item.name
            );
            const markIncompleteLink = resource.getLinkArray('mark-incomplete-item').find(
              (l) => l.name === item.name
            );
            return <li key={item.name}>
              <RunItem
                title={item.title ?? item.name}
                description={item.description}
                completed={item.completed}
                completeHref={completeLink?.href}
                markIncompleteHref={markIncompleteLink?.href}
                user={user}
                onItemUpdated={onItemUpdated}
              />
            </li>
          })}
        </ul>
      )}
    </div>
  );
}
