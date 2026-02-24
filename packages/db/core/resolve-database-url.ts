type DatabaseUrlTarget = "runtime" | "migration";

const COMMON_DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "beagle_db_develop_DATABASE_URL_UNPOOLED",
  "beagle_db_production_DATABASE_URL_UNPOOLED",
  "beagle_db_develop_POSTGRES_PRISMA_URL",
  "beagle_db_production_POSTGRES_PRISMA_URL",
  "beagle_db_develop_POSTGRES_URL",
  "beagle_db_production_POSTGRES_URL",
  "beagle_db_develop_POSTGRES_URL_NO_SSL",
  "beagle_db_production_POSTGRES_URL_NO_SSL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
] as const;

const DATABASE_URL_ENV_KEYS_BY_TARGET: Record<
  DatabaseUrlTarget,
  readonly (keyof NodeJS.ProcessEnv)[]
> = {
  runtime: [...COMMON_DATABASE_URL_ENV_KEYS, "POSTGRES_URL_NON_POOLING"],
  migration: [
    "DATABASE_URL",
    "beagle_db_develop_DATABASE_URL_UNPOOLED",
    "beagle_db_production_DATABASE_URL_UNPOOLED",
    "POSTGRES_URL_NON_POOLING",
    "beagle_db_develop_POSTGRES_PRISMA_URL",
    "beagle_db_production_POSTGRES_PRISMA_URL",
    "beagle_db_develop_POSTGRES_URL",
    "beagle_db_production_POSTGRES_URL",
    "beagle_db_develop_POSTGRES_URL_NO_SSL",
    "beagle_db_production_POSTGRES_URL_NO_SSL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
  ],
};

const LOCAL_DATABASE_URL =
  "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2";

function isProductionEnvironment(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
  target: DatabaseUrlTarget = "runtime",
): string {
  for (const key of DATABASE_URL_ENV_KEYS_BY_TARGET[target]) {
    const value = env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  if (!isProductionEnvironment(env)) {
    return LOCAL_DATABASE_URL;
  }

  throw new Error(
    "Database URL is not configured for production. Set DATABASE_URL or a supported beagle_db_production_* Postgres URL variable.",
  );
}
