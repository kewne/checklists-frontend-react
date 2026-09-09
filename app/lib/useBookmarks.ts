import { useSyncExternalStore } from "react";
import {
  listBookmarks,
  subscribeToBookmarks,
  type BookmarkedRun,
} from "./bookmarks";

const EMPTY_LIST: BookmarkedRun[] = [];

/**
 * Subscribes to the bookmark store so components re-render
 * whenever bookmarks change in this tab.
 */
export function useBookmarks(): BookmarkedRun[] {
  return useSyncExternalStore(subscribeToBookmarks, listBookmarks, () => EMPTY_LIST);
}
