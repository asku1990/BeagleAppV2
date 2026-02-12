import config from "../../packages/config-eslint/index.mjs";

const serverImportRestriction = [
  "error",
  {
    paths: [
      {
        name: "@beagle/server",
        message:
          "Use @beagle/server only inside apps/web app/api/** or lib/server/**.",
      },
      {
        name: "@beagle/db",
        message: "Import @beagle/db only through @beagle/server use-cases.",
      },
    ],
  },
];

const dbImportRestriction = [
  "error",
  {
    paths: [
      {
        name: "@beagle/db",
        message: "Import @beagle/db only through @beagle/server use-cases.",
      },
    ],
  },
];

const webConfig = [
  ...config,
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-imports": serverImportRestriction,
    },
  },
  {
    files: ["app/api/**/*.{ts,tsx,mts}", "lib/server/**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-imports": dbImportRestriction,
    },
  },
];

export default webConfig;
