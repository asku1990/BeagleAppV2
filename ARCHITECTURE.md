# Architecture Guardrails

This document is the source of truth for code architecture and dependency boundaries in Beagle App v2.
`AGENTS.md` defines execution/workflow rules and references this file.

## Monorepo Layers

- `apps/web`: Next.js UI, API routes, and server actions.
- `packages/api-client`: typed client wrappers for web consumption.
- `packages/contracts`: request/response DTOs and shared API payload types.
- `packages/server`: business use-cases, authorization, and orchestration.
- `packages/db`: persistence adapters and Prisma-backed repositories.

## Dependency Boundaries

Allowed:

1. `apps/web` UI/client -> `packages/api-client`, `packages/contracts`
2. `apps/web` API transport (`app/api/**`, `lib/server/**`) -> `packages/server`, `packages/contracts`
3. `apps/web` Server Actions (`app/actions/**`) -> `packages/server`, `packages/contracts`
4. `packages/server` -> `packages/db`, `packages/auth`, `packages/contracts`
5. `packages/db` -> Prisma/database adapters only

Not allowed:

- `apps/web` UI/client importing `packages/server` or `packages/db`
- business logic in API route handlers
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

- Public/common: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`

### Server (`packages/server`)

- Public/common: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`

### DB (`packages/db`)

- Public/common: `<domain>/<feature>/**`
- Admin-specific: `admin/<domain>/<feature>/**`
- DTO mapping must happen in `packages/server`, not in DB layer

## Domain Ownership (Public Beagle)

- `dogs/*`: dog identity/profile/pedigree and dog-centric search/use-cases.
- `shows/*`: show event-centric search/detail/use-cases and show-specific helpers.
- `trials/*`: trial event-centric search/detail/use-cases and trial-specific helpers.

Rule of thumb:

- If the primary query key is a dog (`dogId`, reg no, dog name), start in `dogs/*`.
- If the primary query key is an event (`date`, `place`, `event id`), use `shows/*` or `trials/*`.
- Keep each feature in one domain root across contracts, db, server, and web transport/query layers.

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

- Public beagle shows (event-centric):
  - `apps/web/app/actions/public/beagle/shows/*`
  - `apps/web/queries/public/beagle/shows/*`
  - `apps/web/hooks/public/beagle/shows/*`
  - `apps/web/lib/public/beagle/shows/*`
  - `packages/contracts/shows/*`
  - `packages/server/shows/*`
  - `packages/db/shows/*`

- Public beagle trials (event-centric):
  - `apps/web/app/actions/public/beagle/trials/*`
  - `apps/web/queries/public/beagle/trials/*`
  - `apps/web/hooks/public/beagle/trials/*`
  - `apps/web/lib/public/beagle/trials/*`
  - `packages/contracts/trials/*`
  - `packages/server/trials/*`
  - `packages/db/trials/*`

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

## Use-Case Sizing Rule

Apply the same anti-bloat rule across `packages/db`, `packages/server`, and
`apps/web/lib` feature utilities.

Rules:

- Keep files use-case-scoped by default (`search`, `details`, `dog`, etc.).
- If a file grows beyond ~250-300 lines or has more than 2 exported use-case
  functions, split it in the same task.
- Move shared helpers (date/filter/sort/format mapping) into `<domain>/core/*`
  or feature-local `internal/*` based on reuse scope.
- Keep public exports stable through local `index.ts` re-exports.

Layer intent:

- `packages/db`: one repository query function per file by default.
- `packages/server`: one service/use-case entry function per file by default.
- `apps/web/lib/<audience>/<domain>/<feature>`: keep clipboard/formatter/query
  param/state helpers split by concern when size/exports exceed the threshold.

## Helper Placement

Preferred backend helper structure:

- Feature-local helpers: `<package>/<domain>/<feature>/internal/*`
- Domain-reusable helpers: `<package>/<domain>/core/*`
- Package-level cross-cutting helpers: `<package>/core/*`

Backend rules (`packages/server`, `packages/db`):

- Domain/business helpers must live under domain folders (`<domain>/core/*`), not package-level folders.
- Package-level `core/*` is for cross-cutting runtime concerns only (logger/context, generic result wrappers, generic date/time, package-wide types).
- Do not create package-level `shared/*`, `utils/*`, or `helpers/*` for new backend code.
- Avoid generic catch-all files (`utils.ts`, `helpers.ts`) when helper intent is domain-specific.
- `packages/server/core/*` is the canonical package-level runtime folder in server code.

Examples:

- `dogId` parser -> `packages/server/dogs/core/dog-id.ts`
- registration normalization -> `packages/server/dogs/core/registration.ts`
- DB audit runtime helper -> `packages/db/core/audit-context.ts`

## Profile Composition Rule

Dog profile remains a `dogs/*` use-case, but it may orchestrate `shows/*` and
`trials/*` services when richer event data is needed in future.

Constraints:

- Composition happens in `packages/server` service layer only.
- `packages/db` repositories stay domain-local and do not cross-import.
- Reuse show/trial domain helpers instead of duplicating event mapping logic in
  dog profile modules.

## Authorization Boundary

- UI gating is convenience only.
- Real authorization must be enforced in backend logic (`packages/server` and handlers).

## Migration Rule

- New code must follow canonical paths immediately.
- Touched legacy files should be moved to canonical paths in the same change.
- Temporary compatibility shims are allowed only during migrations and should be removed once call sites are migrated.
