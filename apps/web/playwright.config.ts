import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000"
  },
  webServer: [
    {
      command: "pnpm --dir ../api dev",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: "pnpm dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
});
