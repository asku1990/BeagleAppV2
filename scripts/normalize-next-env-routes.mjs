import { existsSync, readFileSync, writeFileSync } from "node:fs";

const files = ["apps/web/next-env.d.ts", "apps/api/next-env.d.ts"];

for (const file of files) {
  if (!existsSync(file)) continue;

  const source = readFileSync(file, "utf8");
  const normalized = source.replace(
    /\.\/\.next\/dev\/types\/routes\.d\.ts/g,
    "./.next/types/routes.d.ts",
  );

  if (normalized !== source) {
    writeFileSync(file, normalized);
  }
}
