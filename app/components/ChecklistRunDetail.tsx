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
  onItemUpdated: () => void;
}

export function ChecklistRunDetail({ resource, user, onItemUpdated }: ChecklistRunDetailProps) {
  const title = resource.properties.title as string | undefined;
  const items = (resource.properties.items as RunItemData[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title ?? 'Checklist Run'}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const completeLink = resource.getLinkArray('complete-item').find(
              (l) => l.name === item.name
            );
            return (
              <RunItem
                key={item.name}
                title={item.title ?? item.name}
                description={item.description}
                completed={item.completed}
                completeHref={completeLink?.href}
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
