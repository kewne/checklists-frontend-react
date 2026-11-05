import { test, expect } from "../playwright/fixtures";
import { root } from "../app/lib/restspec-api";
import { encodeApiUrl } from "../app/lib/encoding";

const runsHref = new URL("test-runs", root.env.staging).href;
const runsPath = `/en/runs/list/${encodeApiUrl(runsHref)}`;

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

for (const shape of ["empty", "single", "array"] as const) {
  test(`loads a ${shape} run collection with bearer credentials`, async ({ page }) => {
    const firstHref = new URL("test-runs/first", root.env.staging).href;
    const secondHref = new URL("test-runs/second", root.env.staging).href;
    const createHref = new URL("test-runs/create", root.env.staging).href;
    const items = [
      { href: firstHref, title: "First run", name: "Ignored name" },
      { href: secondHref, name: "Named run" },
    ];
    await page.route(runsHref, (route) => route.fulfill({
      json: {
        _links: shape === "empty" ? {} : {
          items: shape === "single" ? items[0] : items,
          create: [
            { href: createHref },
            { href: new URL("test-runs/other-create", root.env.staging).href },
          ],
        },
      },
    }));
    const requestPromise = page.waitForRequest(runsHref);
    await page.goto(runsPath);
    const request = await requestPromise;
    expect(request.method()).toBe("GET");
    expect(/^Bearer \S+$/.test(await request.headerValue("authorization") ?? "")).toBe(true);

    if (shape === "empty") {
      await expect(page.getByText("No checklist instances found.", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Create run", exact: true })).toHaveCount(0);
      return;
    }

    await expect(page.getByRole("link", { name: "Create run", exact: true })).toHaveAttribute(
      "href", `/en/runs/create/${encodeApiUrl(createHref)}`,
    );
    await expect(page.getByRole("link", { name: "First run", exact: true })).toHaveAttribute(
      "href", `/en/runs/show/${encodeApiUrl(firstHref)}`,
    );
    await page.getByRole("button", { name: 'Bookmark "First run"', exact: true }).click();
    await expect.poll(() => page.evaluate(() => {
      const bookmarks = JSON.parse(localStorage.getItem("checklists.bookmarkedRuns") ?? "[]");
      return bookmarks.map((bookmark: { href: string; title: string }) => ({
        href: bookmark.href,
        title: bookmark.title,
      }));
    })).toContainEqual({ href: firstHref, title: "First run" });
    if (shape === "array") {
      await expect(page.getByRole("link", { name: "Named run", exact: true })).toHaveAttribute(
        "href", `/en/runs/show/${encodeApiUrl(secondHref)}`,
      );
    } else {
      await expect(page.getByRole("link", { name: "Named run", exact: true })).toHaveCount(0);
    }
  });
}

test("shows the run-list error boundary for a failed collection request", async ({ page }) => {
  await page.route(runsHref, (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto(runsPath);
  await expect(page.getByText("Invalid URL. Please go back and try again.", { exact: true })).toBeVisible();
});

test("rejects an untrusted run collection before making a request", async ({ page }) => {
  const untrustedHref = "https://untrusted.example/test-runs";
  const outboundRequests: string[] = [];
  await page.route("https://untrusted.example/**", (route) => {
    outboundRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`/en/runs/list/${encodeApiUrl(untrustedHref)}`);
  await expect(page.getByText("Invalid URL. Please go back and try again.", { exact: true })).toBeVisible();
  expect(outboundRequests).toEqual([]);
});
