import { useTranslation } from "react-i18next";
import { type ApiLink } from "~/lib/api";
import { renderWithLinks } from "~/lib/renderWithLinks";
import { Button } from "./Button";

interface RunItemCompleted {
  completed_at: string;
}

interface RunItemProps {
  title: string;
  description?: string;
  note?: string;
  completed?: RunItemCompleted;
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
  onEditNote?: () => void;
  onItemUpdated: () => Promise<void>;
}

interface RunItemActionsProps {
  note?: string;
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
  onEditNote?: () => void;
  onItemUpdated: () => Promise<void>;
}

interface CompleteButtonProps {
  completeLink: ApiLink;
  onItemUpdated: () => Promise<void>;
}

function CompleteButton({ completeLink, onItemUpdated }: CompleteButtonProps) {
  const { t } = useTranslation();
  const handleCompleted = async () => {
    await completeLink.actions().post();
    await onItemUpdated();
  };

  return (
    <Button type="primary" action={handleCompleted}>
      {t("run.markComplete")}
    </Button>
  );
}

interface MarkIncompleteButtonProps {
  href: ApiLink;
  onItemUpdated: () => Promise<void>;
}

function MarkIncompleteButton({
  href,
  onItemUpdated,
}: MarkIncompleteButtonProps) {
  const { t } = useTranslation();
  const handleMarkIncomplete = async () => {
    await href.actions().post();
    await onItemUpdated();
  };

  return (
    <Button variant="danger" action={handleMarkIncomplete}>
      {t("run.markIncomplete")}
    </Button>
  );
}

function RunItemActions({
  note,
  completeHref,
  markIncompleteHref,
  onEditNote,
  onItemUpdated,
}: RunItemActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row justify-end gap-2">
      {onEditNote && (
        <Button action={onEditNote}>
          {note ? t("run.editNote") : t("run.addNote")}
        </Button>
      )}
      {completeHref && (
        <CompleteButton
          completeLink={completeHref}
          onItemUpdated={onItemUpdated}
        />
      )}
      {markIncompleteHref && (
        <MarkIncompleteButton
          href={markIncompleteHref}
          onItemUpdated={onItemUpdated}
        />
      )}
    </div>
  );
}

export function RunItem({
  title,
  description,
  note,
  completed,
  completeHref,
  markIncompleteHref,
  onEditNote,
  onItemUpdated,
}: RunItemProps) {
  const { t } = useTranslation();
  const completedAt = completed
    ? new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(completed.completed_at))
    : null;

  return (
    <div className="p-4 border border-gray-200 snap-start bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="mb-3">
        <p className="font-medium text-gray-900 text-base dark:text-white">{title}</p>
        {description && (
          <p className="text-gray-900 text-sm mt-1 whitespace-pre-wrap dark:text-white">
            {renderWithLinks(description)}
          </p>
        )}
        {note && (
          <p className="mt-2 border-l-2 border-gray-300 pl-2.5 text-sm italic text-gray-600 whitespace-pre-wrap dark:border-gray-600 dark:text-gray-300">
            {note}
          </p>
        )}
      </div>
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center gap-2">
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {completed && (
              <span>{t("run.completedOn", { date: completedAt })}</span>
            )}
          </div>
          <RunItemActions
            note={note}
            completeHref={completeHref}
            markIncompleteHref={markIncompleteHref}
            onEditNote={onEditNote}
            onItemUpdated={onItemUpdated}
          />
        </div>
      </div>
    </div>
  );
}
