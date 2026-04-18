import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { fetchResource } from './api';
import { Resource, type HalDocument } from './hal';

export type ResourceState = 
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; resource: Resource };

export type UseResourceOptions = {
  autoFetch?: boolean;
};

export type UseResourceReturn = {
  state: ResourceState;
  get: () => Promise<void>;
  post: (data: any) => Promise<void>;
  delete: () => Promise<void>;
};

/**
 * Hook to fetch a resource from the API
 * @param href - The URL of the resource to fetch
 * @param user - The authenticated user making the request
 * @param options - Configuration options (autoFetch defaults to true)
 * @returns Object with state, get function, post function, and delete function
 */
export function useResource(href: string, user: User, options?: UseResourceOptions): UseResourceReturn {
  const [state, setState] = useState<ResourceState>({ status: 'loading' });
  const autoFetch = options?.autoFetch !== false;

  const loadResource = useCallback(async () => {
    try {
      const resource = await fetchResource(user, href);
      setState({ status: 'success', resource });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [href, user]);

  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;

    const load = async () => {
      try {
        const resource = await fetchResource(user, href);
        if (isMounted) {
          setState({ status: 'success', resource });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [href, user, autoFetch]);

  const get = useCallback(async () => {
    await loadResource();
  }, [loadResource]);

  const post = useCallback(async (data: any): Promise<void> => {
    const idToken = await user.getIdToken();

    const response = await fetch(href, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  }, [href, user]);

  const deleteResource = useCallback(async (): Promise<void> => {
    const idToken = await user.getIdToken();

    const response = await fetch(href, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  }, [href, user]);

  return { state, get, post, delete: deleteResource };
}
