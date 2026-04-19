import { useState } from 'react';

interface ChecklistItem {
  title: string;
  description: string;
}

interface CreateChecklistFormProps {
  onSuccess?: (data: { title: string; items: ChecklistItem[] }) => Promise<void>;
}

export function CreateChecklistForm({ onSuccess }: CreateChecklistFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSuccess?.({ title, items });
    setTitle('');
    setItems([]);
    setIsFormOpen(false);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: '', description: '' }]);
  };

  const updateItem = (index: number, field: keyof ChecklistItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setTitle('');
    setItems([]);
    setIsFormOpen(false);
  };

  return (
    <>
      <button
        onClick={() => (isFormOpen ? handleCancel() : setIsFormOpen(true))}
        className="mb-4 bg-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
      >
        {isFormOpen ? 'Cancel' : 'Create Checklist'}
      </button>

      {isFormOpen && (
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Items</span>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            {items.length > 0 && (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
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
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Create
          </button>
        </form>
      )}
    </>
  );
}
