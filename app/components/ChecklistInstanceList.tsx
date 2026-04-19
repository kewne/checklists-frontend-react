import type { User } from "firebase/auth";
import { NavLink } from "react-router";
import { useResource } from "../lib/useResource";
import { encodeApiUrl } from "../lib/encoding";

interface ChecklistInstanceListProps {
  href: string;
  user: User;
}

export function ChecklistInstanceList({ href, user }: ChecklistInstanceListProps) {
  const { state } = useResource(href, user);

  if (state.status === 'loading') {
    return (
      <div className="mt-4">
        <div className="animate-pulse text-gray-500 text-sm">Loading checklist instances...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mt-4 text-red-600 text-sm">Failed to load checklist instances: {state.error.message}</div>
    );
  }

  const items = state.resource.getLinkArray('items');

  return (
    <ul aria-label="checklist instances" className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md">
      {items.length === 0 ? (
        <li className="px-4 py-3 text-gray-500 text-sm">No checklist instances found.</li>
      ) : (
        items.map((item) => (
          <li key={item.href} className="text-sm text-gray-800">
            <NavLink
              to={`/checklist-run/${encodeApiUrl(item.href)}`}
              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-indigo-600">{item.title ?? item.name}</div>
            </NavLink>
          </li>
        ))
      )}
    </ul>
  );
}
