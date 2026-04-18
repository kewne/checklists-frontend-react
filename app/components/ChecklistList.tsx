import { useState, useEffect } from "react";
import { fetchResource } from "../lib/api";
import type { User } from "firebase/auth";

export function ChecklistList({ href, user }: { href: string; user: User }) {
  const [items, setItems] = useState<{ href: string; title?: string, name?: string }[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchResource(user, href)
      .then((resource) => {
        const links = resource.getLinkArray('items');
        setItems(links);
        setStatus('success');
      })
      .catch((error) => {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load checklists');
      });
  }, [href, user]);

  if (status === 'loading') {
    return (
      <div className="mt-4">
        <div className="animate-pulse text-gray-500 text-sm">Loading checklists...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-4 text-red-600 text-sm">Failed to load checklists: {errorMessage}</div>
    );
  }

  return (
    <ul aria-label="checklists" className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md">
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">No checklists found.</li>
      ) : (
        items.map((item) => (
          <li key={item.href} className="px-4 py-3 text-sm text-gray-800">
            {item.title ?? item.name}
          </li>
        ))
      )}
    </ul>
  );
}
