# AGENTS.md

Agent instructions for working in this repository.

## Source Of Truth

- Follow `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/ARCHITECTURE.md` for architecture and dependency boundaries.
- If this file and architecture guidance conflict, prefer architecture constraints and note the conflict in your response.

## Working Style

- Make focused changes with minimal blast radius.
- Prefer small files and clear names over large multi-purpose files.
- Prefer one primary function/use-case per file.
- Re-export public module APIs via `index.ts`.
- Keep internal helpers private; do not re-export everything by default.

## Monorepo Boundaries

- `apps/web` UI/client code can depend on: `packages/api-client`, `packages/contracts`.
- `apps/web` API transport code (`app/api/**`, `lib/server/**`) can depend on: `packages/server`, `packages/contracts`.
- `packages/server` can depend on: `packages/domain`, `packages/db`, `packages/auth`, `packages/contracts`.
- Do not put business logic in API route handlers.
- Do not import `packages/server` or `packages/db` into `apps/web` UI/client code.

## Utility Code (`lib`)

- In this repo, `lib` folders/files are utility/support code.
- Keep utilities close to the feature/package that uses them.
- Create shared utilities only when reused in multiple places.
- Avoid generic catch-all files like `utils.ts` with unrelated helpers.
- Do not place custom React hooks under `apps/web/lib/**`.

## Hooks (`apps/web/hooks`)

- Place custom React hooks for `apps/web` under `apps/web/hooks/**` (feature-scoped subfolders are preferred).
- Import hooks from `@/hooks/**`.
- Keep non-hook helpers, types, and constants in `apps/web/lib/**`.
- Query hooks in `apps/web/queries/**` are allowed to stay there unless explicitly refactored.

## Implementation Preferences

- Keep business rules in `packages/server` (and shared domain concepts in `packages/domain`).
- Keep UI components presentational when possible; call typed clients for data access.
- For TanStack Query writes in `apps/web`, use feature mutation hooks and invalidate impacted query keys on success.
- Prefer shared query key constants (for example `query-keys.ts`) instead of inline query key arrays.
- Preserve existing naming and folder conventions unless a refactor is explicitly requested.

## Validation

- Run targeted checks for touched code when possible.
- If tests/checks are not run, explicitly say so in the final response.
- CI note: when a Turbo task chain includes `build` (for example via `test:e2e`), any build-time required environment variables must be provided in CI job env and forwarded through `turbo.json` `globalEnv`.

## Release & Changelog Rules

- Source of truth for release communication is root `CHANGELOG.md`.
- Add user-visible changes directly to a dated version block:
  - `## [x.y.z] - YYYY-MM-DD`
  - Keep sections: `Added`, `Changed`, `Fixed`, `Removed`.
- Important: web "Mitä uutta" reads only versioned blocks, not `Unreleased`.
  - Parsing code: `apps/web/lib/release-notes/latest.ts`
  - UI page: `apps/web/app/(public)/whats-new/page.tsx`

### Version Alignment

- Keep all workspace package versions aligned to the same version:
  - `package.json`
  - `apps/web/package.json`
  - `packages/api-client/package.json`
  - `packages/auth/package.json`
  - `packages/config-eslint/package.json`
  - `packages/config-typescript/package.json`
  - `packages/contracts/package.json`
  - `packages/db/package.json`
  - `packages/server/package.json`
- Do not edit generated `apps/web/.next/**/package.json` files.

## Test Conventions

- Place unit and integration tests in `__tests__/` folders next to the relevant feature/module.
- Place global Playwright e2e tests in root `tests/e2e/`.
- Keep test refactors structure-only unless behavior changes are explicitly requested.
