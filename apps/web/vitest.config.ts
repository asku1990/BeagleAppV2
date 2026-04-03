import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@web": fileURLToPath(new URL("./", import.meta.url)),
      "@server": fileURLToPath(
        new URL("../../packages/server", import.meta.url),
      ),
      "@db": fileURLToPath(new URL("../../packages/db", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      include: [
        "app/actions/admin/**/*.ts",
        "app/actions/public/home/**/*.ts",
        "app/api/**/*.ts",
        "components/beagle-search/**/*.tsx",
        "components/home/**/*.tsx",
        "hooks/public/beagle/search/**/*.ts",
        "hooks/i18n/**/*.ts",
        "lib/public/beagle/search/**/*.ts",
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
