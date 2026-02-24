import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      process.env.beagle_db_develop_DATABASE_URL_UNPOOLED ??
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.beagle_db_develop_POSTGRES_PRISMA_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.beagle_db_develop_POSTGRES_URL ??
      process.env.POSTGRES_URL ??
      process.env.beagle_db_develop_POSTGRES_URL_NO_SSL ??
      "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2",
  },
});
