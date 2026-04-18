import { test as base, type Page } from '@playwright/test';

// Re-export the standard Playwright test since auth state is handled globally
export const test = base;

// Helper function to logout user
export async function logout(page: Page) {
  // Look for logout button or menu
  const logoutButton = page.locator('text=Logout, text=Sign out, [data-testid="logout"]').first();
  
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    // Wait for redirect to login page
    await page.waitForURL('/login');
  }
}

// Helper function to wait for API responses
export async function waitForApiResponse(page: Page, apiPath: string) {
  return await page.waitForResponse(response => 
    response.url().includes(apiPath) && response.status() === 200
  );
}

// Helper function to mock API responses
export async function mockApiResponse(page: Page, apiPath: string, responseData: any) {
  await page.route(`**${apiPath}**`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}
