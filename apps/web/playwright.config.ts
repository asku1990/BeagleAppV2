import { defineConfig } from "@playwright/test";

const targetEnv = process.env.PLAYWRIGHT_ENV ?? "local";

function resolveWebServerCommand(): string {
  if (process.env.CI) {
    return "pnpm --dir ../.. dev";
  }

  if (targetEnv === "staging") {
    return "pnpm --dir ../.. dev:staging";
  }

  if (targetEnv === "prod") {
    return "pnpm --dir ../.. dev:prod";
  }

  return "pnpm --dir ../.. dev:local";
}

export default defineConfig({
  testDir: "../../tests/e2e",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../../playwright-report" }],
  ],
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: resolveWebServerCommand(),
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
