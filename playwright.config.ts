import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Bangladesh traffic is mobile-heavy — keep a mobile project from day one.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.CI
    ? { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: false }
    : undefined,
});
