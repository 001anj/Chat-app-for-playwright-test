import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

/**
 * Client (Vite) and API (Express) are started separately via `npm run dev`
 * and must already be running before tests execute.
 */
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3022";
const JUNIT_OUTPUT_FILE = process.env.JUNIT_OUTPUT_FILE ?? "results.xml";

export default defineConfig({
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 1,
  workers: process.env.CI ? 2 : 2,
  reporter: process.env.CI
    ? [["junit", { outputFile: JUNIT_OUTPUT_FILE }], ["list"], ["github"]]
    : [["html"], ["list"]],
  use: {
    trace: "on-first-retry",
    testIdAttribute: "data-test-id",
  },

  projects: [
    {
      name: "api",
      testDir: "./tests/api-tests/specs",
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      name: "e2e-chromium",
      testDir: "./tests/e2e-tests/specs",
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: CLIENT_BASE_URL,
      },
    },
  ],
});
