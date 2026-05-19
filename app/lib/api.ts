import type { User } from "firebase/auth";
import { Resource } from "./hal";

const ALLOWED_DOMAIN = "api.checklists.keeoon.dev";

function validateHref(href: string): URL {
  const url = URL.parse(href, "https://api.checklists.keeoon.dev/");
  if (url === null) {
    throw new Error(`Invalid href: ${href}`);
  }
  if (url.hostname !== ALLOWED_DOMAIN) {
    throw new Error(
      `Invalid domain: ${url.hostname}. Only ${ALLOWED_DOMAIN} is allowed.`,
    );
  }
  return url;
}

export function apiResourceActions<POST = unknown>(href: string, user: User) {
  const hrefUrl = validateHref(href);

  return {
    get: async (): Promise<Resource> => {
      const idToken = await user.getIdToken();
      const response = await fetch(hrefUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      return new Resource(json);
    },
    post: async (data: POST): Promise<string | null> => {
      const idToken = await user.getIdToken();
      const response = await fetch(hrefUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.headers.get("Location");
    },
    delete: async (): Promise<void> => {
      const idToken = await user.getIdToken();
      const response = await fetch(hrefUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    },
  };
}

export type Checklist = {
  title: string;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

export type WriteableChecklistRun = {
  title: string;
  items: {
    name: string;
    title: string;
    description: string;
  }[];
};

export type ChecklistRun = {
  title: string;
  items: {
    name: string;
    title: string;
    description: string;
    completed: {
      completed_at: string;
      note: string;
    };
  }[];
};
