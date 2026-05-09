import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { encodeApiUrl } from '../lib/encoding';
import type { Resource } from '../lib/hal';
import { useHeadlessResource, useResource } from '../lib/useResource';
import { Button, type AdditionalAction } from './Button';
import { RunItem } from './RunItem';

interface ChecklistRunDetailProps {
  resource: Resource<ChecklistRun>;
  user: User;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => void;
  onEdit?: () => void;
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

export function ChecklistRunDetail({ resource, user, onItemUpdated, onDelete, onEdit }: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const sortedItems = [
    ...items.filter((item) => item.completed != null),
    ...items.filter((item) => item.completed == null),
  ];
  const allItemsCompleted = sortedItems.length > 0 && sortedItems.every((item) => item.completed);
  const firstToDoItemIndex = sortedItems.findIndex((item) => item.completed == null)
  const checklistLink = resource.getFirstLinkMatching('related', (link) => link.name === 'checklist');
  const createChecklistLink = resource.getFirstLinkMatching('create-from', (link) => link.name === 'checklist');

  const listRef = useRef<HTMLUListElement>(null)
  const navigate = useNavigate();
  const { state: createState, post: createPost } = useHeadlessResource(createChecklistLink?.href || '', user);
  const isCreating = createState.status === 'updating';

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState(resource.properties.title);

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

  const handleDeleteClick = () => {
    if (confirmationText) {
      setIsDeleteConfirmOpen(true);
    } else {
      performDelete();
    }
  };

  const performDelete = async () => {
    setIsDeleteConfirmOpen(false);
    setIsDeleteProcessing(true);
    try {
      onDelete?.();
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  const handleCreateChecklist = async () => {
    setIsCreateModalOpen(false);
    try {
      const location = await createPost({ title: createTitle });
      if (location) {
        navigate(`/checklists/show/${encodeApiUrl(location)}`);
      }
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  const additionalActions: AdditionalAction[] = [];

  if (createChecklistLink) {
    additionalActions.push({
      title: 'Create Checklist',
      action: () => {
        setCreateTitle(resource.properties.title);
        setIsCreateModalOpen(true);
      },
    });
  }

  additionalActions.push({
    title: 'Delete',
    action: handleDeleteClick,
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resource.properties.title}</h1>
          {checklistLink && <CreatedFromChecklist checklistHref={checklistLink.href} user={user} />}
        </div>
        <div>
          {onEdit && additionalActions.length > 0 && (
            <Button
              type="secondary"
              variant="outline"
              size="large"
              action={onEdit}
              additionalActions={additionalActions}
              disabled={isCreating || isDeleteProcessing}
            >
              Edit
            </Button>
          )}
          {onEdit && additionalActions.length === 0 && (
            <Button
              type="secondary"
              variant="outline"
              size="large"
              action={onEdit}
              disabled={isCreating || isDeleteProcessing}
            >
              Edit
            </Button>
          )}
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

      {isDeleteConfirmOpen && confirmationText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Delete run?</h2>
            <p className="text-gray-600 text-sm mb-6">
              {confirmationText}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="secondary"
                variant="text"
                action={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleteProcessing}
              >
                Cancel
              </Button>
              <Button
                type="danger"
                variant="normal"
                action={performDelete}
                disabled={isDeleteProcessing}
              >
                {isDeleteProcessing ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Create Checklist</h2>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Checklist title"
              className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="secondary"
                variant="text"
                action={() => setIsCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                variant="normal"
                action={handleCreateChecklist}
                disabled={isCreating || !createTitle.trim()}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
