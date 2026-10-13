import { test, expect } from "../playwright/fixtures";

test("opens the authenticated app", async ({ page }) => {
  await page.goto("/en/");
  await expect(page).toHaveURL(/\/en\/runs\/list\/.+/);
  await expect(
    page.getByText("No checklist instances found.", { exact: true }),
  ).toBeVisible();
});
