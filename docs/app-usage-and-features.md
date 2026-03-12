# App Usage and Features

This document describes current behavior by access level:

- Public (no login)
- Signed-in user (any role)
- Admin (`ADMIN` role)

## Public usage (no login required)

Routes:

- `/` (home with statistics)
- `/beagle/search` (search page)
- `/beagle/shows` (show search page)
- `/beagle/shows/[showId]` (show detail page)
- `/beagle/trials` (trial search page)
- `/beagle/trials/[trialId]` (trial detail page)
- `/beagle/dogs/[dogId]` (dog profile page)
- `/privacy`
- `/whats-new`

Can do:

1. View home statistics on `/`.
2. Search beagles on `/beagle/search`.
3. Search shows on `/beagle/shows` and open show detail pages.
4. Search trials on `/beagle/trials` and open trial detail pages.
5. Open dog profile `/beagle/dogs/[dogId]`.
6. Use available copy-to-clipboard exports on public result views.
7. Read privacy information on `/privacy`.
8. Read release notes on `/whats-new`.

Feature-level behavior is documented in:

- `docs/features/beagle-search.md`
- `docs/features/beagle-dog-profile.md`

Sidebar:

- Active links for everyone:
  - `/`
  - `/beagle/search`
  - `/beagle/shows`
  - `/beagle/trials`
- Footer links for everyone:
  - `/privacy`
- On `/privacy`:
  - `Avaa evästevalinnat` avaa analytiikan suostumusvalinnat uudelleen

Limits:

- Public scope is read-only.
- No public create/edit/delete actions are available.

## Signed-in user usage (login required, any role)

Routes:

- `/sign-in`
- `/account/profile`

Can do:

1. Sign in via Better Auth.
2. Open `/account/profile` to view own:
   - name
   - email
   - role
   - account created timestamp

Sidebar:

- Signed-in users get account/profile link in sidebar footer (`/account/profile`).
- Admin section is hidden unless user role is `ADMIN`.

Limits:

- Signed-in users without `ADMIN` role cannot access admin pages or admin mutations.

## Admin usage (login required)

Routes:

- `/admin`
- `/admin/users`
- `/admin/dogs`
- `/admin/settings`

Can do:

1. Manage users (`/admin/users`):
   - list/search users
   - create admin users
   - suspend/unsuspend users
   - reset user password
   - delete users
2. Manage dogs (`/admin/dogs`):
   - list/filter dogs
   - create dog records
   - edit dog records
   - delete dog records
   - use breeder/owner/parent lookup helpers
3. Open admin home (`/admin`) for module navigation.

Sidebar:

- Users with `ADMIN` role see admin section links:
  - `/admin`
  - `/admin/users`
  - `/admin/dogs`
  - `/admin/settings`

Limits:

- Access requires authenticated user with `ADMIN` role.
- Admin settings page is currently a placeholder (no concrete settings actions yet).
- Server-side guards enforce `401` for unauthenticated and `403` for non-admin access.

Admin-only APIs (not currently surfaced in admin UI):

- `GET /api/v1/imports/:id`
- `GET /api/v1/imports/:id/issues`

## Authentication and auth routes

- Better Auth routes are mounted under `/api/auth/*`.
- `/account/profile` redirects to `/sign-in?returnTo=/account/profile` when unauthenticated.

## Import workflow (phases 1-3)

Import behavior, commands, and issue handling are documented in [docs/import-flow.md](import-flow.md).
