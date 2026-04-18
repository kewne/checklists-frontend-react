import { useState } from 'react';

interface CreateChecklistFormProps {
  onSuccess?: (data: { title: string }) => Promise<void>;
}

export function CreateChecklistForm({ onSuccess }: CreateChecklistFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSuccess?.({ title });
    setTitle('');
    setIsFormOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
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
