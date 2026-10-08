import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const requiredVariables = [
    "VITE_API_BASE_URL",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];
  for (const variable of requiredVariables) {
    if (!env[variable]?.trim()) {
      throw new Error(`Missing required ${mode} configuration: ${variable}`);
    }
  }

  const staging = mode === "staging";
  const projectId = staging ? "checklists-staging-486418" : "checklists-486418";
  const apiBaseUrl = staging
    ? "https://checklists-staging-486418.ew.r.appspot.com/"
    : "https://api.checklists.keeoon.dev/";
  if (
    env.VITE_FIREBASE_PROJECT_ID !== projectId ||
    env.VITE_FIREBASE_AUTH_DOMAIN !== `${projectId}.firebaseapp.com` ||
    env.VITE_API_BASE_URL !== apiBaseUrl
  ) {
    throw new Error(
      `Invalid ${mode} configuration: expected Firebase project ${projectId}, its auth domain, and API ${apiBaseUrl}`,
    );
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), basicSsl()],
  };
});
