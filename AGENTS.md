# AGENTS.md

Agent operating rules for this repository.

## Source of truth

- Architecture and dependency boundaries are defined in [ARCHITECTURE.md](/Users/akikuivas/personal-projects/beagle/beagle-app-v2/ARCHITECTURE.md).
- If this file and architecture guidance conflict, follow `ARCHITECTURE.md` and mention the conflict in your response.

## Working style

- Keep changes focused with minimal blast radius.
- Prefer opportunistic refactors only in files you already touch.
- Preserve behavior unless behavior changes are explicitly requested.
- Prefer small files and clear names; one primary use-case/function per file when practical.
- Re-export public module APIs through `index.ts` entrypoints.
- Keep internal helpers private; do not re-export by default.

## Environment and ops

- Before running commands that depend on app environment variables, secrets, database access, Prisma, imports, or operational scripts, read `docs/ops-env-safety.md` and follow it.
- Do not guess how `pass://` values are resolved. Use the documented `pass-cli run --env-file ... -- <command>` workflow from `docs/ops-env-safety.md`.
- For local/staging/prod database inspection and import operations, prefer the documented commands and safety checks in `docs/ops-env-safety.md` over ad hoc shell commands.

## Server logging rule

- Structured logging standard is `pino`.
- When touching server actions/use-cases, use the shared logger and replace adjacent `console.*` in the same file.
- When logging user input parameters (IDs, filters, registration numbers), validate/normalize first and log warning/failure before downstream calls.

## Web implementation rules

- Custom React hooks belong in `apps/web/hooks/**`.
- Non-hook utilities/types/constants belong in `apps/web/lib/**`.
- Query/mutation hooks may live in `apps/web/queries/**`.
- Prefer feature-local query key constants over inline query key arrays.
- `apps/web` client code may import feature-scoped clients from `packages/api-client`, but prefer direct feature imports over a single catch-all client.
- Do not create API clients inside React render paths when a module-scope instance or thin feature-local wrapper is sufficient.

## Boundaries to enforce

- Do not import `packages/server` or `packages/db` into `apps/web` UI/client code.
- Do not place business logic in API route handlers.
- Keep business rules in `packages/server`.

## Validation rules

- Run targeted checks for touched code.
- If checks are not run, state that explicitly.
- CI note: if Turbo task chains include `build` (for example via `test:e2e`), required env vars must be present in CI and forwarded via `turbo.json` `globalEnv`.

## Legacy import invariants

- Legacy import is a one-shot bootstrap flow only.
- Canonical show tables are expected to be empty before bootstrap:
  - `showResultCategory`
  - `showResultDefinition`
  - `showEvent`
  - `showEntry`
  - `showResultItem`
- `pnpm --filter @beagle/db seed:show-result-definitions` is run once as part of the same one-shot bootstrap flow.
- Compatibility with pre-existing legacy `showResultDefinition.code` variants is out of scope unless explicitly requested.
- Do not require replay/upgrade/reconciliation behavior for partially bootstrapped legacy-import environments unless explicitly requested.
- Code review rule: do not request backward-compat aliasing for old definition codes unless the task explicitly asks for migration compatibility.

## Documentation rules

- If you change how something works, update the nearest durable documentation source for the touched area.
- Follow `docs/documentation-rules.md` as the source of truth for documentation placement and detail level.
- Non-obvious function, mapper, formatter, and use-case files should start with a brief 1-2 line responsibility comment when the file's purpose is not obvious from its name alone.
- If a contract, integration, or operational workflow changes, update the corresponding doc in the same change when practical.
- If you discover cleanup or follow-up work that will not be done now, record it in `docs/tech-debt.md` instead of relying on memory.
- Inline `TODO` / `FIXME` comments are allowed only when they are tied to the touched code, brief, actionable, and ticket-linked when possible.

## Release and versioning rules

- Source of truth for release communication is root `CHANGELOG.md`.
- Add new user-visible changes under `## Unreleased` while work is in progress.
- Keep `Unreleased` grouped with sections: `Added`, `Changed`, `Fixed`, `Removed`.
- When preparing a release, move relevant `Unreleased` entries into a dated version block:
  - `## [x.y.z] - YYYY-MM-DD`
- Web “Mitä uutta” reads only versioned blocks (not `Unreleased`), so unreleased notes must be promoted into a versioned block as part of the release process:
  - `apps/web/lib/release-notes/latest.ts`
  - `apps/web/app/(public)/whats-new/page.tsx`

### Workspace version alignment

Keep all workspace versions aligned:

- `package.json`
- `apps/web/package.json`
- `packages/api-client/package.json`
- `packages/auth/package.json`
- `packages/config-eslint/package.json`
- `packages/config-typescript/package.json`
- `packages/contracts/package.json`
- `packages/db/package.json`
- `packages/server/package.json`

Do not edit generated `apps/web/.next/**/package.json` files.

## Test conventions

- Unit/integration tests should be co-located under `__tests__/` near the feature/module.
- Playwright e2e tests should live in root `tests/e2e/`.
- Keep test refactors structure-only unless behavior changes are requested.
