# Vercel deployment

This repository supports two valid Vercel project configurations.

## Option A: project root at repository root

- Root Directory: `.`
- Build Command: `pnpm vercel:build`
- Uses root `package.json` script `vercel:build`.

## Option B: project root at `apps/web`

- Root Directory: `apps/web`
- Build Command: `pnpm vercel:build`
- Uses `apps/web/package.json` script `vercel:build`, which delegates to `../../scripts/vercel-build.sh`.

## Migration toggle

- `RUN_DB_MIGRATIONS=true` (default): run `pnpm db:migrate:deploy` after successful build.
- `RUN_DB_MIGRATIONS=false`: skip migration deploy in that environment.

## Database URL precedence on Vercel

- Runtime DB client resolution prefers scoped Vercel variables first (`beagle_db_<scope>_...`), then falls back to `DATABASE_URL`.
- Migration resolution (`prisma migrate deploy`) prefers non-pooled scoped values first (`beagle_db_<scope>_DATABASE_URL_UNPOOLED`, `beagle_db_<scope>_POSTGRES_URL_NON_POOLING`, or `beagle_db_<scope>_POSTGRES_URL_NO_SSL`).
- On Vercel, migration resolution does not fall back to generic `DATABASE_URL`; if the scoped direct URL is missing, the build fails early with a clear error instead of attempting a pooled connection.
- If `RUN_DB_MIGRATIONS=false`, the Prisma config uses the runtime URL so `prisma generate` can still run without a direct migration connection.
- For production deploys, set `beagle_db_production_POSTGRES_URL_NON_POOLING`, `beagle_db_production_POSTGRES_URL_NO_SSL`, or `beagle_db_production_DATABASE_URL_UNPOOLED` to ensure migrations run against a direct connection.

## Common failure: `Command "vercel:build" not found`

If Vercel logs show:

`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "vercel:build" not found`

check all of these:

1. Deployment is using the expected commit SHA (latest branch head).
2. Vercel project points to the correct repository and branch.
3. Root Directory and Build Command match one of the two supported options above.
