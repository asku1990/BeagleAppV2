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

## Implementation Preferences

- Keep business rules in `packages/server` (and shared domain concepts in `packages/domain`).
- Keep UI components presentational when possible; call typed clients for data access.
- Preserve existing naming and folder conventions unless a refactor is explicitly requested.

## Validation

- Run targeted checks for touched code when possible.
- If tests/checks are not run, explicitly say so in the final response.

## Test Conventions

- Place unit and integration tests in `__tests__/` folders next to the relevant feature/module.
- Place global Playwright e2e tests in root `tests/e2e/`.
- Keep test refactors structure-only unless behavior changes are explicitly requested.
