import type { User } from 'firebase/auth';
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
  user: User;
  onItemUpdated: () => void;
}

export function RunItem({ title, description, completed, completeHref, user, onItemUpdated }: RunItemProps) {
  const { post } = useHeadlessResource(completeHref ?? '', user);

  const handleCompleted = async () => {
    await post({});
    onItemUpdated();
  };

  const isCompleted = completed !== undefined;
  const completedAt = isCompleted
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(completed.completed_at))
    : null;

  return (
    <li className="p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {completeHref && (
            <button
              onClick={handleCompleted}
              className="px-3 py-1 text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Complete
            </button>
          )}
          {isCompleted && (
            <span className="text-xs text-gray-400">Completed on {completedAt}</span>
          )}
        </div>
      </div>
    </li>
  );
}
