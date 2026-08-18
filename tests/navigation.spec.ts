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

  test('should show a 404 page for unmatched paths inside a valid locale', async ({ page }) => {
    await page.goto('/en/this/route/does/not/exist');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText('The requested page could not be found.')).toBeVisible();
  });

  test('should redirect legacy non-locale unknown paths and then show a 404 page', async ({ page }) => {
    await page.goto('/this/route/does/not/exist');

    await expect(page).toHaveURL(/\/en\/this\/route\/does\/not\/exist/);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
});
