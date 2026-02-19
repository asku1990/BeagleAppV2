import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      include: [
        "app/actions/admin/**/*.ts",
        "app/actions/home/**/*.ts",
        "app/api/**/*.ts",
        "components/beagle-search/**/*.tsx",
        "components/home/**/*.tsx",
        "hooks/beagle-search/**/*.ts",
        "hooks/i18n/**/*.ts",
        "lib/beagle-search/**/*.ts",
        "lib/i18n/**/*.ts",
        "lib/server/**/*.ts",
        "queries/**/*.ts",
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
