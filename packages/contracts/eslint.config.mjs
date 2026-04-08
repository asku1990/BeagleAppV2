import config from "../config-eslint/index.mjs";

const contractsConfig = [
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
          message: "Use @contracts/ paths instead of deep relative imports.",
        },
      ],
    },
  },
];

export default contractsConfig;
