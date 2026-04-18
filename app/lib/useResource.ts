import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { fetchResource } from './api';
import type { Resource } from './hal';

export type ResourceState = 
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; resource: Resource };

/**
 * Hook to fetch a resource from the API
 * @param href - The URL of the resource to fetch
 * @param user - The authenticated user making the request
 * @returns The current state of the resource (loading, error, or success)
 */
export function useResource(href: string, user: User): ResourceState {
  const [state, setState] = useState<ResourceState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    const loadResource = async () => {
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

    loadResource();

    return () => {
      isMounted = false;
    };
  }, [href, user]);

  return state;
}
