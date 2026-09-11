# Project Overview

Beagle App v2 is the data platform for the Finnish Beagle Association (Suomen Beaglejarjesto). It provides public access to beagle dog data -- search, profiles, show results, trial results, and virtual pairing -- alongside an admin interface for managing users, dogs, show events, and trial events. The application is written in TypeScript end to end.

## Purpose

The platform serves two audiences:

- **Public visitors** can search for beagles, browse show and trial results, view dog profiles and pedigrees, and use virtual pairing tools. No login is required.
- **Admin users** manage the underlying data: dog records, show events (including Kennelliitto workbook imports), trial events, user accounts, and disease information.

Feature-level usage is documented in [docs/app-usage-and-features.md](app-usage-and-features.md). The changelog at the repository root (`CHANGELOG.md`) is the source of truth for user-visible changes.

## Repository Structure

The project is a pnpm monorepo orchestrated by Turborepo. All workspace versions are aligned to a single version number.

```
beagle-app-v2/
  apps/web/           Next.js 16 application (UI, API routes, server actions)
  packages/
    api-client/       Typed client wrappers consumed by the web app
    auth/             Better Auth integration and session handling
    config-eslint/    Shared ESLint configuration
    config-typescript/ Shared TypeScript configuration
    contracts/        Request/response DTOs and shared API payload types
    db/               Prisma schema, migrations, repositories, and seed scripts
    server/           Business use-cases, authorization, and orchestration
  docs/               Project and feature documentation
  tests/e2e/          Playwright end-to-end tests
  scripts/            Build, deploy, and DB helper scripts
```

## Architecture Layers

The monorepo is organized into five functional layers with strict dependency rules:

| Layer       | Package               | Role                                                                   |
| ----------- | --------------------- | ---------------------------------------------------------------------- |
| UI          | `apps/web`            | Next.js 16 app (App Router, React 19, React Query, Tailwind, Radix UI) |
| Client      | `packages/api-client` | Feature-scoped typed client wrappers for the web app                   |
| Contracts   | `packages/contracts`  | Shared request/response DTOs and API payload types                     |
| Server      | `packages/server`     | Business use-cases, authorization, and orchestration                   |
| Persistence | `packages/db`         | Prisma-backed repositories mapping to PostgreSQL                       |

Supporting packages: `packages/auth` (Better Auth), `packages/config-eslint`, `packages/config-typescript`.

For dependency boundaries, transport preferences, folder conventions, domain ownership, and module design rules, see [Architecture](architecture.md).

## Key Routes

### Public

| Route                               | Description                                   |
| ----------------------------------- | --------------------------------------------- |
| `/`                                 | Home page with statistics                     |
| `/beagle/search`                    | Beagle search                                 |
| `/beagle/dogs/[dogId]`              | Dog profile with pedigree, show/trial results |
| `/beagle/dogs/[dogId]/kokeet-laaja` | Full trial results for a specific dog         |
| `/beagle/shows`                     | Show search                                   |
| `/beagle/shows/[showId]`            | Show detail with dog entries                  |
| `/beagle/trials`                    | Trial search                                  |
| `/beagle/trials/[trialId]`          | Trial detail with dog entries                 |
| `/beagle/virtual-pairing`           | Virtual pairing tool                          |
| `/beagle/best-driver`               | Best driver competition                       |
| `/whats-new`                        | Release notes                                 |
| `/privacy`                          | Privacy policy                                |

### Admin

| Route                 | Description                  |
| --------------------- | ---------------------------- |
| `/admin`              | Admin home                   |
| `/admin/users`        | User management              |
| `/admin/dogs`         | Dog management               |
| `/admin/shows`        | Show event management        |
| `/admin/shows/import` | Kennelliitto workbook import |
| `/admin/shows/manage` | Show event editing           |
| `/admin/trials`       | Trial event management       |
| `/admin/settings`     | Settings (placeholder)       |

### Auth

- Better Auth routes: `/api/auth/*`
- Sign-in: `/sign-in`
- Account profile: `/account/profile`

## Development Commands

All commands assume the repository root as the working directory. Environment-sensitive commands require `pass-cli` -- see [docs/ops-env-safety.md](ops-env-safety.md).

### Local Development

```bash
pnpm install
pnpm dev                          # Start the Next.js dev server
```

### Building

```bash
pnpm build                       # Full Turborepo build
```

### Linting and Type Checking

```bash
pnpm lint                        # Full workspace lint
pnpm typecheck                   # Full workspace type check
```

### Testing

```bash
pnpm test                        # Unit + coverage + global coverage check
pnpm test:unit                   # Unit tests only
pnpm test:coverage               # Coverage report
pnpm test:e2e                    # Playwright end-to-end tests
pnpm test:playwright             # Playwright (web package only)
```

Unit/integration tests live in `__tests__/` directories co-located with their feature. Playwright e2e tests live in root `tests/e2e/`.

### Database

```bash
pnpm db:generate                 # Generate Prisma client
pnpm db:studio                   # Open Prisma Studio
pnpm db:migrate:dev -- --name <name>   # Create a migration (local)
pnpm db:deploy                   # Deploy migrations (staging/prod)
pnpm db:push                     # Push schema without migration file
```

Seeds:

```bash
pnpm db:seed:initial-test-data
pnpm db:seed:dog-colors
```

### Authentication

```bash
pnpm auth:generate               # Generate Better Auth schema
pnpm auth:migrate                # Run Better Auth migrations
pnpm auth:bootstrap-admin        # Bootstrap the first admin user
pnpm auth:set-password           # Reset an existing user's password
```

### Import (Legacy Data)

The import workflow migrates data from a legacy MariaDB database into the PostgreSQL schema. It runs in phases. See [docs/legacy-import/import-flow.md](legacy-import/import-flow.md) for the full sequence and per-phase documentation.

```bash
pnpm import:bootstrap            # Run the full bootstrap sequence
pnpm import:phase1               # Phase 1: dog and owner data
pnpm import:phase1.25            # Phase 1.25: disease and background data
pnpm import:phase1.5             # Phase 1.5: extended dog data
pnpm import:phase2               # Phase 2: trial mirror
pnpm import:phase3               # Phase 3: show data
pnpm import:phase5               # Phase 5: trial runtime projection
```

## Conventions

For detailed rules on dependency boundaries, transport preferences, folder conventions, module design, use-case sizing, and helper placement, see [Architecture](architecture.md).

### Logging

Structured logging uses `pino`. When touching server actions or use-cases, use the shared logger and replace adjacent `console.*` calls. Validate and normalize user input parameters before logging.

### Testing

- Unit/integration: co-located `__tests__/` directories near the feature.
- E2E: Playwright tests in root `tests/e2e/`.
- Run targeted checks for touched code during development.

### Documentation

- Update documentation when behavior, contracts, architecture, or operations change.
- Feature behavior: `docs/features/*`.
- Folder-local behavior: nearby `README.md`.
- Broader topics: `docs/*`.
- Follow-up work: `docs/tech-debt.md`.
- See [docs/documentation-rules.md](documentation-rules.md) for full rules.

### Authorization

- `USER` and `ADMIN` roles enforced server-side in `packages/server`.
- Frontend guards are UX convenience only, not security.
- See [docs/roles-and-permissions.md](roles-and-permissions.md).

## Deployment

The application runs in two environments:

| Environment | Platform          | URL                                    | Notes                          |
| ----------- | ----------------- | -------------------------------------- | ------------------------------ |
| Development | Vercel            | `develop.tietokanta.beaglejarjesto.fi` | Deployed from feature branches |
| Production  | Azure App Service | `tietokanta.beaglejarjesto.fi`         | Deployed from `main`           |

- **Vercel**: see [docs/vercel-deployment.md](vercel-deployment.md).
- **Azure**: see [docs/azure-app-service-deployment.md](azure-app-service-deployment.md).
- Prisma migrations run as part of both deployment pipelines.

## Database

- PostgreSQL via Prisma (driver adapter: `@prisma/adapter-pg`).
- Legacy MariaDB used as the source for one-shot import only.
- Business timezone: `Europe/Helsinki`.
- Date-only fields (birth dates, assignment dates) use `DateTime @db.Date`.
- Timestamps use native timestamp types.

## Further Reading

- [Architecture](architecture.md) -- architecture guardrails, dependency boundaries, folder conventions, and module design rules (source of truth for code structure).
- [AGENTS.md](../AGENTS.md) -- agent operating rules and conventions.
- [docs/app-usage-and-features.md](app-usage-and-features.md) -- feature behavior by access level.
- [docs/ops-env-safety.md](ops-env-safety.md) -- environment-specific command templates.
- [docs/legacy-import/import-flow.md](legacy-import/import-flow.md) -- legacy data import workflow.
- [docs/roles-and-permissions.md](roles-and-permissions.md) -- authorization model.
- [docs/tech-debt.md](tech-debt.md) -- known follow-up work.
- `CHANGELOG.md` -- user-visible release history.
