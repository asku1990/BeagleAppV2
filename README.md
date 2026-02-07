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
- Import status endpoint:
  - `GET /api/import/example` returns status text
  - `POST /api/import/example` returns `501 Not Implemented`

## Where to add new features

- Add new backend business logic in `packages/server`.
- Keep `apps/api` routes thin (request/response mapping only).
- Add shared payload types in `packages/contracts`.
- Add client calls in `packages/api-client`.
- Consume from UI using React Query hooks in `apps/web/lib/hooks`.
