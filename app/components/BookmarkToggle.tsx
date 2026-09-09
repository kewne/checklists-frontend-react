import { useTranslation } from "react-i18next";
import { toggleBookmark } from "~/lib/bookmarks";
import { useBookmarks } from "~/lib/useBookmarks";

interface BookmarkToggleProps {
  /** Full API href of the run resource. */
  href: string;
  /** Run title, cached at bookmark time for menu display. */
  title: string;
}

export function BookmarkToggle({ href, title }: BookmarkToggleProps) {
  const { t } = useTranslation();
  const bookmarks = useBookmarks();
  const bookmarked = bookmarks.some((b) => b.href === href);

  return (
    <button
      type="button"
      aria-pressed={bookmarked}
      aria-label={
        bookmarked
          ? t("run.removeBookmark", { title })
          : t("run.bookmark", { title })
      }
      title={
        bookmarked
          ? t("run.removeBookmark", { title })
          : t("run.bookmark", { title })
      }
      onClick={() => toggleBookmark(href, title)}
      className="p-1 text-amber-500 hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-amber-400 dark:hover:text-amber-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-4 h-4"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
