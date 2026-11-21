import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ApiResource,
  type ApiLink,
  type Checklist,
  type ChecklistRun,
  type ChecklistRunItem,
} from "~/lib/api";
import { useLocaleNavigate } from "~/lib/locale";
import { useModal } from "~/lib/useModal";
import { encodeApiUrl } from "../lib/encoding";
import { showErrorToast, showSuccessToast } from "../lib/toastHelpers";
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Link } from "./Link";
import { MenuButton } from "./MenuButton";
import { RunItem } from "./RunItem";
import { TextArea } from "./TextArea";

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
  const items = resource.getNested<ChecklistRunItem>("items");
  const completedItems = items.filter((item) => item.properties.completed != null);
  const todoItems = items.filter((item) => item.properties.completed == null);
  const allItemsCompleted = items.length > 0 && todoItems.length === 0;
  const checklistLink = resource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklist",
  );
  const addItemLink = resource.getFirstLinkMatching(
    "update",
    (link) => link.name === "add-item",
  );
  const clearCompletedLink = resource.getFirstLinkMatching(
    "update",
    (link) => link.name === "clear-completed-items",
  );

  const navigate = useLocaleNavigate();
  const { t } = useTranslation();

  const deleteModal = useModal();
  const noteModal = useModal();
  const [editingNote, setEditingNote] = useState<{
    noteHref: ApiLink;
    initialNote?: string;
  } | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleOpenNoteModal = (noteHref: ApiLink, currentNote?: string) => {
    setEditingNote({ noteHref, initialNote: currentNote });
    setNoteValue(currentNote ?? "");
    noteModal.open();
  };

  const handleCloseNoteModal = () => {
    noteModal.close();
    setEditingNote(null);
  };

  const handleSaveNote = async () => {
    if (!editingNote) return;
    const trimmed = noteValue.trim();
    if (!trimmed) return;
    try {
      await editingNote.noteHref.actions().put({ note: trimmed });
      await onItemUpdated();
      handleCloseNoteModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("toast.updateRunFailed");
      showErrorToast(message);
    }
  };

  const handleRemoveNote = async () => {
    if (!editingNote) return;
    try {
      await editingNote.noteHref.actions().delete();
      await onItemUpdated();
      handleCloseNoteModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("toast.updateRunFailed");
      showErrorToast(message);
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
            <Link
              variant="inline-block"
              to={`/runs/edit/${encodeApiUrl(resource.getFirstLinkMatching("self")!.href)}`}
            >
              {t("common.editEllipsis")}
            </Link>
          </div>
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
              {clearCompletedLink && (
                <Button
                  action={async () => {
                    await clearCompletedLink.actions().post();
                    await onItemUpdated();
                    showSuccessToast(t("toast.completedItemsCleared"));
                  }}
                >
                  {t("run.clearCompleted")}
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
      {completedItems.length === 0 && todoItems.length === 0 && (
        <p className="text-gray-500 text-sm dark:text-gray-400">{t("run.noItems")}</p>
      )}
      {completedItems.length > 0 && (
        <ul className="space-y-3">
          {completedItems.map((itemResource) => {
            const item = itemResource.properties;
            const completeLink = itemResource.getFirstLinkMatching("complete-item");
            const markIncompleteLink = itemResource.getFirstLinkMatching("mark-incomplete-item");
            const noteLink = itemResource.getFirstLinkMatching(
              "update",
              (l) => l.name === "note",
            );
            return (
              <li key={item.id}>
                <RunItem
                  title={item.title ?? item.id}
                  description={item.description}
                  note={item.note}
                  completed={item.completed ?? undefined}
                  completeHref={completeLink}
                  markIncompleteHref={markIncompleteLink}
                  onEditNote={
                    noteLink
                      ? () => handleOpenNoteModal(noteLink, item.note)
                      : undefined
                  }
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
        >
          {todoItems.map((itemResource) => {
            const item = itemResource.properties;
            const completeLink = itemResource.getFirstLinkMatching("complete-item");
            const markIncompleteLink = itemResource.getFirstLinkMatching("mark-incomplete-item");
            const noteLink = itemResource.getFirstLinkMatching(
              "update",
              (l) => l.name === "note",
            );
            return (
              <li key={item.id}>
                <RunItem
                  title={item.title ?? item.id}
                  description={item.description}
                  note={item.note}
                  completed={item.completed ?? undefined}
                  completeHref={completeLink}
                  markIncompleteHref={markIncompleteLink}
                  onEditNote={
                    noteLink
                      ? () => handleOpenNoteModal(noteLink, item.note)
                      : undefined
                  }
                  onItemUpdated={onItemUpdated}
                />
              </li>
            );
          })}
        </ul>
      )}
      <noteModal.Modal>
        <Heading level="2">{t("run.noteTitle")}</Heading>
        <div className="mb-4">
          <TextArea
            aria-label={t("run.noteTitle")}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder={t("run.notePlaceholder")}
            maxLength={500}
            rows={4}
            autoFocus
          />
        </div>
        <div className="flex justify-between gap-2">
          <div>
            {editingNote?.initialNote && (
              <Button variant="danger" action={handleRemoveNote}>
                {t("common.remove")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button action={handleCloseNoteModal}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              action={handleSaveNote}
              disabled={!noteValue.trim()}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </noteModal.Modal>
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
