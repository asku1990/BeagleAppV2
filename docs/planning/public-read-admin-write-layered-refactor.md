# Public Read + Admin Write Layered Refactor

> Superseded: This plan assumed a separate `apps/api` transport layer. The active architecture now uses a single Next.js runtime with transport routes in `apps/web/app/api/*`.

## Intent

Refactor backend/frontend boundaries so the app stays public, admin writes are protected, and a second frontend can be added later without rewriting backend logic.

## Implemented decisions

- Keep one frontend app (`apps/web`) now.
- Use `apps/web/app/api/*` as transport layer.
- Use shared backend logic in `packages/server`.
- Use shared API contracts in `packages/contracts`.
- Use shared typed web client in `packages/api-client`.
- Keep import write flow disabled until import schema/design is defined.

## Access model

- Public reads: allowed.
- Auth endpoints: available for sign-in/sign-up/session.
- Admin area: guarded in `apps/web/app/(admin)`.
- Import write endpoint: returns `501 Not Implemented` until schema exists.

## Validation checklist

- `pnpm --filter @beagle/contracts typecheck`
- `pnpm --filter @beagle/api-client typecheck`
- `pnpm --filter @beagle/web typecheck`
