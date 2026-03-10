import type { User } from 'firebase/auth';

export interface ApiResult {
  success: boolean;
  error?: string;
}

export async function callChecklistsAPI(user: User): Promise<ApiResult> {
  try {
    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    // Call the checklists API
    const response = await fetch('https://api.checklists.keeoon.dev/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('API call failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}
