import { expect } from '@playwright/test';
import { test } from './utils/auth';

test.describe('Internationalization', () => {
  test.describe('unauthenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should redirect / to the detected browser locale', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL(/\/en(\/|$)/);
    });

    test('should render the login page in Portuguese', async ({ page }) => {
      await page.goto('/pt/login');

      await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
      await expect(
        page.getByRole('link', { name: 'Esqueceu-se da palavra-passe?' }),
      ).toBeVisible();
    });

    test('should render the login page in Spanish', async ({ page }) => {
      await page.goto('/es/login');

      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(
        page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }),
      ).toBeVisible();
    });

    test('should redirect unsupported locales to a supported one', async ({ page }) => {
      await page.goto('/fr/login');

      await expect(page).toHaveURL(/\/(en|pt|es)\/login/);
    });
  });

  test.describe('language switcher', () => {
    test('should switch language and persist the choice', async ({ page }) => {
      await page.goto('/en');
      await expect(page.getByRole('link', { name: 'Runs' })).toBeVisible();

      await page.getByRole('combobox', { name: 'Language' }).selectOption('pt');

      await expect(page).toHaveURL(/\/pt\//);
      await expect(page.getByRole('link', { name: 'Execuções' })).toBeVisible();

      // Choice is persisted across reloads
      await page.reload();
      await expect(page).toHaveURL(/\/pt\//);
      await expect(page.getByRole('link', { name: 'Execuções' })).toBeVisible();
    });
  });
});
