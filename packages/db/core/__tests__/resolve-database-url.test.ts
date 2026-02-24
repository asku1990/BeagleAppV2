import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "../resolve-database-url";

describe("resolveDatabaseUrl", () => {
  it("prefers production-scoped vars on Vercel production", () => {
    const url = resolveDatabaseUrl({
      VERCEL_ENV: "production",
      beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://develop-pooled",
      beagle_db_production_POSTGRES_PRISMA_URL:
        "postgresql://production-pooled",
    });

    expect(url).toBe("postgresql://production-pooled");
  });

  it("prefers develop-scoped vars outside Vercel production", () => {
    const url = resolveDatabaseUrl({
      VERCEL_ENV: "preview",
      beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://develop-pooled",
      beagle_db_production_POSTGRES_PRISMA_URL:
        "postgresql://production-pooled",
    });

    expect(url).toBe("postgresql://develop-pooled");
  });

  it("keeps runtime pooled URLs above non-pooling", () => {
    const url = resolveDatabaseUrl({
      beagle_db_develop_POSTGRES_URL_NON_POOLING:
        "postgresql://develop-nonpooling",
      beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://develop-pooled",
    });

    expect(url).toBe("postgresql://develop-pooled");
  });

  it("prefers non-pooling for migrations", () => {
    const url = resolveDatabaseUrl(
      {
        beagle_db_develop_POSTGRES_URL_NON_POOLING:
          "postgresql://develop-nonpooling",
        beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://develop-pooled",
      },
      "migration",
    );

    expect(url).toBe("postgresql://develop-nonpooling");
  });
});
