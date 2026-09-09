import { encodeApiUrl } from "./encoding";

/**
 * A run bookmarked for quick access from the top menu.
 * The title is cached at bookmark time; it is not refreshed from the API.
 */
export interface BookmarkedRun {
  /** Full API href of the run resource (unique identifier). */
  href: string;
  /** Base64-encoded href, safe for use in route params. */
  encodedHref: string;
  /** Title captured when the run was bookmarked. */
  title: string;
  /** ISO timestamp of when the bookmark was created. */
  bookmarkedAt: string;
}

/**
 * Storage seam for bookmarks. The localStorage implementation ships now;
 * a backend API implementation can replace it later without touching UI code.
 */
export interface BookmarkStorage {
  list(): BookmarkedRun[];
  add(bookmark: BookmarkedRun): void;
  remove(href: string): void;
}

const STORAGE_KEY = "checklists.bookmarkedRuns";

function isBookmarkedRun(value: unknown): value is BookmarkedRun {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.href === "string" &&
    typeof candidate.encodedHref === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.bookmarkedAt === "string"
  );
}

class LocalStorageBookmarkStorage implements BookmarkStorage {
  private read(): BookmarkedRun[] {
    if (typeof localStorage === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isBookmarkedRun);
    } catch {
      return [];
    }
  }

  private write(bookmarks: BookmarkedRun[]): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }

  list(): BookmarkedRun[] {
    return this.read();
  }

  add(bookmark: BookmarkedRun): void {
    const bookmarks = this.read().filter((b) => b.href !== bookmark.href);
    bookmarks.push(bookmark);
    this.write(bookmarks);
  }

  remove(href: string): void {
    this.write(this.read().filter((b) => b.href !== href));
  }
}

const storage: BookmarkStorage = new LocalStorageBookmarkStorage();

// --- Pub/sub so components can observe changes via useSyncExternalStore.
// localStorage fires no events in the tab that mutated it, so we notify manually.

// Cached snapshot: useSyncExternalStore compares getSnapshot results with
// Object.is, so the same reference must be returned until a mutation occurs.
let cachedList: BookmarkedRun[] | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToBookmarks(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  cachedList = storage.list();
  for (const listener of listeners) {
    listener();
  }
}

export function listBookmarks(): BookmarkedRun[] {
  if (cachedList === null) {
    cachedList = storage.list();
  }
  return cachedList;
}

export function isBookmarked(href: string): boolean {
  return storage.list().some((b) => b.href === href);
}

export function addBookmark(href: string, title: string): void {
  storage.add({
    href,
    encodedHref: encodeApiUrl(href),
    title,
    bookmarkedAt: new Date().toISOString(),
  });
  notify();
}

export function removeBookmark(href: string): void {
  storage.remove(href);
  notify();
}

export function toggleBookmark(href: string, title: string): void {
  if (isBookmarked(href)) {
    removeBookmark(href);
  } else {
    addBookmark(href, title);
  }
}
