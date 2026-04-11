import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./core/resolve-database-url";

const migrationTarget =
  process.env.RUN_DB_MIGRATIONS === "false" ? "runtime" : "migration";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: resolveDatabaseUrl(process.env, migrationTarget),
  },
});
