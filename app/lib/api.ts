import type { User } from 'firebase/auth';
import { Resource } from './hal';

async function fetchResource(user: User, href: string): Promise<Resource> {
  const idToken = await user.getIdToken();

  const response = await fetch(href, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return new Resource(await response.json());
}

export async function callChecklistsAPI(user: User): Promise<Resource> {
  return fetchResource(user, 'https://api.checklists.keeoon.dev/');
}

export { fetchResource };
