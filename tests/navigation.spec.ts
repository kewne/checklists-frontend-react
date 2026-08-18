import { expect } from '@playwright/test';
import { test } from './utils/auth';

test.describe('Navigation and Routing', () => {
  test('should redirect the root path to the detected locale', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/en(\/|$)/);
  });

  test('should show the main navigation when authenticated', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('link', { name: 'Runs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Checklists' })).toBeVisible();
  });

  test('should redirect legacy non-locale URLs to the detected locale', async ({ page }) => {
    await page.goto('/checklists');

    await expect(page).toHaveURL(/\/en\//);
  });
});
