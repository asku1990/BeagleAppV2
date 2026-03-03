# Architecture Guardrails

This file defines architecture and dependency boundaries for Beagle App v2 so the codebase stays modular while features are added.
Agent behavior/instructions should live in `AGENTS.md`; that file can reference this document.

## Monorepo layout

- `apps/web`: Next.js app containing UI route groups, HTTP transport routes under `app/api/*`, and Server Actions under `app/actions/*`.
- `packages/server`: backend use cases and authorization rules.
- `packages/domain`: domain models/value objects that are framework-agnostic.
- `packages/db`: Prisma/MariaDB persistence and DB adapters.
- `packages/contracts`: request/response DTOs and shared API result types.
- `packages/api-client`: typed frontend API client.

## Domain boundaries

Domain modules should remain explicit and isolated as they grow:

- `dogs`
- `breeding`
- `trials`
- `imports`
- `admin`
- `forum`

Domain submodules are must when a domain grows, for example:

- `admin/dogs` web transport + query layers
- `packages/server/admin/dogs`
- `packages/db/admin/dogs`

When adding features, place shared domain concepts in `packages/domain`, business rules in `packages/server`, then expose through `apps/web/app/api/*` for public/compat HTTP needs or `apps/web/app/actions/*` for web-only transport, then consume in UIs.

## Dependency rules

Allowed direction:

1. `apps/web` UI/client code -> `packages/api-client`, `packages/contracts`
2. `apps/web` API transport code (`app/api/**`, `lib/server/**`) -> `packages/server`, `packages/contracts`
3. `apps/web` Server Actions (`app/actions/**`) -> `packages/server`, `packages/contracts`
4. `packages/server` -> `packages/domain`, `packages/db`, `packages/auth`, `packages/contracts`
5. `packages/db` -> Prisma + DB adapters only (no server/business logic)

Not allowed:

- `apps/web` importing `packages/db`
- `apps/web` UI/client code importing `packages/server`
- Business logic inside API route handlers
- `packages/domain` importing framework-specific runtime concerns (Next.js, Prisma client, HTTP/cookies)

## File organization rules

- Avoid large files. Split code by responsibility before files become hard to review.
- Prefer one primary function/use-case per file.
- Keep related folder-level `index.ts` files that re-export the public surface.
- Import from module `index.ts` entrypoints when crossing package/module boundaries.
- Keep internals private: do not re-export helper files that are only for local use inside a module.
- For `apps/web`, default to audience-aware domain-first feature folders for all new or touched feature-oriented code:
  - `<audience>/<domain>/<feature>/**`
  - Audience values:
    - `admin`: admin-only flows
    - `public`: public site flows
  - Applies to feature code under `app/actions/**`, `queries/**`, and `lib/**`.
  - Flat legacy folders are transitional only; when touching a legacy feature file, move that touched feature to the target structure in the same change.
  - Any intentional exception must be documented in the PR rationale.
- For `apps/web`: place custom React hooks under `apps/web/hooks/**` (prefer feature-scoped folders).
- Query and mutation data-access hooks may live under `apps/web/queries/**` to keep read/write cache logic co-located with feature data APIs.
- For `apps/web`: keep `apps/web/lib/**` for non-hook utilities/support code (helpers, types, constants, providers, etc.).
- Use audience-aware folders for `apps/web/lib` feature utilities:
  - `lib/<audience>/<domain>/<feature>/**`
- For `apps/web` server actions and queries, prefer domain-first feature folders over flat domain files.
  - `app/actions/<audience>/<domain>/<feature>/**`
  - `queries/<audience>/<domain>/<feature>/**`

## Folder consistency status

Current state for dogs/public transport is normalized to audience/domain/feature folders.
Keep this section as the canonical target when adding new features.

### Target structure by layer

- `apps/web` transport/query/lib layers should use audience + domain + feature:
  - Server Actions: `app/actions/<audience>/<domain>/<feature>/**`
  - Queries: `queries/<audience>/<domain>/<feature>/**`
  - Feature utilities in `lib`: `lib/<audience>/<domain>/<feature>/**`
  - Audience values:
    - `admin`: admin-only flows
    - `public`: public site flows
- `packages/contracts` should use business domain/use-case folders:
  - `admin/<domain>/<feature>/**` for admin-specific request/response types
  - `<domain>/<feature>/**` for shared/public domain contracts
  - Do not add `public/**` under contracts unless payloads diverge by audience and cannot be shared.
- `packages/server` should use business domain modules:
  - `admin/<domain>/<feature>/**` only when admin rules/authorization differ
  - `<domain>/<feature>/**` for shared/public domain logic
  - Do not mirror web transport audiences with `public/**` in server.
- `packages/db` should use persistence domain modules:
  - `admin/<domain>/<feature>/**` for admin-specific repository operations
  - `<domain>/<feature>/**` for shared/public persistence operations
  - Do not mirror web transport audiences with `public/**` in db.
  - `packages/db` must not import `packages/contracts`; DTO shaping belongs in `packages/server`.

### Incremental migration policy

- No big-bang rename required.
- For new code, use the target structure immediately.
- For touched legacy folders/files in `apps/web`, move touched feature files to target structure in the same change.
- Keep each migration PR small and behavior-preserving (structure-only unless feature work requires behavior changes).
- Maintain temporary re-export shims only when needed to keep imports stable during phased migration; remove shims once call sites are migrated.

### Current dogs examples

- Public dogs search:
  - `apps/web/app/actions/public/beagle/search/*`
  - `apps/web/queries/public/beagle/search/*`
  - `apps/web/hooks/public/beagle/search/*`
  - `apps/web/lib/public/beagle/search/*`
- Public dogs profile:
  - `apps/web/app/actions/public/beagle/dogs/profile/*`
  - `apps/web/queries/public/beagle/dogs/profile/*`
  - `apps/web/lib/public/beagle/dogs/profile/*`
  - `packages/contracts/dogs/profile/*`
  - `packages/server/dogs/profile/*`
  - `packages/db/dogs/profile/*`
- Dogs package feature folders:
  - `packages/contracts/dogs/search/*`, `packages/contracts/dogs/newest/*`, `packages/contracts/dogs/profile/*`
  - `packages/server/dogs/search/*`, `packages/server/dogs/newest/*`, `packages/server/dogs/profile/*`
  - `packages/db/dogs/search/*`, `packages/db/dogs/newest/*`, `packages/db/dogs/profile/*`
- Admin users and dogs are feature-scoped:
  - `apps/web/app/actions/admin/users/manage/*`
  - `apps/web/queries/admin/users/manage/*`
  - `apps/web/app/actions/admin/dogs/manage/*`
  - `apps/web/app/actions/admin/dogs/lookups/*`
  - `apps/web/queries/admin/dogs/manage/*`
  - `apps/web/queries/admin/dogs/lookups/*`
  - `packages/contracts/admin/users/manage/*`
  - `packages/contracts/admin/dogs/manage/*`
  - `packages/contracts/admin/dogs/lookups/*`
  - `packages/server/admin/users/manage/*`
  - `packages/server/admin/dogs/manage/*`
  - `packages/server/admin/dogs/lookups/*`
  - `packages/db/admin/users/manage/*`
  - `packages/db/admin/dogs/manage/*`
  - `packages/db/admin/dogs/lookups/*`
- Home statistics is feature-scoped:
  - `apps/web/app/actions/public/home/statistics/*`
  - `apps/web/queries/public/home/statistics/*`
  - `packages/contracts/home/statistics/*`
  - `packages/server/stats/home/statistics/*`
  - `packages/db/stats/home/statistics/*`
- In `packages/db/dogs/*`, keep repository return types DB/domain-shaped; keep contract mapping in `packages/server/dogs/*`.

## Helper placement rules

- Default: keep helpers inside the feature folder that uses them.
- Use `internal/*` inside a feature for helpers shared only within that feature.
  - Example: `<domain>/<feature>/internal/*`
- Use `<domain>/core/*` only for helpers shared by multiple features inside the same domain.
  - Example: `packages/db/dogs/core/*`
- Keep package-level `core/*` for runtime/foundation concerns only.
  - Example: `packages/db/core/prisma.ts`
- Avoid generic catch-all helper files like `utils.ts`.
- Keep helper internals private by default; export only through intentional module entrypoints.

## React Query data-access conventions

- UI reads should be wrapped in `useQuery` hooks.
- UI writes should be wrapped in `useMutation` hooks.
- Mutation hooks are responsible for cache coherence and should invalidate affected query keys in `onSuccess` by default.
- Prefer shared query-key constants over inline arrays so query invalidation stays consistent.

## Date/time conventions

- Distinguish timestamp fields from date-only calendar fields at API boundaries.
- For date-only fields (for example birth dates or event dates shown as `YYYY-MM-DD`), do not derive the value with `toISOString().slice(0, 10)`.
- Serialize date-only values with an explicit business timezone to avoid server-environment timezone drift.
- In `packages/server`, prefer the shared `toBusinessDateOnly` helper for date-only serialization.
- Keep true timestamp fields (for example `createdAt` and `updatedAt`) as full ISO datetime strings.

## UI feedback consistency rules

- Use Sonner toasts as the default user feedback mechanism for new user-visible actions and async operation outcomes in `apps/web`.
- Use semantic toast variants (`toast.success`, `toast.error`, `toast.warning`, `toast.info`) instead of plain `toast(...)` so styling and meaning stay consistent.
- Keep existing inline error/empty states when they provide page context, but pair them with a toast for failed operations when user feedback is expected.
- Refactor legacy non-toast feedback paths to this toast convention whenever touched by feature work or bug fixes.

## Test organization rules

- Co-locate unit/integration tests in `__tests__/` folders near the module/feature they verify.
- Keep global end-to-end tests in root `tests/e2e/`.
- For `apps/web`, keep Playwright configuration in `apps/web/playwright.config.ts` with `testDir` targeting root `tests/e2e`.

## Authorization rule

- UI gating is convenience only.
- Actual access control must be enforced in server-side/backend logic (`packages/server` + API handlers).
- DB queries alone are not authorization.

## Scalability path

Current approach is correct:

- Keep one Web UI app while feature scope is manageable.
- Split to separate `apps/admin` and/or `apps/forum` only when deployment, ownership, or UX divergence requires it.

Shared packages must remain the source of truth regardless of UI split.
