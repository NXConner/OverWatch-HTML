import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "..",
  testMatch: ["frontend/tests/**/*.spec.ts", "e2e/**/*.spec.ts"],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "frontend/playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "frontend-smoke",
      testMatch: ["frontend/tests/**/*.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-smoke",
      testMatch: ["e2e/**/*.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
