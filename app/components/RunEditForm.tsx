import { useState } from 'react';
import { v4 } from 'uuid';

interface RunEditFormProps {
  initialValues: ChecklistRun;
  submitLabel: string;
  onSubmit?: (data: WriteableChecklistRun) => Promise<void>;
  onCancel?: () => void;
}

interface RunItemComponentProps {
  item: WriteableChecklistRun['items'][number];
  onUpdate: (name: string, field: 'title' | 'description', value: string) => void;
  onRemove: () => void;
}

function RunItemComponent({ item, onUpdate, onRemove }: RunItemComponentProps) {
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
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
          >
            Remove
          </button>
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
  const [items, setItems] = useState<WriteableChecklistRun['items']>(
    initialValues.items.map(({ completed: _completed, ...item }) => item)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const addItem = (index: number) => {
    setItems((prev) => prev.toSpliced(index, 0, { name: v4(), title: '', description: '' }));
  };

  const updateItem = (name: string, field: 'title' | 'description', value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((item) => item.name !== name));
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
            <button
              type="button"
              onClick={() => addItem(0)}
              className="px-2 w-full rounded-md text-xs text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            >
              + Add Item
            </button>
            {items.map((item, index) => (
              <li key={item.name}>
                <RunItemComponent
                  item={item}
                  onUpdate={updateItem}
                  onRemove={() => removeItem(item.name)}
                />
                <button
                  type="button"
                  onClick={() => addItem(index + 1)}
                  className="px-2 w-full rounded-md text-xs text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                >
                  + Add Item
                </button>
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
