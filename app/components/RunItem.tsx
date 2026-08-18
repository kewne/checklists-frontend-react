import { useTranslation } from "react-i18next";
import { type ApiLink } from "~/lib/api";
import { renderWithLinks } from "~/lib/renderWithLinks";
import { Button } from "./Button";

interface RunItemCompleted {
  completed_at: string;
  note?: string;
}

interface RunItemProps {
  title: string;
  description?: string;
  completed?: RunItemCompleted;
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
  onItemUpdated: () => Promise<void>;
}

interface RunItemActionsProps {
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
  onItemUpdated: () => Promise<void>;
}

interface CompleteButtonProps {
  completeLink: ApiLink;
  onItemUpdated: () => Promise<void>;
}

function CompleteButton({ completeLink, onItemUpdated }: CompleteButtonProps) {
  const { t } = useTranslation();
  const handleCompleted = async () => {
    await completeLink.actions().post({});
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
    await href.actions().post({});
    await onItemUpdated();
  };

  return (
    <Button variant="danger" action={handleMarkIncomplete}>
      {t("run.markIncomplete")}
    </Button>
  );
}

function RunItemActions({
  completeHref,
  markIncompleteHref,
  onItemUpdated,
}: RunItemActionsProps) {
  return (
    <div className="flex flex-row justify-end">
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
  completed,
  completeHref,
  markIncompleteHref,
  onItemUpdated,
}: RunItemProps) {
  const { t } = useTranslation();
  const completedAt = completed
    ? new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(completed.completed_at))
    : null;

  const style = completed ? "opacity-60" : "";
  return (
    <div
      className={`p-4 border border-gray-200 snap-start bg-gray-50 dark:bg-gray-900 dark:border-gray-700 ${style}`}
    >
      <div className="mb-3">
        <p className="font-medium text-gray-900 text-sm dark:text-white">{title}</p>
        {description && (
          <p className="text-gray-500 text-sm mt-1 whitespace-pre-wrap dark:text-gray-400">
            {renderWithLinks(description)}
          </p>
        )}
      </div>
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {completed && (
              <>
                <span>{t("run.completedOn", { date: completedAt })}</span>
                {completed.note && (
                  <p className="mt-1 text-gray-500 italic dark:text-gray-400">{completed.note}</p>
                )}
              </>
            )}
          </div>
          <RunItemActions
            completeHref={completeHref}
            markIncompleteHref={markIncompleteHref}
            onItemUpdated={onItemUpdated}
          />
        </div>
      </div>
    </div>
  );
}
