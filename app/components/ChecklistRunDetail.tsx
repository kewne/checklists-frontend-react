import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { encodeApiUrl } from '../lib/encoding';
import type { Resource } from '../lib/hal';
import { useHeadlessResource, useResource } from '../lib/useResource';
import { RunItem } from './RunItem';

interface ChecklistRunDetailProps {
  resource: Resource<ChecklistRun>;
  user: User;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface DeleteRunButtonProps {
  confirmationText?: string;
  onDelete?: () => void;
}

function CreatedFromChecklist({ checklistHref, user }: { checklistHref: string; user: User }) {
  const { state } = useResource<Checklist>(checklistHref, user);

  if (state.status === 'loading') {
    return (
      <div className="text-sm text-gray-600 mb-4">
        Created from...
      </div>
    );
  }

  if (state.status === 'error') {
    return null;
  }

  return (
    <div className="text-sm text-gray-600 mb-4">
      Created from <Link
        to={`/checklists/show/${encodeApiUrl(checklistHref)}`}
        className="text-indigo-600 hover:underline"
      >
        {state.resource.properties.title}
      </Link>
    </div>
  );
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

interface CreateChecklistButtonProps {
  href: string;
  defaultTitle: string;
  user: User;
}

function CreateChecklistButton({ href, defaultTitle: defaultTitle, user }: CreateChecklistButtonProps) {
  const navigate = useNavigate();
  const { state, post } = useHeadlessResource(href, user);
  const isCreating = state.status === 'updating';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);

  const handleOpenModal = () => {
    setTitle(defaultTitle);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    try {
      const location = await post({ title });
      if (location) {
        navigate(`/checklists/show/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isCreating}
        className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-300 hover:border-indigo-400"
      >
        {isCreating ? 'Creating...' : 'Create Checklist'}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Create Checklist</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Checklist title"
              className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isCreating || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ChecklistRunDetail({ resource, user, onItemUpdated, onDelete, onEdit }: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const sortedItems = [
    ...items.filter((item) => item.completed != null),
    ...items.filter((item) => item.completed == null),
  ];
  const allItemsCompleted = sortedItems.length > 0 && sortedItems.every((item) => item.completed);
  const firstToDoItemIndex = sortedItems.findIndex((item) => item.completed == null)
  const checklistLink = resource.getNamedLink('related', 'checklist');
  const createChecklistLink = resource.getNamedLink('create-from', 'checklist');

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
          {checklistLink && <CreatedFromChecklist checklistHref={checklistLink.href} user={user} />}
        </div>
        <div className="flex gap-2">
          {createChecklistLink && (
            <CreateChecklistButton href={createChecklistLink.href} defaultTitle={resource.properties.title} user={user} />
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded text-sm font-medium border border-indigo-300 hover:border-indigo-400"
            >
              Edit
            </button>
          )}
          <DeleteRunButton
            confirmationText={confirmationText}
            onDelete={onDelete}
          />
        </div>
      </div>

      {allItemsCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold text-lg">🎉 Congratulations!</p>
          <p className="text-green-700 text-sm mt-1">You've completed all items in this checklist.</p>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto overscroll-y-contain max-h-100 snap-y snap-mandatory" ref={listRef}>
          {sortedItems.map((item) => {
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
