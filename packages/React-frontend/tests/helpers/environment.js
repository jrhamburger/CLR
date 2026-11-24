import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

// Optional when the existing config or shell already provides these variables.
const envFile = fileURLToPath(new URL("../.env.test", import.meta.url));
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

export const appUrl = process.env.TEST_APP_URL || "http://localhost:5173";
export const apiUrl = process.env.TEST_API_URL || "http://localhost:5000";

export function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Set ${name} in tests/.env.test or your environment before running this test.`);
  }
  return value;
}
