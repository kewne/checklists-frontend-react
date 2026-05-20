import type { User } from "firebase/auth";
import {
  Resource,
  type HalDocument,
  type HalLink,
  type JsonProperties,
} from "./hal";

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

export interface ApiLink extends HalLink {
  actions<T extends JsonProperties>(): ReturnType<typeof apiResourceActions<T>>;
}

export class ApiResource<T extends JsonProperties = {}> extends Resource<T> {
  constructor(
    document: HalDocument,
    private readonly href: string,
    private readonly user: User,
  ) {
    super(document);
  }

  get actions() {
    return apiResourceActions(this.href, this.user)
  }

  getLinked<GET extends JsonProperties, POST extends JsonProperties>(
    rel: string,
    filter?: Parameters<Resource["getFirstLinkMatching"]>[1],
  ) {
    const link = this.getFirstLinkMatching(rel, filter);
    if (!link) {
      return undefined;
    }
    return apiResourceActions<GET, POST>(link.href, this.user).get();
  }

  getFirstLinkMatching(
    rel: string,
    filter?: (link: HalLink) => boolean,
  ): ApiLink | undefined {
    const link = super.getFirstLinkMatching(rel, filter);
    if (!link) {
      return undefined;
    }
    return {
      ...link,
      actions: () => apiResourceActions(link.href, this.user),
    };
  }

  getLinkArray(rel: string): ApiLink[] {
    return super.getLinkArray(rel).map((link) => ({
      ...link,
      actions: () => apiResourceActions(link.href, this.user),
    }));
  }
}

export function apiResourceActions<
  GET extends JsonProperties = {},
  POST extends JsonProperties = {},
>(href: string, user: User) {
  const hrefUrl = validateHref(href);

  return {
    get: async (): Promise<ApiResource<GET>> => {
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
      return new ApiResource(json, href, user);
    },
    post: async (data?: POST): Promise<string | null> => {
      const idToken = await user.getIdToken();
      const response = await fetch(hrefUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.headers.get("Location");
    },
    put: async (data: unknown): Promise<void> => {
      const idToken = await user.getIdToken();
      const response = await fetch(hrefUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
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
