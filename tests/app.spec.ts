import { test, expect } from "../playwright/fixtures";

test("opens the authenticated app", async ({ page }) => {
  await page.goto("/en/");
  await expect(page).toHaveURL(/\/en\/runs\/list\/.+/);
  await expect(
    page.getByText("No checklist instances found.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("menu", { name: "Menu", exact: true });
  await expect(menu.getByRole("link", { name: "Runs", exact: true })).toHaveAttribute(
    "href",
    "/en/runs",
  );
  await expect(
    menu.getByRole("link", { name: "Checklists", exact: true }),
  ).toHaveAttribute("href", "/en/checklists");
});
