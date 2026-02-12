import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(thisDir, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2",
  },
});
