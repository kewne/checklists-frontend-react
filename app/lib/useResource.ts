import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { fetchResource } from './api';
import { Resource, type HalDocument } from './hal';

export type ResourceState = 
  | { status: 'loading'; action: 'get' | 'post' | 'put' | 'delete' }
  | { status: 'error'; error: Error }
  | { status: 'success'; resource: Resource };

export type UseResourceReturn = {
  state: ResourceState;
  get: () => Promise<void>;
  post: (data: any) => Promise<void>;
  put: (data: any) => Promise<void>;
  delete: () => Promise<void>;
};

export function useResource(href: string, user: User): UseResourceReturn {
  const [state, setState] = useState<ResourceState>({ status: 'loading', action: 'get' });

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
  }, [href, user]);

  const get = useCallback(async () => {
    await loadResource();
  }, [loadResource]);

  const post = useCallback(async (data: any): Promise<void> => {
    setState({ status: 'loading', action: 'post' });
    const idToken = await user.getIdToken();

    const response = await fetch(href, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    await get();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }, [href, user, get]);

  const put = useCallback(async (data: any): Promise<void> => {
    setState({ status: 'loading', action: 'put' });
    const idToken = await user.getIdToken();

    const response = await fetch(href, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await get();
  }, [href, user, get]);

  const deleteResource = useCallback(async (): Promise<void> => {
    setState({ status: 'loading', action: 'delete' });
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

  return { state, get, post, put, delete: deleteResource };
}

export type HeadlessResourceState =
  | { status: 'idle' }
  | { status: 'updating'; action: 'post' | 'delete' }
  | { status: 'error'; error: Error };

export type UseHeadlessResourceReturn = {
  state: HeadlessResourceState;
  post: (data: any) => Promise<string | null>;
  delete: () => Promise<void>;
};

export function useHeadlessResource(href: string, user: User): UseHeadlessResourceReturn {
  const [state, setState] = useState<HeadlessResourceState>({ status: 'idle' });

  const post = useCallback(async (data: any): Promise<string | null> => {
    setState({ status: 'updating', action: 'post' });
    try {
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
      setState({ status: 'idle' });
      return response.headers.get('Location');
    } catch (error) {
      setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
      return null;
    }
  }, [href, user]);

  const deleteResource = useCallback(async (): Promise<void> => {
    setState({ status: 'updating', action: 'delete' });
    try {
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
      setState({ status: 'idle' });
    } catch (error) {
      setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
    }
  }, [href, user]);

  return { state, post, delete: deleteResource };
}
