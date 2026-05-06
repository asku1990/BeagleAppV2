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

  it("prefers scoped runtime URL over generic DATABASE_URL", () => {
    const url = resolveDatabaseUrl({
      DATABASE_URL: "postgresql://generic-runtime",
      beagle_db_develop_POSTGRES_PRISMA_URL: "postgresql://scoped-runtime",
    });

    expect(url).toBe("postgresql://scoped-runtime");
  });

  it("prefers scoped migration URL over generic DATABASE_URL", () => {
    const url = resolveDatabaseUrl(
      {
        DATABASE_URL: "postgresql://generic-migration",
        beagle_db_develop_POSTGRES_URL_NON_POOLING:
          "postgresql://scoped-migration",
      },
      "migration",
    );

    expect(url).toBe("postgresql://scoped-migration");
  });

  it("rejects Vercel migration fallback to generic DATABASE_URL", () => {
    expect(() =>
      resolveDatabaseUrl(
        {
          VERCEL: "1",
          VERCEL_ENV: "production",
          DATABASE_URL: "postgresql://pooled-generic",
        },
        "migration",
      ),
    ).toThrowError(
      /Missing direct migration database URL for Vercel production deploys/,
    );
  });

  it("rejects pooled Vercel migration URLs", () => {
    expect(() =>
      resolveDatabaseUrl(
        {
          VERCEL: "1",
          VERCEL_ENV: "production",
          beagle_db_production_POSTGRES_PRISMA_URL:
            "postgresql://production-pooled",
          DATABASE_URL: "postgresql://pooled-generic",
        },
        "migration",
      ),
    ).toThrowError(
      /Missing direct migration database URL for Vercel production deploys/,
    );
  });

  it("accepts POSTGRES_URL_NO_SSL for Vercel migrations", () => {
    const url = resolveDatabaseUrl(
      {
        VERCEL: "1",
        VERCEL_ENV: "production",
        beagle_db_production_POSTGRES_URL_NO_SSL:
          "postgresql://production-no-ssl",
      },
      "migration",
    );

    expect(url).toBe("postgresql://production-no-ssl");
  });

  it("rejects fallback-scope direct URLs on Vercel migrations", () => {
    expect(() =>
      resolveDatabaseUrl(
        {
          VERCEL: "1",
          VERCEL_ENV: "production",
          beagle_db_develop_POSTGRES_URL_NO_SSL: "postgresql://develop-no-ssl",
        },
        "migration",
      ),
    ).toThrowError(
      /Missing direct migration database URL for Vercel production deploys/,
    );
  });
});
