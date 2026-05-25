import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import {
  ApiResource,
  type ApiLink,
  type Checklist,
  type ChecklistRun,
} from "~/lib/api";
import { encodeApiUrl } from "../lib/encoding";
import { showSuccessToast } from "../lib/toastHelpers";
import { Button } from "./Button";
import { MenuButton, type MenuItem } from "./MenuButton";
import { RunItem } from "./RunItem";

interface ChecklistRunDetailProps {
  resource: ApiResource<ChecklistRun>;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onEdit?: () => Promise<void>;
}

function CreatedFromChecklist({ checklistLink }: { checklistLink: ApiLink }) {
  const [checklist, setChecklist] = useState<Checklist>();
  useEffect(() => {
    checklistLink
      .actions<Checklist>()
      .get()
      .then((checklist) => setChecklist(checklist.properties));
  }, [checklistLink]);

  if (!checklist) {
    return;
  }

  return (
    <div className="text-sm text-gray-600 mb-4">
      Created from
      <Link to={`/checklists/show/${encodeApiUrl(checklistLink.href)}`}>
        {checklist.title}
      </Link>
    </div>
  );
}

export function ChecklistRunDetail({
  resource,
  onItemUpdated,
  onDelete,
  onEdit,
}: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const completedItems = items.filter((item) => item.completed != null);
  const todoItems = items.filter((item) => item.completed == null);
  const allItemsCompleted = todoItems.length === 0 && completedItems.length > 0;
  const checklistLink = resource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklist",
  );
  const addItemLink = resource.getFirstLinkMatching(
    "update",
    (link) => link.name === "add-item",
  );

  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const confirmationText = allItemsCompleted
    ? undefined
    : "This run has incomplete items. Delete anyway?";

  useEffect(() => {
    const listNode = listRef.current;
    if (listNode) {
      const itemNodes = listNode?.querySelectorAll("li");
      if (itemNodes.length > 0) {
        itemNodes[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [resource]);

  const handleDeleteClick = async () => {
    if (confirmationText) {
      setIsDeleteConfirmOpen(true);
    } else {
      return performDelete();
    }
  };

  const performDelete = async () => {
    await onDelete?.();
    showSuccessToast("Run deleted successfully");
    setIsDeleteConfirmOpen(false);
  };

  const additionalActions: MenuItem[] = [];
  if (onEdit) {
    additionalActions.push({
      title: "Edit...",
      action: onEdit,
    });
  }

  const createChecklistFrom = resource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "checklist",
  );
  if (createChecklistFrom) {
    additionalActions.push({
      title: "Create Checklist",
      action: async () => {
        const location = await createChecklistFrom.actions().post({
          title: `Copy of ${resource.properties.title}`,
        });
        if (location) {
          return navigate(`/checklists/show/${encodeApiUrl(location)}`);
        }
        navigate("/checklists/list");
      },
    });
  }

  const updateChecklistFrom = resource.getFirstLinkMatching(
    "update-from",
    (link) => link.name === "checklist",
  );
  if (updateChecklistFrom) {
    additionalActions.push({
      title: "Update Checklist",
      action: async () => {
        const location = await updateChecklistFrom.actions().post();
        if (location) {
          return navigate(`/checklists/show/${encodeApiUrl(location)}`);
        }
        navigate("/checklists/list");
      },
    });
  }

  additionalActions.push({
    title: confirmationText ? "Delete..." : "Delete",
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
            <CreatedFromChecklist checklistLink={checklistLink} />
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

      {completedItems.length === 0 && todoItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No items in this run.</p>
      ) : (
        <>
          {completedItems.length > 0 && (
            <ul className="space-y-3">
              {completedItems.map((item) => {
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
                      completeHref={completeLink}
                      markIncompleteHref={markIncompleteLink}
                      onItemUpdated={onItemUpdated}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {addItemLink && (
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-gray-200" />
              <Link
                to={`/runs/add-item/${encodeApiUrl(addItemLink.href)}`}
                className="text-sm whitespace-nowrap"
              >
                + Add item
              </Link>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          )}

          {todoItems.length > 0 && (
            <ul
              className="space-y-3 overflow-y-auto overscroll-y-contain max-h-100 snap-y snap-mandatory"
              ref={listRef}
            >
              {todoItems.map((item) => {
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
                      completeHref={completeLink}
                      markIncompleteHref={markIncompleteLink}
                      onItemUpdated={onItemUpdated}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
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
                variant="outline"
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
