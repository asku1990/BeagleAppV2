# API Versioning

This project uses path-based versioning for public API routes.

## Rule

All new HTTP API routes for client-side reads should be created under:

- `/api/v1/...`

Examples:

- `GET /api/v1/imports/:id`
- `GET /api/v1/imports/:id/issues`

Web-only write interactions may use Server Actions in `apps/web/app/actions/*`
instead of API routes.

For app features that use React Query or other client-side fetching, prefer
route handlers for reads and reserve Server Actions for mutations.

## Why

- Enables non-breaking evolution.
- Allows gradual migration for clients.
- Keeps future `v2` introduction straightforward.

## Migration note

Current auth routes under `/api/auth/*` are bootstrap routes and remain valid for now.
When adding new features, prefer `/api/v1/*` paths and phase old unversioned endpoints out.

## Compatibility policy

- No breaking schema changes inside `v1` without migration plan.
- Additive changes are preferred.
- Breaking changes require a new major route version (`v2`).
