import type { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
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

type Properties = Record<string, unknown>

export type ResourceState<
  T extends Properties = Properties,
> =
  | { status: "loading"; action: "get" | "post" | "put" | "delete" }
  | { status: "error"; error: Error }
  | { status: "success"; resource: Resource<T> };

export type UseResourceReturn<
  GET extends Properties,
  PUT extends Properties = GET,
> = {
  state: ResourceState<GET>;
  get: () => Promise<void>;
  post: (data: any) => Promise<void>;
  put: (data: PUT) => Promise<void>;
  delete: () => Promise<void>;
};

export function useResource<
  GET extends Properties,
  PUT extends Properties = GET,
>(href: string, user: User): UseResourceReturn<GET> {
  const hrefUrl = validateHref(href);
  const [state, setState] = useState<ResourceState<GET>>({
    status: "loading",
    action: "get",
  });

  useEffect(() => {
    get();
  }, [href, user]);

  const get = useCallback(async () => {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(href, {
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
      setState({ status: "success", resource: new Resource(json) });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [href, user]);

  const post = useCallback(
    async (data: any): Promise<void> => {
      setState({ status: "loading", action: "post" });
      const idToken = await user.getIdToken();

      const response = await fetch(hrefUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      await get();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    },
    [href, user, get],
  );

  const put = useCallback(
    async (data: PUT): Promise<void> => {
      setState({ status: "loading", action: "put" });
      const idToken = await user.getIdToken();

      const response = await fetch(hrefUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await get();
    },
    [href, user, get],
  );

  const deleteResource = useCallback(async (): Promise<void> => {
    setState({ status: "loading", action: "delete" });
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
  }, [href, user]);

  return { state, get, post, put, delete: deleteResource };
}

export type HeadlessResourceState =
  | { status: "idle" }
  | { status: "updating"; action: "post" | "delete" }
  | { status: "error"; error: Error };

export type UseHeadlessResourceReturn = {
  state: HeadlessResourceState;
  post: (
    data: any,
    options?: { onSuccess?: () => Promise<void> },
  ) => Promise<string | null>;
  delete: () => Promise<void>;
};

export function useHeadlessResource(
  href: string,
  user: User,
): UseHeadlessResourceReturn {
  const hrefUrl = validateHref(href);
  const [state, setState] = useState<HeadlessResourceState>({ status: "idle" });

  const post = useCallback(
    async (
      data: any,
      options?: { onSuccess?: () => Promise<void> },
    ): Promise<string | null> => {
      setState({ status: "updating", action: "post" });
      try {
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
        if (options?.onSuccess) {
          await options.onSuccess();
        }
        setState({ status: "idle" });
        return response.headers.get("Location");
      } catch (error) {
        setState({
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return null;
      }
    },
    [href, user],
  );

  const deleteResource = useCallback(async (): Promise<void> => {
    setState({ status: "updating", action: "delete" });
    try {
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
      setState({ status: "idle" });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [href, user]);

  return { state, post, delete: deleteResource };
}
