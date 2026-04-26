import { useState } from 'react';

export interface ChecklistItemData {
  title: string;
  description: string;
}

export interface ChecklistFormData {
  title: string;
  items: ChecklistItemData[];
}

interface ChecklistFormProps {
  initialValues?: ChecklistFormData;
  submitLabel: string,
  onSubmit?: (data: ChecklistFormData) => Promise<void>;
  onCancel?: () => void;
}

interface ChecklistItemComponentProps {
  index: number;
  item: ChecklistItemData;
  onUpdate: (index: number, field: keyof ChecklistItemData, value: string) => void;
  onRemove: (index: number) => void;
}

function ChecklistItemComponent({ index, item, onUpdate, onRemove }: ChecklistItemComponentProps) {
  const [showDescription, setShowDescription] = useState(item.description.length > 0);

  const handleRemoveDescription = () => {
    onUpdate(index, 'description', '');
    setShowDescription(false);
  };

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-white">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`item-title-${index}`}
            className="text-xs font-medium text-gray-600"
          >
            Title
          </label>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
          >
            Remove
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            id={`item-title-${index}`}
            autoFocus={true}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(index, 'title', e.target.value)}
            placeholder="Item title"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
            required
          />
          <button
            type="button"
            onClick={showDescription ? handleRemoveDescription : () => setShowDescription(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
          >
            <label htmlFor={`item-description-${index}`}>
              {showDescription ? 'Description -' : 'Description +'}
            </label>
          </button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <textarea
              id={`item-description-${index}`}
              value={item.description}
              autoFocus={true}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder="Item description"
              rows={2}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChecklistForm({ initialValues, submitLabel, onSubmit, onCancel }: ChecklistFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [items, setItems] = useState<ChecklistItemData[]>(initialValues?.items ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: '', description: '' }]);
  };

  const updateItem = (index: number, field: keyof ChecklistItemData, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
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
            placeholder="Enter checklist title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          {items.length > 0 && (
            <div className="space-y-3 mb-3">
              {items.map((item, index) => (
                <ChecklistItemComponent
                  key={index}
                  index={index}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addItem}
            className="w-full px-4 py-2 rounded-md font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
          >
            + Add Item
          </button>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
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
