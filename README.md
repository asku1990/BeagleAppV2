# Beagle App v2

Monorepo for a public Beagle database app with auth, admin-ready routing, and a single Next.js server runtime.

## Architecture

- `apps/web`: main Next.js app (public pages, auth pages, admin route group, API routes under `app/api/*`, and Server Actions under `app/actions/*`).
- `packages/server`: backend use-case services (auth + authorization helpers).
- `packages/db`: Prisma + PostgreSQL access (legacy import source uses MariaDB).
- `packages/contracts`: shared API request/response types.
- `packages/api-client`: typed HTTP client used by frontend hooks.

Current access model:

- Public reads are allowed.
- Admin area is guarded in `apps/web/app/(admin)`.
- Import write flow is not implemented yet.

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL (local or remote) for app data
- MariaDB (local or remote) only for phase-1 legacy imports

## Environment setup

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

3. If using Proton Pass `pass://` references, run via the env-specific scripts:

```bash
pnpm dev:local
pnpm dev:staging
pnpm dev:prod
```

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

Initialize schema against a specific environment:

```bash
pnpm db:push:local
pnpm db:push:staging
pnpm db:push:prod
```

If `pnpm db:push:staging -- --accept-data-loss` does not forward the flag correctly, run Prisma directly:

```bash
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma db push --accept-data-loss
```

Only use `--accept-data-loss` when you intentionally allow Prisma to apply destructive schema changes.

Or create migrations in dev:

```bash
pnpm db:migrate:dev -- --name init
```

Apply committed migrations to a specific environment:

```bash
pnpm db:deploy:local
pnpm db:deploy:staging
pnpm db:deploy:prod
```

Prune audit log rows older than 12 months:

```bash
pnpm audit:prune
```

Open Prisma Studio:

```bash
pnpm db:studio
```

## Run the app

Run the app (plain envs):

```bash
pnpm dev
```

Run the app with Proton Pass env files:

```bash
pnpm dev:local
pnpm dev:staging
pnpm dev:prod
```

Default ports:

- App + API routes: `http://localhost:3000`

Run app directly:

```bash
pnpm --filter @beagle/web dev
```

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Useful targeted checks:

```bash
pnpm --filter @beagle/web test:unit
pnpm --filter @beagle/server test:unit
pnpm --filter @beagle/web test:e2e
```

Playwright e2e with env-specific app startup:

```bash
pnpm test:playwright:local
pnpm test:playwright:staging
pnpm test:playwright:prod
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
- Home statistics are now loaded via Server Action + React Query hook in web UI (`app/actions/home/get-home-statistics.ts` + `queries/home/use-home-statistics-query.ts`).

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
pnpm auth:bootstrap-admin:local
pnpm auth:bootstrap-admin:staging
pnpm auth:bootstrap-admin:prod
```

The script is idempotent:

- creates the admin user if missing
- promotes an existing matching user to `ADMIN`
- ensures credential account exists for email/password sign-in

Notes:

- `auth:bootstrap-admin:local` loads `.env.local`.
- `auth:bootstrap-admin:staging` loads `.env.staging`.
- `auth:bootstrap-admin:prod` loads `.env.prod`.

## Update existing user password

To update an existing credential user password:

```bash
pnpm auth:set-password:local
pnpm auth:set-password:staging
pnpm auth:set-password:prod
```

It uses:

- `SET_PASSWORD_EMAIL`
- `SET_PASSWORD_NEW_PASSWORD`

Notes:

- `auth:set-password:local` loads `.env.local`.
- `auth:set-password:staging` loads `.env.staging`.
- `auth:set-password:prod` loads `.env.prod`.
- `auth:set-password` without suffix defaults to `.env.local` (with `.env` fallback).

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
pnpm db:migrate:dev -- --name add_phase1_dog_search_stats_schema
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
pnpm import:issues <RUN_ID>
```

Optional filters:

```bash
pnpm import:issues <RUN_ID> --stage owners
pnpm import:issues <RUN_ID> --code OWNER_DOG_NOT_FOUND
pnpm import:issues <RUN_ID> --severity WARNING
pnpm import:issues <RUN_ID> --limit 500
```

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
- `docs/migration-plan-v1-to-v2.md`: staged migration approach from legacy app.
- `docs/import-phase1.md`: phase-1 import flow, data handling, and issue logging behavior.

## How we communicate changes

- User-facing changes are tracked in root `CHANGELOG.md`.
- Changelog source format:
  - `## [Unreleased]`
  - `## [x.y.z] - YYYY-MM-DD`
  - Sections: `Added`, `Changed`, `Fixed`, `Removed`
- When a PR includes user-visible behavior, add one line under `Unreleased`.
- For internal-only changes (`refactor`, `test`, `chore`), changelog updates are optional.
- User-facing release-note surfaces:
  - Header entry point: `Mitä uutta` in the app shell.
  - Public app page: `/whats-new` (latest Finnish summary + full notes).
  - Matching GitHub Release notes per tagged version.

## Release procedure (manual)

1. Confirm `CHANGELOG.md` `Unreleased` entries are complete and user-facing.
2. Move `Unreleased` bullets into a new version block `## [x.y.z] - YYYY-MM-DD`.
3. Keep entries grouped under `Added`, `Changed`, `Fixed`, `Removed`.
4. Commit the changelog update.
5. Tag the release (example: `git tag v0.4.0` and `git push origin v0.4.0`).
6. Create a GitHub Release for that tag and paste the same changelog block as release notes.
7. Reset `Unreleased` to an empty section skeleton for the next cycle.

Dry-run example:

```md
## [Unreleased]

### Added

- No user-facing additions yet.

## [0.4.0] - 2026-02-16

### Added

- Added Beagle search filters for owner and registration number.
```
