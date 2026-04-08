import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@db": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      include: ["dogs/**/*.ts"],
      exclude: ["**/__tests__/**", "**/index.ts"],
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
