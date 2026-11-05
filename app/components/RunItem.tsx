import { useTranslation } from "react-i18next";
import { useSubmit } from "react-router";
import type { Link as ApiLink } from "@kewne/restspec";
import type { ChecklistInstance } from "~/lib/restspec-api";
import { renderWithLinks } from "~/lib/renderWithLinks";
import { Button } from "./Button";

interface RunItemProps {
  title: string;
  description?: string;
  completed?: ChecklistInstance["properties"]["items"][number]["completed"];
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
}

interface RunItemActionsProps {
  completeHref?: ApiLink;
  markIncompleteHref?: ApiLink;
}

function CompleteButton({ completeLink }: { completeLink: ApiLink }) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const handleCompleted = async () => {
    await submit(
      { intent: "complete-item", href: completeLink.href },
      { method: "post" },
    );
  };

  return (
    <Button type="primary" action={handleCompleted}>
      {t("run.markComplete")}
    </Button>
  );
}

function MarkIncompleteButton({ href }: { href: ApiLink }) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const handleMarkIncomplete = async () => {
    await submit(
      { intent: "mark-incomplete-item", href: href.href },
      { method: "post" },
    );
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
}: RunItemActionsProps) {
  return (
    <div className="flex flex-row justify-end">
      {completeHref && <CompleteButton completeLink={completeHref} />}
      {markIncompleteHref && <MarkIncompleteButton href={markIncompleteHref} />}
    </div>
  );
}

export function RunItem({
  title,
  description,
  completed,
  completeHref,
  markIncompleteHref,
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
          />
        </div>
      </div>
    </div>
  );
}
