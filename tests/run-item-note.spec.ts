import { test, expect } from "@playwright/test";
import { encodeApiUrl } from "../app/lib/encoding";

const stagingBaseUrl = "https://checklists-staging-486418.ew.r.appspot.com/";

test.describe("run item notes", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/app/lib/auth.tsx*", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
          const user = { uid: "test-user", getIdToken: async () => "test-id-token" };
          export function AuthProvider({ children }) { return children; }
          export function useAuth() {
            return { user, loading: false, signOut: async () => {} };
          }
          export async function getUser() { return user; }
        `,
      }),
    );
    await page.route(stagingBaseUrl, (route) =>
      route.fulfill({
        json: {
          _links: {
            related: [
              { name: "checklists", href: new URL("test-checklists", stagingBaseUrl).href },
              { name: "checklist-instances", href: new URL("test-runs", stagingBaseUrl).href },
            ],
          },
        },
      }),
    );
  });

  test("adds, edits, and removes a note on a run item and renders accessible text styles", async ({
    page,
  }) => {
    const runHref = new URL("test-runs/note-run", stagingBaseUrl).href;
    const noteHref = new URL("test-runs/note-run/items/item-1/note", stagingBaseUrl).href;
    const completeHref = new URL("test-runs/note-run/items/item-1/complete", stagingBaseUrl).href;

    let currentNote: string | undefined;
    const requests: { method: string; body?: unknown; authorization?: string }[] = [];

    await page.route(runHref, (route) =>
      route.fulfill({
        json: {
          id: "note-run",
          title: "Note Run",
          items: [
            {
              name: "item-1",
              title: "First step",
              description: "Detailed instructions",
              ...(currentNote !== undefined ? { note: currentNote } : {}),
              completed: null,
            },
          ],
          _links: {
            self: { href: runHref },
            "complete-item": { name: "item-1", href: completeHref },
          },
          _nested: {
            items: [
              {
                id: "item-1",
                title: "First step",
                description: "Detailed instructions",
                ...(currentNote !== undefined ? { note: currentNote } : {}),
                completed: null,
                _links: {
                  "complete-item": { href: completeHref },
                  update: { name: "note", href: noteHref },
                },
              },
            ],
          },
        },
      }),
    );

    await page.route(noteHref, (route) => {
      const request = route.request();
      const method = request.method();
      const authorization = request.headers()["authorization"];
      if (method === "PUT") {
        const body = request.postDataJSON() as { note: string };
        requests.push({ method, body, authorization });
        currentNote = body.note;
        return route.fulfill({ status: 204, body: "" });
      }
      if (method === "DELETE") {
        requests.push({ method, authorization });
        currentNote = undefined;
        return route.fulfill({ status: 204, body: "" });
      }
      return route.abort();
    });

    await page.goto(`/en/runs/show/${encodeApiUrl(runHref)}`);

    const description = page.getByText("Detailed instructions", { exact: true });
    await expect(description).toBeVisible();
    await expect(description).toHaveClass(/text-gray-900/);

    await page.getByRole("button", { name: "Add note", exact: true }).click();
    const noteInput = page.getByRole("textbox", { name: "Note", exact: true });
    await expect(noteInput).toBeVisible();
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();

    await noteInput.pressSequentially("Checked torque settings");
    await expect(noteInput).toHaveValue("Checked torque settings");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    const noteElement = page.getByText("Checked torque settings", { exact: true });
    await expect(noteElement).toBeVisible();
    await expect(noteElement).toHaveClass(/text-gray-600/);
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PUT");
    expect(requests[0].body).toEqual({ note: "Checked torque settings" });
    expect(requests[0].authorization).toMatch(/^Bearer /);

    await page.getByRole("button", { name: "Edit note", exact: true }).click();
    await expect(noteInput).toHaveValue("Checked torque settings");
    await noteInput.fill("Updated torque settings");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.getByText("Updated torque settings", { exact: true })).toBeVisible();
    expect(requests).toHaveLength(2);
    expect(requests[1].method).toBe("PUT");
    expect(requests[1].body).toEqual({ note: "Updated torque settings" });

    await page.getByRole("button", { name: "Edit note", exact: true }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();

    await expect(noteInput).toBeHidden();
    await expect(page.getByText("Updated torque settings", { exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Add note", exact: true })).toBeVisible();
    expect(requests).toHaveLength(3);
    expect(requests[2].method).toBe("DELETE");
    expect(requests[2].authorization).toMatch(/^Bearer /);
  });

  test("preserves and displays notes on completed items", async ({ page }) => {
    const runHref = new URL("test-runs/completed-note-run", stagingBaseUrl).href;
    const noteHref = new URL("test-runs/completed-note-run/items/item-2/note", stagingBaseUrl).href;
    const incompleteHref = new URL(
      "test-runs/completed-note-run/items/item-2/incomplete",
      stagingBaseUrl,
    ).href;

    await page.route(runHref, (route) =>
      route.fulfill({
        json: {
          id: "completed-note-run",
          title: "Completed Note Run",
          items: [
            {
              name: "item-2",
              title: "Completed step",
              description: "Step description",
              note: "Completed with observation",
              completed: { completed_at: "2026-01-01T12:00:00Z" },
            },
          ],
          _links: {
            self: { href: runHref },
            "mark-incomplete-item": { name: "item-2", href: incompleteHref },
          },
          _nested: {
            items: [
              {
                id: "item-2",
                title: "Completed step",
                description: "Step description",
                note: "Completed with observation",
                completed: { completed_at: "2026-01-01T12:00:00Z" },
                _links: {
                  "mark-incomplete-item": { href: incompleteHref },
                  update: { name: "note", href: noteHref },
                },
              },
            ],
          },
        },
      }),
    );

    await page.goto(`/en/runs/show/${encodeApiUrl(runHref)}`);

    await expect(page.getByText("Step description", { exact: true })).toHaveClass(
      /text-gray-900/,
    );
    await expect(
      page.getByText("Completed with observation", { exact: true }),
    ).toHaveClass(/text-gray-600/);
    await expect(page.getByRole("button", { name: "Edit note", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark Incomplete", exact: true })).toBeVisible();
  });
});
