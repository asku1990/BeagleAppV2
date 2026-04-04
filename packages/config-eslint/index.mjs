import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "import/export": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-cycle": [
        "warn",
        {
          ignoreExternal: true,
        },
      ],
      "import/no-duplicates": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts"]),
]);
