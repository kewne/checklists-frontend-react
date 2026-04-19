import type { Resource } from '../lib/hal';

interface ChecklistRunDetailProps {
  resource: Resource;
}

export function ChecklistRunDetail({ resource }: ChecklistRunDetailProps) {
  const title = resource.properties.title as string | undefined;
  const items = (resource.properties.items as Array<{
    title?: string;
    description?: string;
    completed?: boolean;
  }>) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title ?? 'Checklist Run'}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-start gap-3">
                {item.completed !== undefined && (
                  <span
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400'
                    }`}
                    aria-label={item.completed ? 'Completed' : 'Not completed'}
                  >
                    {item.completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
