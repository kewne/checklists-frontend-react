import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

export const baseURL = "https://localhost:5174";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    locale: "en-US",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev:staging --host localhost --port 5174 --strictPort",
    cwd: fileURLToPath(new URL("./", import.meta.url)),
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
  },
});
