import { test, expect } from "@playwright/test";
import { root } from "../app/lib/restspec-api";
import type { Checklist, ChecklistInstance } from "../app/lib/restspec-api";
import { encodeApiUrl } from "../app/lib/encoding";

test("reads generated root links with destination-scoped bearer credentials", async ({ page }) => {
  const checklistsHref = new URL("test-checklists", root.env.staging).href;
  await page.route(root.env.staging, (route) => route.fulfill({
    json: {
      _links: {
        related: { name: "checklists", href: "test-checklists" },
      },
    },
  }));
  await page.goto("/en/login");
  const requestPromise = page.waitForRequest(root.env.staging);
  const href = await page.evaluate(async () => {
    const api: typeof import("../app/lib/api") =
      await import(new URL("/app/lib/api.ts", location.origin).href);
    const resource = await api.getApiRoot({
      getIdToken: async () => "test-id-token",
    });
    return resource.getNamedLink("related", "checklists")?.href;
  });
  const request = await requestPromise;
  expect(href).toBe(checklistsHref);
  expect(request.method()).toBe("GET");
  expect(request.headers()["authorization"]).toBe("Bearer test-id-token");
  expect(request.headers()["accept"]).toBe("application/hal+json, application/json");
});

test("reads nullable generated run fields and obtains a token for each operation", async ({ page }) => {
  const href = new URL("test-run", root.env.staging).href;
  const document = {
    id: "run",
    title: "Test run",
    checklistId: null,
    createdAt: "2026-01-01T00:00:00Z",
    createdBy: "test-user",
    items: [
      { name: "first", title: "First", completed: null },
      {
        name: "second",
        title: "Second",
        completed: { completed_at: "2026-01-01T00:00:00Z", note: null },
      },
    ],
  } satisfies ChecklistInstance["properties"];
  const tokens: (string | undefined)[] = [];
  await page.route(href, (route) => {
    tokens.push(route.request().headers()["authorization"]);
    return route.fulfill({ json: document });
  });
  await page.goto("/en/login");
  const properties = await page.evaluate(async (href) => {
    const api: typeof import("../app/lib/api") =
      await import(new URL("/app/lib/api.ts", location.origin).href);
    let tokenCount = 0;
    const user = { getIdToken: async () => `test-token-${++tokenCount}` };
    await api.getApiResource<ChecklistInstance>(href, user);
    return (await api.getApiResource<ChecklistInstance>(href, user)).properties;
  }, href);
  expect(properties).toEqual(document);
  expect(tokens).toEqual(["Bearer test-token-1", "Bearer test-token-2"]);
});

test("rejects decoded untrusted links before requesting credentials or sending requests", async ({ page }) => {
  const untrustedHref = "https://untrusted.example/checklist";
  const requests: string[] = [];
  await page.route("https://untrusted.example/**", (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto("/en/login");
  const result = await page.evaluate(async (untrustedHref) => {
    const api: typeof import("../app/lib/api") =
      await import(new URL("/app/lib/api.ts", location.origin).href);
    const errors: string[] = [];
    let tokenCount = 0;
    const user = { getIdToken: async () => `test-token-${++tokenCount}` };
    try {
      await api.getApiResource<import("../app/lib/restspec-api").Checklist>(untrustedHref, user);
    } catch (error) {
      errors.push(String(error));
    }
    return { errors, tokenCount };
  }, untrustedHref);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("Invalid origin");
  expect(result.tokenCount).toBe(0);
  expect(requests).toEqual([]);
});

for (const failure of ["unavailable", "empty", "invalid-json"] as const) {
  test(`surfaces ${failure} generated resource responses`, async ({ page }) => {
    const href = new URL("test-failure", root.env.staging).href;
    await page.route(href, (route) => route.fulfill({
      status: failure === "unavailable" ? 503 : failure === "empty" ? 204 : 200,
      body: failure === "empty" ? "" : "Not JSON",
    }));
    await page.goto("/en/login");
    const error = await page.evaluate(async (href) => {
      const api: typeof import("../app/lib/api") =
        await import(new URL("/app/lib/api.ts", location.origin).href);
      try {
        await api.getApiResource<ChecklistInstance>(href, {
          getIdToken: async () => "test-id-token",
        });
      } catch (error) {
        return String(error);
      }
      throw new Error("Expected the read to fail");
    }, href);
    if (failure === "unavailable") expect(error).toContain("HTTP 503");
    if (failure === "empty") expect(error).toContain("Empty API response");
    if (failure === "invalid-json") expect(error).toContain("SyntaxError");
  });
}

test.describe("generated-read routes with mocked authentication", () => {
  const checklistsHref = new URL("test-checklists", root.env.staging).href;
  const runsHref = new URL("test-runs", root.env.staging).href;

  test.beforeEach(async ({ page }) => {
    await page.route("**/app/lib/auth.tsx*", (route) => route.fulfill({
      contentType: "application/javascript",
      body: `
        const user = { uid: "test-user", getIdToken: async () => "test-id-token" };
        export function AuthProvider({ children }) { return children; }
        export function useAuth() {
          return { user, loading: false, signOut: async () => {} };
        }
        export async function getUser() { return user; }
      `,
    }));
    await page.route(root.env.staging, (route) => route.fulfill({
      json: {
        _links: {
          related: [
            { name: "checklists", href: checklistsHref },
            { name: "checklist-instances", href: runsHref },
          ],
        },
      },
    }));
    for (const href of [checklistsHref, runsHref]) {
      await page.route(href, (route) => route.fulfill({ json: { _links: {} } }));
    }
  });

  for (const [entry, collection, href] of [
    ["/en/", "runs", runsHref],
    ["/en/runs", "runs", runsHref],
    ["/en/checklists", "checklists", checklistsHref],
  ]) {
    test(`follows generated root links from ${entry}`, async ({ page }) => {
      await page.goto(entry);
      await expect(page).toHaveURL(`/en/${collection}/list/${encodeApiUrl(href)}`);
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      const menu = page.getByRole("menu", { name: "Menu", exact: true });
      await expect(menu.getByRole("link", { name: "Checklists", exact: true }))
        .toHaveAttribute("href", "/en/checklists");
      await expect(menu.getByRole("link", { name: "Runs", exact: true }))
        .toHaveAttribute("href", "/en/runs");
    });
  }

  test("renders and edits a generated checklist with an omitted description", async ({ page }) => {
    const href = new URL("test-checklists/first", root.env.staging).href;
    const properties = {
      id: "first",
      title: "Test checklist",
      createdBy: "test-user",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      items: [{ id: "step", title: "First step" }],
    } satisfies Checklist["properties"];
    await page.route(href, (route) => route.fulfill({
      json: { ...properties, _links: { self: { href } } },
    }));
    await page.goto(`/en/checklists/show/${encodeApiUrl(href)}`);
    await expect(page.getByText("First step", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Edit", exact: true }).click();
    await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Test checklist");
    await expect(page.getByLabel("Step Title", { exact: true })).toHaveValue("First step");
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  });

  test("saves a checklist edit with a bearer-authenticated PUT", async ({ page }) => {
    const href = new URL("test-checklists/second", root.env.staging).href;
    const puts: { authorization?: string; body: { title: string } }[] = [];
    await page.route(href, (route) => {
      const request = route.request();
      if (request.method() === "PUT") {
        puts.push({
          authorization: request.headers()["authorization"],
          body: request.postDataJSON(),
        });
      }
      return route.fulfill({
        json: {
          id: "second",
          title: "Test checklist",
          createdBy: "test-user",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          items: [{ id: "step", title: "First step" }],
          _links: { self: { href } },
        },
      });
    });
    await page.goto(`/en/checklists/edit/${encodeApiUrl(href)}`);
    await page.getByLabel("Title", { exact: true }).fill("Renamed checklist");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => puts.length).toBe(1);
    expect(puts[0].authorization).toMatch(/^Bearer /);
    expect(puts[0].body.title).toBe("Renamed checklist");
  });

  test("creates a checklist with a bearer-authenticated POST", async ({ page }) => {
    const href = new URL("test-checklists", root.env.staging).href;
    const posts: { authorization?: string; body: { title: string } }[] = [];
    await page.route(href, (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        posts.push({
          authorization: request.headers()["authorization"],
          body: request.postDataJSON(),
        });
        return route.fulfill({ status: 201, headers: { Location: `${href}/new` } });
      }
      return route.fulfill({ json: { _links: {} } });
    });
    await page.goto(`/en/checklists/create/${encodeApiUrl(href)}`);
    await page.getByLabel("Title", { exact: true }).fill("New checklist");
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page).toHaveURL(`/en/checklists/list/${encodeApiUrl(href)}`);
    expect(posts).toHaveLength(1);
    expect(posts[0].authorization).toMatch(/^Bearer /);
    expect(posts[0].body.title).toBe("New checklist");
  });

  test("renders and edits nullable generated run fields and reads its source checklist", async ({ page }) => {
    const href = new URL("test-runs/first", root.env.staging).href;
    const sourceHref = new URL("test-checklists/source", root.env.staging).href;
    const properties = {
      id: "first",
      title: "Test run",
      checklistId: "source",
      createdBy: "test-user",
      createdAt: "2026-01-01T00:00:00Z",
      items: [
        { name: "todo", title: "Pending step", completed: null },
        {
          name: "done",
          title: "Finished step",
          completed: { completed_at: "2026-01-01T00:00:00Z", note: null },
        },
      ],
    } satisfies ChecklistInstance["properties"];
    await page.route(href, (route) => route.fulfill({
      json: {
        ...properties,
        _links: {
          self: { href },
          related: { name: "checklist", href: sourceHref },
          "complete-item": { name: "todo", href: `${href}/complete/todo` },
          "mark-incomplete-item": { name: "done", href: `${href}/incomplete/done` },
        },
      },
    }));
    await page.route(sourceHref, (route) => route.fulfill({
      json: {
        id: "source",
        title: "Source checklist",
        items: [],
        createdBy: "test-user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    }));
    await page.goto(`/en/runs/show/${encodeApiUrl(href)}`);
    await expect(page.getByText("Pending step", { exact: true })).toBeVisible();
    await expect(page.getByText("Finished step", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark Complete", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark Incomplete", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Source checklist", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Edit...", exact: true }).click();
    await expect(page.getByPlaceholder("Enter run title", { exact: true })).toHaveValue("Test run");
    await expect(page.getByRole("textbox").nth(1)).toHaveValue("Pending step");
    await expect(page.getByRole("textbox").nth(2)).toHaveValue("Finished step");
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  });
});
