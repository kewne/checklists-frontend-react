import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ApiResource,
  type ApiLink,
  type Checklist,
  type ChecklistRun,
} from "~/lib/api";
import { useLocaleNavigate } from "~/lib/locale";
import { useModal } from "~/lib/useModal";
import { encodeApiUrl } from "../lib/encoding";
import { showSuccessToast } from "../lib/toastHelpers";
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Link } from "./Link";
import { MenuButton, type MenuItem } from "./MenuButton";
import { RunItem } from "./RunItem";
import { Panel } from "./Panel";

interface ChecklistRunDetailProps {
  resource: ApiResource<ChecklistRun>;
  onItemUpdated: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

function CreatedFromChecklist({ checklistLink }: { checklistLink: ApiLink }) {
  const { t } = useTranslation();
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
    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
      {t("run.createdFrom")}
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
}: ChecklistRunDetailProps) {
  const items = resource.properties.items;
  const completedItems = items.filter((item) => item.completed != null);
  const todoItems = items.filter((item) => item.completed == null);
  const allItemsCompleted = items.length > 0 && todoItems.length === 0;
  const checklistLink = resource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklist",
  );
  const addItemLink = resource.getFirstLinkMatching(
    "update",
    (link) => link.name === "add-item",
  );

  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useLocaleNavigate();
  const { t } = useTranslation();

  const deleteModal = useModal();

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
    if (!allItemsCompleted) {
      deleteModal.open();
    } else {
      return performDelete();
    }
  };

  const performDelete = async () => {
    await onDelete?.();
    showSuccessToast(t("toast.runDeleted"));
    deleteModal.close();
  };

  const additionalActions: MenuItem[] = [];

  const createChecklistFrom = resource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "checklist",
  );

  const updateChecklistFrom = resource.getFirstLinkMatching(
    "update-from",
    (link) => link.name === "checklist",
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Heading level="1">
            {resource.properties.title}
            <Link
              variant="inline-block"
              className="ml-3"
              to={`/runs/edit/${encodeApiUrl(resource.getFirstLinkMatching("self")!.href)}`}
            >
              {t("common.editEllipsis")}
            </Link>
          </Heading>
          {checklistLink && (
            <CreatedFromChecklist checklistLink={checklistLink} />
          )}
        </div>
        <div className="ml-3">
          <MenuButton
            type="secondary"
            size={["large", "medium"]}
            ariaLabel={t("run.moreActions")}
          >
            <div className="flex flex-col gap-1 content-stretch items-stretch">
              {createChecklistFrom && (
                <Button
                  action={async () => {
                    const location = await createChecklistFrom.actions().post({
                      title: t("run.copyTitle", { title: resource.properties.title }),
                    });
                    if (location) {
                      return navigate(
                        `/checklists/show/${encodeApiUrl(location)}`,
                      );
                    }
                    navigate("/checklists/list");
                  }}
                >
                  {t("run.createChecklist")}
                </Button>
              )}
              {updateChecklistFrom && (
                <Button
                  action={async () => {
                    const location = await updateChecklistFrom.actions().post();
                    if (location) {
                      return navigate(
                        `/checklists/show/${encodeApiUrl(location)}`,
                      );
                    }
                    navigate("/checklists/list");
                  }}
                >
                  {t("run.updateChecklist")}
                </Button>
              )}
              <Button
                variant="danger"
                action={handleDeleteClick}
              >
                {!allItemsCompleted ? t("common.deleteEllipsis") : t("common.delete")}
              </Button>
            </div>
          </MenuButton>
        </div>
      </div>
      {allItemsCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
          <p className="text-green-800 font-semibold text-lg dark:text-green-300">
            {t("run.congratulations")}
          </p>
          <p className="text-green-700 text-sm mt-1 dark:text-green-400">
            {t("run.allCompleted")}
          </p>
        </div>
      )}
      {completedItems.length === 0 && todoItems.length === 0 ? (
        <p className="text-gray-500 text-sm dark:text-gray-400">{t("run.noItems")}</p>
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
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <Link
                to={`/runs/add-item/${encodeApiUrl(addItemLink.href)}`}
                className="text-sm whitespace-nowrap"
              >
                {t("run.addItem")}
              </Link>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
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
      <deleteModal.Modal>
        <Heading level="2">{t("run.deleteTitle")}</Heading>
        <p className="text-gray-600 text-sm mb-6">
          {t("run.deleteConfirm")}
        </p>
        <div className="flex justify-end gap-2">
          <Button action={deleteModal.close}>{t("common.cancel")}</Button>
          <Button type="primary" variant="danger" action={performDelete}>
            {t("common.delete")}
          </Button>
        </div>
      </deleteModal.Modal>
    </div>
  );
}
