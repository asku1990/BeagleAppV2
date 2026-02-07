# Architecture Guardrails

This file defines development boundaries for Beagle App v2 so the codebase stays modular while features are added.

## Monorepo layout

- `apps/web`: user-facing UI (public, auth, admin route groups).
- `apps/api`: HTTP transport layer (route handlers, cookies, CORS, input/output mapping).
- `packages/server`: backend use cases and authorization rules.
- `packages/db`: Prisma/MariaDB persistence and DB adapters.
- `packages/contracts`: request/response DTOs and shared API result types.
- `packages/api-client`: typed frontend API client.
- `packages/ui`: shared presentational components.

## Domain boundaries

Domain modules should remain explicit and isolated as they grow:

- `dogs`
- `breeding`
- `trials`
- `imports`
- `admin`
- `forum`

When adding features, place business rules in `packages/server` first, then expose through `apps/api`, then consume via `packages/api-client` in UIs.

## Dependency rules

Allowed direction:

1. `apps/web` -> `packages/api-client`, `packages/contracts`, `packages/ui`
2. `apps/api` -> `packages/server`, `packages/contracts`
3. `packages/server` -> `packages/db`, `packages/auth`, `packages/contracts`

Not allowed:

- `apps/web` importing `packages/db`
- `apps/web` importing `packages/server`
- `apps/api` importing Prisma directly unless explicitly justified
- Business logic inside API route handlers

## Authorization rule

- UI gating is convenience only.
- Actual access control must be enforced in server-side/backend logic (`packages/server` + API handlers).

## Scalability path

Current approach is correct:

- Keep one Web UI app while feature scope is manageable.
- Split to separate `apps/admin` and/or `apps/forum` only when deployment, ownership, or UX divergence requires it.

Shared packages must remain the source of truth regardless of UI split.
