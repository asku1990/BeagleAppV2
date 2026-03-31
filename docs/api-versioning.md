# API Routing

This project uses HTTP route handlers for client-side reads.

## Rule

All new HTTP API routes for client-side reads should be created under
`/api/...` without a version prefix unless a feature explicitly needs one.

Examples:

- `GET /api/imports/:id`
- `GET /api/imports/:id/issues`
- `GET /api/admin/shows`
- `GET /api/admin/shows/:showId`

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
Legacy `/api/v1/*` routes remain only for existing migration paths.
When adding new features, prefer unversioned `/api/*` paths.

## Compatibility policy

- No breaking schema changes inside `v1` without migration plan.
- Additive changes are preferred.
- Breaking changes require a new route migration plan.
