import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      include: ["index.ts"],
      exclude: ["**/__tests__/**"],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
        perFile: true,
      },
    },
  },
});
