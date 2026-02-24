import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./core/resolve-database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: resolveDatabaseUrl(process.env, "migration"),
  },
});
