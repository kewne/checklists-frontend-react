import type { User } from 'firebase/auth';
import { Resource } from './hal';

export async function callChecklistsAPI(user: User): Promise<Resource> {
  const idToken = await user.getIdToken();

  const response = await fetch('https://api.checklists.keeoon.dev/', {
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
