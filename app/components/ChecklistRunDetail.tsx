import type { User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { encodeApiUrl } from "../lib/encoding";
import type { Resource } from "../lib/hal";
import { useResource } from "../lib/useResource";
import { Button } from "./Button";
import { MenuButton, type MenuItem } from "./MenuButton";
import { RunItem } from "./RunItem";
import { apiResourceActions, type Checklist, type ChecklistRun } from "~/lib/api";

interface ChecklistRunDetailProps {
  resource: Resource<ChecklistRun>;
  user: User;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onEdit?: () => Promise<void>;
}

function CreatedFromChecklist({
  checklistHref,
  user,
}: {
  checklistHref: string;
  user: User;
}) {
  const { state } = useResource<Checklist>(checklistHref, user);

  if (state.status === "loading") {
    return <div className="text-sm text-gray-600 mb-4">Created from...</div>;
  }

  if (state.status === "error") {
    return null;
  }

  return (
    <div className="text-sm text-gray-600 mb-4">
      Created from{" "}
      <Link
        to={`/checklists/show/${encodeApiUrl(checklistHref)}`}
        className="text-indigo-600 hover:underline"
      >
        {state.resource.properties.title}
      </Link>
    </div>
  );
}

export function ChecklistRunDetail({
  resource,
  user,
  onItemUpdated,
  onDelete,
  onEdit,
}: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const sortedItems = [
    ...items.filter((item) => item.completed != null),
    ...items.filter((item) => item.completed == null),
  ];
  const allItemsCompleted =
    sortedItems.length > 0 && sortedItems.every((item) => item.completed);
  const firstToDoItemIndex = sortedItems.findIndex(
    (item) => item.completed == null,
  );
  const checklistLink = resource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklist",
  );

  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const confirmationText = allItemsCompleted
    ? undefined
    : "This run has incomplete items. Delete anyway?";

  useEffect(() => {
    const listNode = listRef.current;
    if (listNode && firstToDoItemIndex !== -1) {
      const itemNodes = listNode?.querySelectorAll("li");
      itemNodes[Math.max(firstToDoItemIndex - 1, 0)].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [resource, user]);

  const handleDeleteClick = async () => {
    if (confirmationText) {
      setIsDeleteConfirmOpen(true);
    } else {
      return performDelete();
    }
  };

  const performDelete = async () => {
    await onDelete?.();
    setIsDeleteConfirmOpen(false);
  };

  const additionalActions: MenuItem[] = [];
  if (onEdit) {
    additionalActions.push({
      title: "Edit",
      action: onEdit,
    });
  }

  const createChecklistLink = resource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "checklist",
  );
  if (createChecklistLink) {
    const { post: createChecklist } = apiResourceActions(
      createChecklistLink.href,
      user,
    );
    additionalActions.push({
      title: "Create Checklist",
      action: async () => {
        const location = await createChecklist({
          title: `Copy of ${resource.properties.title}`,
        });
        if (location) {
          return navigate(`/checklists/show/${encodeApiUrl(location)}`);
        }
        navigate("/checklists/list");
      },
    });
  }

  const updateChecklistLink = resource.getFirstLinkMatching(
    "update-from",
    (link) => link.name === "checklist",
  );
  if (updateChecklistLink) {
    const { post: updateChecklist } = apiResourceActions(
      updateChecklistLink.href,
      user,
    );
    additionalActions.push({
      title: "Update Checklist",
      action: async () => {
        const location = await updateChecklist({});
        if (location) {
          return navigate(`/checklists/show/${encodeApiUrl(location)}`);
        }
        navigate("/checklists/list");
      },
    });
  }

  additionalActions.push({
    title: "Delete",
    action: handleDeleteClick,
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {resource.properties.title}
          </h1>
          {checklistLink && (
            <CreatedFromChecklist
              checklistHref={checklistLink.href}
              user={user}
            />
          )}
        </div>
        <div>
          <MenuButton
            type="secondary"
            variant="outline"
            size="large"
            items={additionalActions}
            ariaLabel="More actions"
          >
            ⋮
          </MenuButton>
        </div>
      </div>

      {allItemsCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold text-lg">
            🎉 Congratulations!
          </p>
          <p className="text-green-700 text-sm mt-1">
            You've completed all items in this checklist.
          </p>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <ul
          className="space-y-3 overflow-y-auto overscroll-y-contain max-h-100 snap-y snap-mandatory"
          ref={listRef}
        >
          {sortedItems.map((item) => {
            const completeLink = resource
              .getLinkArray("complete-item")
              .find((l) => l.name === item.name);
            const markIncompleteLink = resource
              .getLinkArray("mark-incomplete-item")
              .find((l) => l.name === item.name);
            return (
              <li key={item.name}>
                <RunItem
                  title={item.title ?? item.name}
                  description={item.description}
                  completed={item.completed}
                  completeHref={completeLink?.href}
                  markIncompleteHref={markIncompleteLink?.href}
                  user={user}
                  onItemUpdated={onItemUpdated}
                />
              </li>
            );
          })}
        </ul>
      )}

      {isDeleteConfirmOpen && confirmationText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              Delete run?
            </h2>
            <p className="text-gray-600 text-sm mb-6">{confirmationText}</p>
            <div className="flex justify-end gap-2">
              <Button
                type="secondary"
                variant="text"
                action={async () => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button type="danger" variant="normal" action={performDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
