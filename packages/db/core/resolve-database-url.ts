type DatabaseTarget = "runtime" | "migration";
type Scope = "develop" | "production";

const LOCAL_DATABASE_URL =
  "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2";

function getScopeFromEnv(env: NodeJS.ProcessEnv): Scope {
  return env.VERCEL_ENV === "production" ? "production" : "develop";
}

function scopedValue(
  env: NodeJS.ProcessEnv,
  scope: Scope,
  key: string,
): string | undefined {
  return env[`beagle_db_${scope}_${key}`];
}

function pickRuntimeUrl(
  env: NodeJS.ProcessEnv,
  primaryScope: Scope,
): string | undefined {
  const fallbackScope =
    primaryScope === "production" ? "develop" : "production";

  return (
    scopedValue(env, primaryScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, primaryScope, "POSTGRES_PRISMA_URL") ??
    scopedValue(env, primaryScope, "POSTGRES_URL") ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NO_SSL") ??
    env.POSTGRES_PRISMA_URL ??
    env.POSTGRES_URL ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NON_POOLING") ??
    env.POSTGRES_URL_NON_POOLING ??
    scopedValue(env, fallbackScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, fallbackScope, "POSTGRES_PRISMA_URL") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NO_SSL") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NON_POOLING")
  );
}

function pickMigrationUrl(
  env: NodeJS.ProcessEnv,
  primaryScope: Scope,
): string | undefined {
  const fallbackScope =
    primaryScope === "production" ? "develop" : "production";

  return (
    scopedValue(env, primaryScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NON_POOLING") ??
    env.POSTGRES_URL_NON_POOLING ??
    scopedValue(env, primaryScope, "POSTGRES_PRISMA_URL") ??
    scopedValue(env, primaryScope, "POSTGRES_URL") ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NO_SSL") ??
    env.POSTGRES_PRISMA_URL ??
    env.POSTGRES_URL ??
    scopedValue(env, fallbackScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NON_POOLING") ??
    scopedValue(env, fallbackScope, "POSTGRES_PRISMA_URL") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NO_SSL")
  );
}

export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
  target: DatabaseTarget = "runtime",
): string {
  const scope = getScopeFromEnv(env);

  const resolvedUrl =
    env.DATABASE_URL ??
    (target === "runtime"
      ? pickRuntimeUrl(env, scope)
      : pickMigrationUrl(env, scope)) ??
    LOCAL_DATABASE_URL;

  return resolvedUrl;
}
