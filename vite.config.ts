import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { root } from "./app/lib/restspec-api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const requiredVariables = [
    "VITE_API_ENV",
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

  if (!Object.hasOwn(root.env, env.VITE_API_ENV)) {
    throw new Error(
      `Invalid ${mode} configuration: VITE_API_ENV must be one of ${Object.keys(root.env).join(", ")}`,
    );
  }

  const staging = env.VITE_API_ENV === "staging";
  const projectId = staging ? "checklists-staging-486418" : "checklists-486418";
  if (
    env.VITE_FIREBASE_PROJECT_ID !== projectId ||
    env.VITE_FIREBASE_AUTH_DOMAIN !== `${projectId}.firebaseapp.com`
  ) {
    throw new Error(
      `Invalid ${mode} configuration: expected Firebase project ${projectId} and its auth domain for API environment ${env.VITE_API_ENV}`,
    );
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), basicSsl()],
  };
});
