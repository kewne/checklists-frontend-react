import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Get test credentials from environment variables
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;
  
  if (!testEmail || !testPassword) {
    throw new Error(
      'TEST_EMAIL and TEST_PASSWORD environment variables must be set for authentication tests'
    );
  }

  // Perform authentication steps
  await page.goto('/en/login');
  
  // Wait for Firebase UI to load
  await page.waitForSelector('.firebase-auth-container, input[type="email"]', { timeout: 10000 });
  
  // Fill in login credentials - Firebase UI may have different selectors
  await page.fill('input[type="email"], input[name="email"]', testEmail);
  await page.fill('input[type="password"], input[name="password"]', testPassword);
  
  // Submit the form - look for Firebase UI submit button
  await page.click('button[type="submit"], .firebase-auth-container button');
  
  // Wait until the page receives the cookies and redirects away from login
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 10000 });
  
  // Wait for the page to be fully loaded and authenticated (main navigation visible)
  await expect(page.getByRole('link', { name: 'Runs' })).toBeVisible({ timeout: 10000 });

  // End of authentication steps - save the storage state
  await page.context().storageState({ indexedDB: true, path: authFile });
});
