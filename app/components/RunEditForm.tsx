import { useState } from 'react';

interface RunEditFormProps {
  initialValues: ChecklistRun;
  submitLabel: string;
  onSubmit?: (data: ChecklistRun) => Promise<void>;
  onCancel?: () => void;
}

interface RunItemComponentProps {
  item: ChecklistRun['items'][number];
  onUpdate: (name: string, field: 'title' | 'description', value: string) => void;
}

function RunItemComponent({ item, onUpdate }: RunItemComponentProps) {
  const [showDescription, setShowDescription] = useState(item.description?.length > 0);

  const handleRemoveDescription = () => {
    onUpdate(item.name, 'description', '');
    setShowDescription(false);
  };

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-white">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`item-title-${item.name}`}
            className="text-xs font-medium text-gray-600"
          >
            Title
          </label>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            id={`item-title-${item.name}`}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.name, 'title', e.target.value)}
            placeholder="Item title"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
            required
          />
          <button
            type="button"
            onClick={showDescription ? handleRemoveDescription : () => setShowDescription(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
          >
            <label htmlFor={`item-description-${item.name}`}>
              {showDescription ? 'Description -' : 'Description +'}
            </label>
          </button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <textarea
              id={`item-description-${item.name}`}
              value={item.description}
              onChange={(e) => onUpdate(item.name, 'description', e.target.value)}
              placeholder="Item description"
              rows={5}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function RunEditForm({ initialValues, submitLabel, onSubmit, onCancel }: RunEditFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [items, setItems] = useState(initialValues.items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const updateItem = (name: string, field: 'title' | 'description', value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, [field]: value } : item))
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter run title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <ol className="space-y-3 my-1">
            {items.map((item) => (
              <li key={item.name}>
                <RunItemComponent
                  item={item}
                  onUpdate={updateItem}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-md font-medium text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-[2] bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
