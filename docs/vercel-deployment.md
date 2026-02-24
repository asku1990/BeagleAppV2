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

## Common failure: `Command "vercel:build" not found`

If Vercel logs show:

`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "vercel:build" not found`

check all of these:

1. Deployment is using the expected commit SHA (latest branch head).
2. Vercel project points to the correct repository and branch.
3. Root Directory and Build Command match one of the two supported options above.
