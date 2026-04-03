import config from "../config-eslint/index.mjs";

const apiClientConfig = [
  ...config,
  {
    ignores: ["coverage/**"],
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ImportDeclaration[source.value=/^(?:\\.\\.\\/){2,}/]",
          message: "Use @api-client/ paths instead of deep relative imports.",
        },
      ],
    },
  },
];

export default apiClientConfig;
