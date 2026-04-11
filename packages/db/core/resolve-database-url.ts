type DatabaseTarget = "runtime" | "migration";
type Scope = "develop" | "production";

const LOCAL_DATABASE_URL =
  "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2";

function getScopeFromEnv(env: NodeJS.ProcessEnv): Scope {
  return env.VERCEL_ENV === "production" ? "production" : "develop";
}

function isVercelEnv(env: NodeJS.ProcessEnv): boolean {
  return env.VERCEL === "1" || env.VERCEL === "true" || Boolean(env.VERCEL_ENV);
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
  allowPooledFallback: boolean,
): string | undefined {
  const fallbackScope =
    primaryScope === "production" ? "develop" : "production";

  const primaryDirectUrl =
    scopedValue(env, primaryScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NON_POOLING") ??
    scopedValue(env, primaryScope, "POSTGRES_URL_NO_SSL") ??
    env.POSTGRES_URL_NON_POOLING ??
    env.POSTGRES_URL_NO_SSL;

  if (!allowPooledFallback) {
    return primaryDirectUrl;
  }

  return (
    primaryDirectUrl ??
    scopedValue(env, fallbackScope, "DATABASE_URL_UNPOOLED") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NON_POOLING") ??
    scopedValue(env, fallbackScope, "POSTGRES_URL_NO_SSL") ??
    scopedValue(env, primaryScope, "POSTGRES_PRISMA_URL") ??
    scopedValue(env, primaryScope, "POSTGRES_URL") ??
    env.POSTGRES_PRISMA_URL ??
    env.POSTGRES_URL ??
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

  const scopedResolvedUrl =
    target === "runtime"
      ? pickRuntimeUrl(env, scope)
      : pickMigrationUrl(env, scope, !isVercelEnv(env));

  const resolvedUrl =
    scopedResolvedUrl ?? env.DATABASE_URL ?? LOCAL_DATABASE_URL;

  if (target === "migration" && isVercelEnv(env) && !scopedResolvedUrl) {
    throw new Error(
      `Missing direct migration database URL for Vercel ${scope} deploys. Set one of beagle_db_${scope}_POSTGRES_URL_NON_POOLING, beagle_db_${scope}_DATABASE_URL_UNPOOLED, or POSTGRES_URL_NON_POOLING so prisma migrate deploy does not fall back to DATABASE_URL.`,
    );
  }

  return resolvedUrl;
}
