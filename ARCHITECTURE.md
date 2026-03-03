# Architecture Guardrails

This document is the source of truth for code architecture and dependency boundaries in Beagle App v2.
`AGENTS.md` defines execution/workflow rules and references this file.

## Monorepo Layers

- `apps/web`: Next.js UI, API routes, and server actions.
- `packages/api-client`: typed client wrappers for web consumption.
- `packages/contracts`: request/response DTOs and shared API payload types.
- `packages/server`: business use-cases, authorization, and orchestration.
- `packages/db`: persistence adapters and Prisma-backed repositories.
- `packages/domain`: framework-agnostic domain concepts.

## Dependency Boundaries

Allowed:

1. `apps/web` UI/client -> `packages/api-client`, `packages/contracts`
2. `apps/web` API transport (`app/api/**`, `lib/server/**`) -> `packages/server`, `packages/contracts`
3. `apps/web` Server Actions (`app/actions/**`) -> `packages/server`, `packages/contracts`
4. `packages/server` -> `packages/domain`, `packages/db`, `packages/auth`, `packages/contracts`
5. `packages/db` -> Prisma/database adapters only

Not allowed:

- `apps/web` UI/client importing `packages/server` or `packages/db`
- business logic in API route handlers
- `packages/domain` importing runtime/framework concerns
- `packages/db` importing `packages/contracts`

## Canonical Folder Conventions

Use `/<audience>/<domain>/<feature>/` for web transport/query layers.
Use `/<domain>/<feature>/` for contracts/server/db, with `admin/<domain>/<feature>/` when admin-specific.

### Web (`apps/web`)

- Server Actions: `app/actions/<audience>/<domain>/<feature>/**`
- Queries: `queries/<audience>/<domain>/<feature>/**`
- Hooks: `hooks/<audience>/<domain>/<feature>/**` (or feature-scoped non-audience folders where appropriate)
- Non-hook utilities: `lib/<audience>/<domain>/<feature>/**`

Audience values:

- `public`
- `admin`

### Contracts (`packages/contracts`)

- Public/shared: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`

### Server (`packages/server`)

- Public/shared: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`

### DB (`packages/db`)

- Public/shared: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`
- DTO mapping must happen in `packages/server`, not in DB layer

## Current Canonical Examples

- Public beagle search:
  - `apps/web/app/actions/public/beagle/search/*`
  - `apps/web/queries/public/beagle/search/*`
  - `apps/web/hooks/public/beagle/search/*`
  - `apps/web/lib/public/beagle/search/*`
  - `packages/contracts/dogs/search/*`
  - `packages/server/dogs/search/*`
  - `packages/db/dogs/search/*`

- Public beagle profile:
  - `apps/web/app/actions/public/beagle/dogs/profile/*`
  - `apps/web/queries/public/beagle/dogs/profile/*`
  - `packages/contracts/dogs/profile/*`
  - `packages/server/dogs/profile/*`
  - `packages/db/dogs/profile/*`

- Admin users manage:
  - `apps/web/app/actions/admin/users/manage/*`
  - `apps/web/queries/admin/users/manage/*`
  - `packages/contracts/admin/users/manage/*`
  - `packages/server/admin/users/manage/*`
  - `packages/db/admin/users/manage/*`

- Admin dogs manage/lookups:
  - `apps/web/app/actions/admin/dogs/manage/*`
  - `apps/web/app/actions/admin/dogs/lookups/*`
  - `apps/web/queries/admin/dogs/manage/*`
  - `apps/web/queries/admin/dogs/lookups/*`
  - `packages/contracts/admin/dogs/manage/*`
  - `packages/contracts/admin/dogs/lookups/*`
  - `packages/server/admin/dogs/manage/*`
  - `packages/server/admin/dogs/lookups/*`
  - `packages/db/admin/dogs/manage/*`
  - `packages/db/admin/dogs/lookups/*`

- Home statistics:
  - `apps/web/app/actions/public/home/statistics/*`
  - `apps/web/queries/public/home/statistics/*`
  - `packages/contracts/home/statistics/*`
  - `packages/server/home/statistics/*`
  - `packages/db/home/statistics/*`

## Module Design Rules

- Prefer one primary use-case/function per file.
- Keep feature-local helpers private by default.
- Re-export public APIs via local `index.ts` files.
- Avoid generic catch-all helper files (`utils.ts`) with unrelated logic.

## Helper Placement

- Feature-only shared helpers: `<domain>/<feature>/internal/*`
- Domain-wide shared helpers: `<domain>/core/*`
- Runtime infrastructure helpers: package-level `core/*`

## Authorization Boundary

- UI gating is convenience only.
- Real authorization must be enforced in backend logic (`packages/server` and handlers).

## Migration Rule

- New code must follow canonical paths immediately.
- Touched legacy files should be moved to canonical paths in the same change.
- Temporary compatibility shims are allowed only during migrations and should be removed once call sites are migrated.
