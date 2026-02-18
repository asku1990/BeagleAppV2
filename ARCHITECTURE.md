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
- For `apps/web`: place custom React hooks under `apps/web/hooks/**` (prefer feature-scoped folders).
- For `apps/web`: keep `apps/web/lib/**` for non-hook utilities/support code (helpers, types, constants, providers, etc.).

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
