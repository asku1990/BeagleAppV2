import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@server": fileURLToPath(new URL("./", import.meta.url)),
      "@db": fileURLToPath(new URL("../db", import.meta.url)),
    },
  },
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      include: [
        "admin/**/*.ts",
        "auth/**/*.ts",
        "dogs/**/*.ts",
        "home/**/*.ts",
        "core/**/*.ts",
      ],
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
