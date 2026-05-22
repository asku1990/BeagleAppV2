# Admin Virtual Pairing

Admin-only virtual pairing is the first slice of the legacy paritus flow in v2.

## Scope

- Route: `/admin/dogs/virtual-pairing`
- Alias route: `/admin/virtual-pairing`
- Search by one active field at a time: `EK-numero`, `Rekisterinumero`, or `Nimi`
- Wildcard search supports `%` and `_` like the legacy v1 app
- Parent selection uses the legacy `Isäksi` and `Emäksi` actions
- Calculation reuses the existing pedigree ancestry loader and inbreeding coefficient code

## What ships now

- Admin-only access checks
- Search result list with public-safe dog data
- Selected sire/dam panel
- Generation-depth selector with the legacy default and range
- Real inbreeding coefficient calculation
- Explicit placeholders for the legacy EPI/Lafora/PUR/risk/PDF sections

## What is deferred

- Detailed disease and risk calculations
- Shared-ancestor diagnostics UI
- Virtual pedigree/PDF generation
- Public route exposure

## Safety boundary

- Shared search and calculation primitives stay in `packages/server/dogs/virtual-pairing`
- Admin-only behavior stays in `packages/server/admin/dogs/virtual-pairing`
- Web code consumes only the admin action/query surface
- Placeholder fields are explicit and must not be mistaken for final risk values

## Related files

- `apps/web/app/(admin)/admin/dogs/virtual-pairing/page.tsx`
- `apps/web/components/admin/dogs/virtual-pairing/admin-virtual-pairing-page-client.tsx`
- `packages/server/admin/dogs/virtual-pairing/*`
- `packages/server/dogs/virtual-pairing/*`

## Tests

- `packages/db/dogs/virtual-pairing/__tests__/*`
- `packages/server/dogs/virtual-pairing/__tests__/*`
- `packages/server/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/app/actions/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/queries/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/components/admin/dogs/virtual-pairing/__tests__/*`
