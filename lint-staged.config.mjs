export default {
  "*.{js,jsx,ts,tsx,mjs,cjs}": [
    "pnpm exec prettier --write",
    "pnpm exec eslint --fix",
  ],
  "*.{json,md,css,scss,yml,yaml}": ["pnpm exec prettier --write"],
};
