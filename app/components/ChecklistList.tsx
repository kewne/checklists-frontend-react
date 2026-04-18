import type { User } from "firebase/auth";
import { useResource } from "../lib/useResource";
import { CreateChecklistForm } from "./CreateChecklistForm";
import { ChecklistItem } from "./ChecklistItem";

export function ChecklistList({ href, user }: { href: string; user: User }) {
  const { state, get } = useResource(href, user);

  if (state.status === 'loading') {
    return (
      <div className="mt-4">
        <div className="animate-pulse text-gray-500 text-sm">Loading checklists...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mt-4 text-red-600 text-sm">Failed to load checklists: {state.error.message}</div>
    );
  }

  if (state.status !== 'success') {
    return null;
  }

  const items = state.resource.getLinkArray('items');

  return (
    <>
      <CreateChecklistForm href={href} user={user} onSuccess={get} />
      <ul aria-label="checklists" className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md">
        {items.length === 0 ? (
          <li className="px-4 py-3 text-gray-500 text-sm">No checklists found.</li>
        ) : (
          items.map((item) => (
            <ChecklistItem
              key={item.href}
              item={item}
              user={user}
              onDelete={get}
            />
          ))
        )}
      </ul>
    </>
  );
}
