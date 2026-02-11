# Roles and Permissions

This document defines baseline authorization behavior.

## Roles

- `USER`: default role for authenticated users.
- `ADMIN`: elevated role for management and write operations requiring moderation or governance.

## Access model

- Public reads: allowed for open data endpoints.
- Authenticated operations: require valid session.
- Admin operations: require `ADMIN` role.

## Enforcement policy

- Authorization must be enforced server-side in backend services and API handlers.
- Frontend checks (e.g. admin route guards) are UX helpers only and not security controls.

## Endpoint policy

For each new endpoint, define one of:

- `public`
- `authenticated`
- `admin`

Document this in route-level comments or endpoint docs.

## Audit checklist for new admin features

1. Verify session token server-side.
2. Resolve current user from session.
3. Enforce admin check in backend logic.
4. Return `401` for unauthenticated, `403` for forbidden.
5. Add unit/integration tests for success and denial paths.
