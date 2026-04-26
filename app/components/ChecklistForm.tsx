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
                <div key={index} className="p-3 border border-gray-200 rounded-md bg-white">
                  <div className="flex items-center justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor={`item-title-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Title
                    </label>
                    <input
                      id={`item-title-${index}`}
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      placeholder="Item title"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`item-description-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id={`item-description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      rows={2}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
                    />
                  </div>
                </div>
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
