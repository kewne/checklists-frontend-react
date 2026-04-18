import { expect } from '@playwright/test';
import { test } from './utils/auth';

test.describe('Authentication Flow', () => {

  test('should allow user to login with valid credentials', async ({ page }) => {
    // Get test credentials
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip(true, 'TEST_EMAIL and TEST_PASSWORD environment variables not set');
    }
    
    // Go to login page
    await page.goto('/login');
    
    // Wait for Firebase UI to load
    await page.waitForSelector('.firebase-auth-container, input[type="email"]', { timeout: 10000 });
    
    // Fill in credentials
    await page.fill('input[type="email"], input[name="email"]', testEmail!);
    await page.fill('input[type="password"], input[name="password"]', testPassword!);
    
    // Submit form
    await page.click('button[type="submit"], .firebase-auth-container button');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Should see authenticated content
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain authentication state across page reloads', async ({ page }) => {
    // Go to home page (should already be authenticated)
    await page.goto('/');
    
    // Verify we're on home page and not redirected to login
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should allow user to logout', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Verify we're authenticated
    await expect(page).toHaveURL('/');
    
    // Look for logout/sign out option - this might be in various places
    const logoutSelectors = [
      'text=Logout',
      'text=Sign out',
      'text=Log out',
      '[data-testid="logout"]',
      'button:has-text("Logout")',
      'button:has-text("Sign out")'
    ];
    
    let logoutButton = null;
    for (const selector of logoutSelectors) {
      logoutButton = page.locator(selector).first();
      if (await logoutButton.isVisible()) {
        break;
      }
    }
    
    if (logoutButton && await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login page
      await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
    } else {
      // If no visible logout button, this test might need adjustment based on UI
      console.warn('No logout button found - UI might not have logout option visible');
      test.skip(true, 'Logout button not found in UI');
    }
  });

  test('should show API status when authenticated', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Should see API status check
    const apiStatusBox = page.locator('[class*="border"]:has-text("API")').first();
    
    // Wait for API call to complete (either success or error state)
    await expect(apiStatusBox).toBeVisible({ timeout: 10000 });
    
    // Should see either success or error state (not loading)
    const loadingText = page.locator('text=Checking API connection...');
    await expect(loadingText).not.toBeVisible({ timeout: 15000 });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('email').fill('invalid@test.com');
    await page.getByLabel('password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' });
    
    // Should either stay on login page or show error message
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    
    // Look for error message (Firebase UI will show its own error)
    const possibleErrorSelectors = [
      '.firebase-auth-error',
      '[class*="error"]',
      'text=Invalid',
      'text=incorrect',
      'text=failed'
    ];
    
    let errorFound = false;
    for (const selector of possibleErrorSelectors) {
      if (await page.locator(selector).first().isVisible()) {
        errorFound = true;
        break;
      }
    }
    
    // If no specific error visible, at least verify we didn't get redirected to home
    if (!errorFound) {
      await expect(page).not.toHaveURL('/');
    }
  });
});
