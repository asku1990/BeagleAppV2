# Beagle App v2

Monorepo for a public Beagle database app with auth, admin-ready routing, and a separated backend transport layer.

## Architecture

- `apps/web`: main Next.js frontend (public pages, auth pages, admin route group).
- `apps/api`: Next.js backend HTTP layer (routes, cookies, CORS).
- `packages/server`: backend use-case services (auth + authorization helpers).
- `packages/db`: Prisma + MariaDB access.
- `packages/contracts`: shared API request/response types.
- `packages/api-client`: typed HTTP client used by frontend hooks.
- `packages/ui`: shared UI components.

Current access model:

- Public reads are allowed.
- Admin area is guarded in `apps/web/app/(admin)`.
- Import write flow is not implemented yet.

## Requirements

- Node.js 20+
- pnpm 10+
- MariaDB (local or remote)

## Environment setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Update `.env` values:

- `DATABASE_URL`: MariaDB connection string.
- `AUTH_SECRET`: strong random secret.
- `NEXT_PUBLIC_API_URL`: API base URL for web app, default `http://localhost:3001`.
- `CORS_ORIGIN`: web origin allowed by API, default `http://localhost:3000`.
- `LEGACY_DATABASE_URL`: MariaDB connection string to legacy Beagle DB for phase-1 imports.

Example values are already in `.env.example`.

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

Or create migrations in dev:

```bash
pnpm db:migrate:dev -- --name init
```

Open Prisma Studio:

```bash
pnpm db:studio
```

## Run the app

Run all workspace dev processes:

```bash
pnpm dev
```

Default ports:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`

Run apps separately:

```bash
pnpm --filter @beagle/api dev
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
```

## Auth and admin notes

- Register endpoint creates users with `USER` role by default.
- Admin pages require `ADMIN` role.
- To test admin pages locally now, promote a user role to `ADMIN` in the database.

## Current API status

- Auth endpoints implemented:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Import placeholder endpoint (temporary):
  - `GET /api/import/example` returns status text
  - `POST /api/import/example` returns `501 Not Implemented`
- New v1 admin import endpoints:
  - `GET /api/v1/imports/:id`

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
pnpm import:issues <RUN_ID> --limit 500
```

4. Check import run status over API (admin auth required):

```bash
curl -i -c /tmp/beagle.cookies -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

curl -i -b /tmp/beagle.cookies \
  http://localhost:3001/api/v1/imports/<RUN_ID>
```

Optional deep inspection via API:

```bash
curl -i -b /tmp/beagle.cookies \
  "http://localhost:3001/api/v1/imports/<RUN_ID>/issues?limit=200"
```

For full import behavior (source tables, stage handling, required fields, issue codes, and logging), see `docs/import-phase1.md`.

## Where to add new features

- Add new backend business logic in `packages/server`.
- Keep `apps/api` routes thin (request/response mapping only).
- Add shared payload types in `packages/contracts`.
- Add client calls in `packages/api-client`.
- Consume from UI using React Query hooks in `apps/web/lib/hooks`.

## Architecture docs

- `ARCHITECTURE.md`: monorepo boundaries, dependency rules, and scaling path.
- `docs/api-versioning.md`: API path versioning policy (`/api/v1/...`).
- `docs/roles-and-permissions.md`: baseline role and authorization rules.
- `docs/migration-plan-v1-to-v2.md`: staged migration approach from legacy app.
- `docs/import-phase1.md`: phase-1 import flow, data handling, and issue logging behavior.
