# Beagle App v2

Monorepo for a public Beagle database app with auth, admin-ready routing, and a single Next.js server runtime.

## Architecture

High-level runtime layout:

- `apps/web`: Next.js app (UI, API routes under `app/api/*`, Server Actions under `app/actions/*`).
- `packages/server`: backend use-cases, authorization, orchestration.
- `packages/db`: Prisma/database repositories.
- `packages/contracts`: shared request/response DTOs.
- `packages/api-client`: typed client wrappers for web usage.

Source of truth for dependency boundaries, canonical folder conventions, helper placement, and migration rules:

- `ARCHITECTURE.md`

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL (local or remote) for app data
- MariaDB (local or remote) only for phase-1 legacy imports

Ops safety commands and checklist are documented in `docs/ops-env-safety.md`.

## Environment setup

All commands in this README assume current directory is repo root: `beagle-app-v2/`.

1. Copy env file:

```bash
cp .env.example .env.local
cp .env.example .env.staging
cp .env.example .env.prod
```

2. Update env values in the target file:

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: Better Auth secret (minimum 32 chars, for example `openssl rand -base64 32`).
- `BETTER_AUTH_URL`: canonical app URL used by Better Auth (for local dev: `http://localhost:3000`).
- `RUN_DB_MIGRATIONS`: build-time toggle for deploy migrations (used by `pnpm vercel:build`). Default in script is `true` when unset.
- `BETTER_AUTH_SESSION_EXPIRES_IN`: session lifetime in seconds (default `1209600` = 14 days).
- `BETTER_AUTH_SESSION_UPDATE_AGE`: sliding refresh interval in seconds for active sessions (default `86400` = 1 day).
- `BOOTSTRAP_ADMIN_EMAIL`: first admin email for one-time bootstrap script.
- `BOOTSTRAP_ADMIN_PASSWORD`: first admin password for one-time bootstrap script (12-128 chars).
- `BOOTSTRAP_ADMIN_NAME`: optional first admin display name (falls back to email local-part).
- `SET_PASSWORD_EMAIL`: user email for password update helper command.
- `SET_PASSWORD_NEW_PASSWORD`: new password for password update helper command (12-128 chars).
- `NEXT_PUBLIC_API_URL`: optional API base URL override for web app clients. Default is same-origin.
- `CORS_ORIGINS`: optional comma-separated cross-origin allowlist for API responses.
- `LEGACY_DATABASE_URL`: MariaDB connection string to legacy Beagle DB for phase-1 imports.

Example plain values and Proton Pass reference blocks are in `.env.example`.

3. If using Proton Pass `pass://` references, run with an explicit env file:

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/web dev
```

For staging/prod variants and safety checklist, use `docs/ops-env-safety.md` as source of truth.

## Install dependencies

```bash
pnpm install
```

## Database setup

Generate Prisma client:

```bash
pnpm db:generate
```

Initialize schema (dev):

```bash
pnpm db:push
```

For explicit env-file variants (`.env.local/.env.staging/.env.prod`), see `docs/ops-env-safety.md`.

If you need to pass `--accept-data-loss`, run Prisma directly:

```bash
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma db push --accept-data-loss
```

Only use `--accept-data-loss` when you intentionally allow Prisma to apply destructive schema changes.

Create migrations in local dev (do not run `migrate dev` against staging/prod):

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma migrate dev --name init
```

Apply committed migrations:

```bash
pnpm db:deploy
```

For explicit env-file variants, see `docs/ops-env-safety.md`.

For `migrate reset` (destructive, requires env file), see `docs/ops-env-safety.md`.

For PostgreSQL dump/restore commands (`db:dump`, `db:restore`), see `docs/ops-env-safety.md`.

Prune audit log rows older than 12 months:

```bash
pnpm audit:prune
```

For SQL cleanup options and operational notes, see `docs/audit-logs.md`.

Open Prisma Studio:

```bash
pnpm db:studio
```

For explicit env-file variants, see `docs/ops-env-safety.md`.

## Run the app

Run the app (plain envs):

```bash
pnpm dev
```

Notes:

- `pnpm dev` uses environment variables already present in your shell/process.
- `pnpm dev` does not load `.env.local/.env.staging/.env.prod` by itself.

For explicit env-file app startup, see `docs/ops-env-safety.md`.

Default ports:

- App + API routes: `http://localhost:3000`

Run app directly:

```bash
pnpm --filter @beagle/web dev
```

## Vercel build

Set Vercel Build Command to:

```bash
pnpm vercel:build
```

This script runs Prisma client generation, builds the app, and applies committed migrations only after a successful build (by default).

To skip migrations for a specific environment, set:

```bash
RUN_DB_MIGRATIONS=false
```

For full Vercel project settings and troubleshooting (including `vercel:build` not found), see `docs/vercel-deployment.md`.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

For explicit env-file test variants, see `docs/ops-env-safety.md`.

Useful targeted checks:

```bash
pnpm --filter @beagle/web test:unit
pnpm --filter @beagle/server test:unit
pnpm --filter @beagle/web test:e2e
```

Playwright e2e:

```bash
pnpm test:playwright
```

CI note:

- This repo runs `turbo test:e2e`, and `test:e2e` depends on `build`.
- `@beagle/web` build validates Better Auth env at build time.
- Keep `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` available in CI job env and forwarded through Turbo `globalEnv` (see `turbo.json`).

## Test layout conventions

- Co-locate package/app unit or integration tests in `__tests__/` near the feature/module.
- Keep global Playwright e2e specs in the repo root `tests/e2e/`.
- Web Playwright config is in `apps/web/playwright.config.ts` and points to root `tests/e2e`.

## Auth and admin notes

- Better Auth is mounted at `/api/auth/*` via Next catch-all route.
- Email/password auth is enabled, but public sign-up is disabled (`disableSignUp: true`).
- Admin pages require `ADMIN` role.
- To test admin pages locally, create a user and set role to `ADMIN` in `BetterAuthUser`.

## Current API status

- Auth endpoints are provided by Better Auth under `/api/auth/*`.
- v1 import endpoints implemented:
  - `GET /api/v1/imports/:id`
  - `GET /api/v1/imports/:id/issues`
- Home statistics are loaded via Server Action + React Query hook in web UI (`apps/web/app/actions/public/home/statistics/get-home-statistics.ts` + `apps/web/queries/public/home/statistics/use-home-statistics-query.ts`).

## Better Auth CLI

Better Auth config lives at `packages/server/auth/better-auth.ts`, so pass `--config` when running CLI commands.

```bash
pnpm auth:generate
pnpm auth:migrate
```

## First admin bootstrap

For a fresh environment with public sign-up disabled, create the first `ADMIN` user with:

```bash
pnpm auth:bootstrap-admin
pass-cli run --env-file .env.local -- pnpm auth:bootstrap-admin
```

The script is idempotent:

- creates the admin user if missing
- promotes an existing matching user to `ADMIN`
- ensures credential account exists for email/password sign-in

Notes:

- `auth:bootstrap-admin` uses current process env values.
- Use `pass-cli run --env-file ...` to make the target env explicit.

## Update existing user password

To update an existing credential user password:

```bash
pass-cli run --env-file .env.local -- pnpm auth:set-password
```

It uses:

- `SET_PASSWORD_EMAIL`
- `SET_PASSWORD_NEW_PASSWORD`

Notes:

- `auth:set-password` uses current process env values.
- Use `pass-cli run --env-file ...` to make the target env explicit.
- For staging/prod variants, see `docs/ops-env-safety.md`.

## Beagle search

Supported filters:

- Primary filters: `ek`, `reg`, `name`
- Advanced filters: `sex`, `birthYearFrom`, `birthYearTo`, `ekOnly`, `multipleRegsOnly`

URL query params used by search page:

- Primary: `ek`, `reg`, `name`
- Advanced: `sex`, `birthYearFrom`, `birthYearTo`, `ekOnly=1`, `multiRegs=1`, `adv=1`
- Paging and sort: `page`, `sort`

Search mode behavior:

- Primary-only input resolves to one of: `ek`, `reg`, `name`
- Multiple filled primary fields resolve to `combined`
- No primary input resolves to `none`
- Advanced-only submissions resolve to `combined` (so search can run without primary fields)

Sort values:

- `name-asc`
- `birth-desc`
- `reg-desc`
- `created-desc`
- `ek-asc`

## Import basics

1. Run migration:

```bash
pnpm db:generate
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma migrate dev --name add_phase1_dog_search_stats_schema
```

2. Run phase-1 import script:

```bash
pnpm import:phase1
```

Optional: provide a user id to record who triggered the import run:

```bash
pnpm import:phase1 <USER_ID>
```

3. Inspect warning/error details from script output:

- During run, script prints grouped issue stats and samples.
- For full issue listing by run id:

```bash
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID>
```

Optional filters:

```bash
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID> --stage owners
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID> --code OWNER_DOG_NOT_FOUND
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID> --severity WARNING
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID> --limit 500
```

To export CSV files (instead of terminal output):

```bash
pass-cli run --env-file .env.local -- pnpm import:issues:csv <RUN_ID>
```

Default CSV output directory: `./tmp/import-issues/<RUN_ID>`.

4. Check import run status over API (admin auth required):

```bash
curl -i -c /tmp/beagle.cookies -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'

curl -i -b /tmp/beagle.cookies \
  http://localhost:3000/api/v1/imports/<RUN_ID>
```

Optional deep inspection via API:

```bash
curl -i -b /tmp/beagle.cookies \
  "http://localhost:3000/api/v1/imports/<RUN_ID>/issues?limit=200"

curl -i -b /tmp/beagle.cookies \
  "http://localhost:3000/api/v1/imports/<RUN_ID>/issues?severity=WARNING&limit=200"
```

For full import behavior (source tables, stage handling, required fields, issue codes, and logging), see `docs/import-phase1.md`.

## Where to add new features

- Add new backend business logic in `packages/server`.
- Keep `apps/web/app/api` routes thin (request/response mapping only).
- Use `apps/web/app/actions` for web-only reads/writes that do not need public HTTP transport.
- Add shared payload types in `packages/contracts`.
- Add client calls in `packages/api-client`.
- Consume from UI using React Query hooks in `apps/web/queries`.

## React Query write conventions

- Use `useQuery` hooks for UI reads.
- Use `useMutation` hooks for UI writes.
- After successful writes, invalidate affected query keys in `onSuccess` using `queryClient.invalidateQueries(...)` as the default cache policy.
- Define query keys as shared constants (for example, in feature-level `query-keys.ts`) instead of repeating inline string arrays.

## Architecture docs

- `ARCHITECTURE.md`: monorepo boundaries, dependency rules, and scaling path.
- `docs/api-versioning.md`: API path versioning policy (`/api/v1/...`).
- `docs/roles-and-permissions.md`: baseline role and authorization rules.
- `docs/import-phase1.md`: phase-1 import flow, data handling, and issue logging behavior.

Historical docs:

- `docs/archive/migration-plan-v1-to-v2.md`: archived migration planning notes from legacy app transition.

## Release notes and changelog

- Source of truth for release communication is `CHANGELOG.md`.
- Keep release entries in versioned blocks (`## [x.y.z] - YYYY-MM-DD`) with sections: `Added`, `Changed`, `Fixed`, `Removed`.
- For user-visible changes in a PR, add an `Unreleased` entry in `CHANGELOG.md`.
