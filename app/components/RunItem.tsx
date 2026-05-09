import type { User } from "firebase/auth";
import { useHeadlessResource } from "../lib/useResource";
import { Button } from "./Button";

interface RunItemCompleted {
  completed_at: string;
  note?: string;
}

interface RunItemProps {
  title: string;
  description?: string;
  completed?: RunItemCompleted;
  completeHref?: string;
  markIncompleteHref?: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

interface RunItemActionsProps {
  completeHref?: string;
  markIncompleteHref?: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

interface CompleteButtonProps {
  href: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

function CompleteButton({ href, user, onItemUpdated }: CompleteButtonProps) {
  const { state, post } = useHeadlessResource(href, user);

  const handleCompleted = async () => {
    await post({}, { onSuccess: onItemUpdated });
  };

  const isPosting = state.status === "updating" && state.action === "post";

  return (
    <Button
      type="primary"
      action={handleCompleted}
      disabled={isPosting}
    >
      Mark Complete
    </Button>
  );
}

interface MarkIncompleteButtonProps {
  href: string;
  user: User;
  onItemUpdated: () => Promise<void>;
}

function MarkIncompleteButton({
  href,
  user,
  onItemUpdated,
}: MarkIncompleteButtonProps) {
  const { state, post } = useHeadlessResource(href, user);

  const handleMarkIncomplete = async () => {
    await post({}, { onSuccess: onItemUpdated });
  };

  return (
    <Button
      type="danger"
      action={handleMarkIncomplete}
      disabled={state.status === 'updating'}
    >
      Mark Incomplete
    </Button>
  );
}

function RunItemActions({
  completeHref,
  markIncompleteHref,
  user,
  onItemUpdated,
}: RunItemActionsProps) {
  return (
    <div className="flex flex-row justify-end">
      {completeHref && (
        <CompleteButton
          href={completeHref}
          user={user}
          onItemUpdated={onItemUpdated}
        />
      )}
      {markIncompleteHref && (
        <MarkIncompleteButton
          href={markIncompleteHref}
          user={user}
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
  user,
  onItemUpdated,
}: RunItemProps) {
  const completedAt = completed
    ? new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(completed.completed_at))
    : null;

  const style = completed ? "opacity-60" : "";
  return (
    <div
      className={`p-4 border border-gray-200 rounded-md snap-start bg-gray-50 ${style}`}
    >
      <div className="mb-3">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        {description && (
          <p className="text-gray-500 text-sm mt-1 whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="text-xs text-gray-400">
            {completed && (
              <>
                <span>Completed on {completedAt}</span>
                {completed.note && (
                  <p className="mt-1 text-gray-500 italic">{completed.note}</p>
                )}
              </>
            )}
          </div>
          <RunItemActions
            completeHref={completeHref}
            markIncompleteHref={markIncompleteHref}
            user={user}
            onItemUpdated={onItemUpdated}
          />
        </div>
      </div>
    </div>
  );
}
