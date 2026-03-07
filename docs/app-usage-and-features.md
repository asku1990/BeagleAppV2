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
- `/whats-new`

Can do:

1. View home statistics on `/`.
2. Search beagles on `/beagle/search` using:
   - primary fields: EK number, registration number, dog name
   - advanced filters: sex, birth year range, EK-only, multiple registrations
   - sorts: `name-asc`, `birth-desc`, `reg-desc`, `created-desc`, `ek-asc`
3. Search shows on `/beagle/shows`:
   - year or date range filters
   - date sorting
   - pagination
   - copy the current visible result page as TSV
4. Open show detail `/beagle/shows/[showId]`:
   - event summary (date, place, judge, dog count)
   - dog rows with registration number, name, sex, result, review text placeholder, height, and judge
   - copy one row or all rows as TSV
5. Search trials on `/beagle/trials`:
   - year or date range filters
   - date sorting
   - pagination
   - copy the current visible result page as TSV
6. Open trial detail `/beagle/trials/[trialId]`:
   - event summary (date, place, judge, dog count)
   - dog rows with result details
   - copy one row or all rows as TSV
7. Open dog profile `/beagle/dogs/[dogId]`:
   - basic details (name, registrations, birth date/age, sex, EK number)
   - lineage cards (parent profile links when available)
   - show results section
   - trial results section
   - not-found state for unknown IDs and error panel for other fetch failures
8. Read release notes on `/whats-new`.

Sidebar:

- Active links for everyone:
  - `/`
  - `/beagle/search`
  - `/beagle/shows`
  - `/beagle/trials`

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

## Import workflow (phase 1)

Import behavior, commands, and issue handling are documented in [docs/import-phase1.md](import-phase1.md).
