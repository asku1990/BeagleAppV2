import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "../resolve-database-url";

describe("resolveDatabaseUrl", () => {
  it("prefers DATABASE_URL when present", () => {
    const url = resolveDatabaseUrl({
      DATABASE_URL: "postgresql://from-database-url",
      POSTGRES_URL: "postgresql://from-postgres-url",
    });

    expect(url).toBe("postgresql://from-database-url");
  });

  it("falls back to local database in non-production", () => {
    const url = resolveDatabaseUrl({ NODE_ENV: "development" });
    expect(url).toBe(
      "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2",
    );
  });

  it("prefers pooled runtime URLs over non-pooling URLs", () => {
    const url = resolveDatabaseUrl({
      POSTGRES_URL_NON_POOLING: "postgresql://non-pooling",
      POSTGRES_PRISMA_URL: "postgresql://pooled",
    });

    expect(url).toBe("postgresql://pooled");
  });

  it("prefers develop-scoped URLs over production-scoped URLs", () => {
    const url = resolveDatabaseUrl({
      beagle_db_production_POSTGRES_PRISMA_URL: "postgresql://prod-pooled",
      beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://dev-pooled",
    });

    expect(url).toBe("postgresql://dev-pooled");
  });

  it("allows migration target to prefer non-pooling URL", () => {
    const url = resolveDatabaseUrl(
      {
        POSTGRES_URL_NON_POOLING: "postgresql://non-pooling",
        POSTGRES_PRISMA_URL: "postgresql://pooled",
      },
      "migration",
    );

    expect(url).toBe("postgresql://non-pooling");
  });

  it("throws in production when no database url is configured", () => {
    expect(() =>
      resolveDatabaseUrl({
        NODE_ENV: "production",
      }),
    ).toThrowError(/Database URL is not configured for production/i);
  });
});
