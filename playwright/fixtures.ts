import {
  test as baseTest,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import {
  applicationDefault,
  deleteApp,
  initializeApp,
} from "firebase-admin/app";
import { getAuth, type Auth, type UserRecord } from "firebase-admin/auth";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { baseURL } from "../playwright.config";

export { expect } from "@playwright/test";

async function createUser(auth: Auth, parallelIndex: number) {
  const email = `playwright-${parallelIndex}-${randomUUID()}@example.com`;
  const password = `Pw1!${randomUUID()}`;
  const user = await auth.createUser({ email, password });
  return { email, password, user };
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/en/login");
  await page.getByLabel("Email Address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL(/\/en\/runs\/list\/.+/);
  await baseTest
    .expect(page.getByText("No checklist instances found.", { exact: true }))
    .toBeVisible();
}

export const test = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      const root = fileURLToPath(new URL("../", import.meta.url));
      const env = loadEnv("staging", root, "VITE_");
      if (
        !env.VITE_FIREBASE_API_KEY?.trim() ||
        env.VITE_FIREBASE_PROJECT_ID !== "checklists-staging-486418" ||
        env.VITE_FIREBASE_AUTH_DOMAIN !==
          "checklists-staging-486418.firebaseapp.com" ||
        env.VITE_API_BASE_URL !==
          "https://checklists-staging-486418.ew.r.appspot.com/"
      ) {
        throw new Error(
          "Playwright requires valid staging Firebase and backend settings.",
        );
      }

      const app = initializeApp(
        {
          credential: applicationDefault(),
          projectId: env.VITE_FIREBASE_PROJECT_ID,
        },
        `playwright-${workerInfo.parallelIndex}-${randomUUID()}`,
      );
      const auth = getAuth(app);
      const authFile = path.join(
        workerInfo.project.outputDir,
        ".auth",
        `${workerInfo.parallelIndex}.json`,
      );
      let user: UserRecord | undefined;
      let context: BrowserContext | undefined;

      try {
        const account = await createUser(auth, workerInfo.parallelIndex);
        user = account.user;

        context = await browser.newContext({
          baseURL,
          ignoreHTTPSErrors: true,
          locale: "en-US",
          storageState: { cookies: [], origins: [] },
        });
        const page = await context.newPage();
        await login(page, account.email, account.password);
        await mkdir(path.dirname(authFile), { recursive: true });
        await context.storageState({ path: authFile, indexedDB: true });
        await context.close();
        context = undefined;
        await use(authFile);
      } finally {
        try {
          if (user) {
            await auth.deleteUser(user.uid);
          }
        } finally {
          await Promise.all([
            context?.close(),
            rm(authFile, { force: true }),
            deleteApp(app),
          ]);
        }
      }
    },
    { scope: "worker" },
  ],
});
