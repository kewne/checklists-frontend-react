import { useState } from 'react';
import type { User } from 'firebase/auth';
import { useResource } from '../lib/useResource';

interface CreateChecklistFormProps {
  href: string;
  user: User;
  onSuccess?: () => void;
}

export function CreateChecklistForm({ href, user, onSuccess }: CreateChecklistFormProps) {
  const { post } = useResource(href, user);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await post({ title });
      
      // Reset form and trigger refresh
      setTitle('');
      setIsFormOpen(false);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
              required
            />
          </div>

          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}
    </>
  );
}
