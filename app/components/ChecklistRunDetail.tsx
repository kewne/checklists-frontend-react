import type { User } from 'firebase/auth';
import type { Resource } from '../lib/hal';
import { RunItem } from './RunItem';

interface RunItemData {
  name: string;
  title?: string;
  description?: string;
  completed?: { completed_at: string; note?: string };
}

interface ChecklistRunDetailProps {
  resource: Resource;
  user: User;
  onItemUpdated: () => Promise<void>;
}

export function ChecklistRunDetail({ resource, user, onItemUpdated }: ChecklistRunDetailProps) {
  const title = resource.properties.title as string | undefined;
  const items = (resource.properties.items as RunItemData[]) ?? [];
  const allItemsCompleted = items.length > 0 && items.every((item) => item.completed);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title ?? 'Checklist Run'}</h1>

      {allItemsCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold text-lg">🎉 Congratulations!</p>
          <p className="text-green-700 text-sm mt-1">You've completed all items in this checklist.</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const completeLink = resource.getLinkArray('complete-item').find(
              (l) => l.name === item.name
            );
            const markIncompleteLink = resource.getLinkArray('mark-incomplete-item').find(
              (l) => l.name === item.name
            );
            return (
              <RunItem
                key={item.name}
                title={item.title ?? item.name}
                description={item.description}
                completed={item.completed}
                completeHref={completeLink?.href}
                markIncompleteHref={markIncompleteLink?.href}
                user={user}
                onItemUpdated={onItemUpdated}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
