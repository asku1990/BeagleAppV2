# API Versioning

This project uses path-based versioning for public API routes.

## Rule

All new API routes should be created under:

- `/api/v1/...`

Examples:

- `POST /api/v1/auth/login`
- `GET /api/v1/dogs/:id`
- `POST /api/v1/imports/run`

## Why

- Enables non-breaking evolution.
- Allows gradual migration for clients.
- Keeps future `v2` introduction straightforward.

## Migration note

Current routes under `/api/auth/*` and `/api/import/*` can remain during bootstrap.
When adding new features, prefer `v1` paths and phase old unversioned endpoints out.

## Compatibility policy

- No breaking schema changes inside `v1` without migration plan.
- Additive changes are preferred.
- Breaking changes require a new major route version (`v2`).
