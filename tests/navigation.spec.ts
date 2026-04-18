import { expect } from '@playwright/test';
import { test } from './utils/auth';

test.describe('Navigation and Routing', () => {
  test('should render home page with welcome content when authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Verify we're on the home page
    await expect(page).toHaveURL('/');
    
    // Check for welcome content
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/New React Router App/);
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Welcome to React Router!/);
  });

  test('should show API status box on home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('status', { name: "api connection status" })).toBeVisible();
  });


});
