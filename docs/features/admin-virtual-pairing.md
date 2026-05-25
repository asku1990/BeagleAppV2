# Admin Virtual Pairing

Admin-only virtual pairing is the first slice of the legacy paritus flow in v2.

## Scope

- Route: `/admin/dogs/virtual-pairing`
- Search by one active field at a time: `EK-numero`, `Rekisterinumero`, or `Nimi`
- Name searches match substrings by default; use `%` and `_` to narrow or
  pattern-match results like the legacy v1 app
- Broad wildcard searches are intentionally capped server-side so the admin UI
  stays responsive on large dog datasets; narrow the query when the warning
  appears
- Parent selection uses the legacy `Isäksi` and `Emäksi` actions
- Calculation reuses the existing pedigree ancestry loader and inbreeding coefficient code
- Inbreeding is calculated from the current pedigree graph at request time; v2
  does not use or update imported/stored legacy `SIITOSASTE` values for virtual
  pairing. The ancestry loader fetches beyond the selected generation depth so
  shared ancestors near the cutoff still have enough pedigree data for their own
  dynamic `Fa`; occurrence discovery and known-pedigree diagnostics remain
  bounded to the selected depth.
- Health and risk values are calculated on demand from current database data in
  `packages/server/dogs/core`, not from stored legacy percentages.
- The shared server-side health calculator covers EPI, Lafora, PUR, and risk.
  Virtual pairing loads the relevant disease facts for the current pedigree
  graph and evaluates a synthetic in-memory puppy root with the selected sire
  and dam as parents. That synthetic root is only used for scoring and is never
  persisted.
- `calculateDogHealthSummary` is the shared server-side entry point for these
  values. Admin dog profile uses the same calculator for the legacy EPI,
  Lafora, and risk fields, while virtual pairing also renders PUR from the same
  current-data disease model.
- `knownPedigreePct` reports known pedigree slots across both sire and dam
  sides; it includes the selected sire and dam as generation 1 and counts
  repeated ancestors by slot, not as unique dogs

## What ships now

- Admin-only access checks
- Search result list with public-safe dog data
- Selected sire/dam panel
- Generation-depth selector with the legacy default and range
- Real inbreeding coefficient calculation
- Computed health/risk rows for EPI, Lafora, risk, and PUR
- The main result card shows the final coefficient and the raw `Fx` in
  parentheses always, matching the legacy v1 presentation
- Explicit placeholders remain only for the deferred diagnostics and pedigree
  sections

## What is deferred

- Shared-ancestor diagnostics UI
- Virtual pedigree/PDF generation
- Public route exposure

## Safety boundary

- Shared search and calculation primitives stay in `packages/server/dogs/virtual-pairing`
- Admin-only behavior stays in `packages/server/admin/dogs/virtual-pairing`
- Web code consumes only the admin action/query surface
- Health values are derived at request time and must not be mistaken for stored
  legacy `SIITOSASTE` or cached disease percentages

## Inbreeding parity target

- v2 should match v1's raw shared-ancestor basis: shared occurrence discovery,
  included/excluded occurrence rules, raw `Fx` contribution formula, grouped
  ancestor contributions, and known pedigree coverage.
- v2 intentionally differs from v1 for the final adjusted percentage when v1's
  result depends on stored ancestor `SIITOSASTE` values. v2 recalculates each
  ancestor `Fa` dynamically from current pedigree data so admins do not need to
  save/recalculate stored percentages before virtual pairing.
- Expected review outcome for known legacy comparisons is therefore: raw basis
  parity required; final adjusted percentage may differ when stored legacy
  ancestor `Fa` differs from dynamically calculated current-data `Fa`.
- See `docs/notes/inbreeding-v1-v2-dynamic-fa.md` for a concrete comparison
  where raw `Fx` matches v1 but the adjusted final percentage differs by design.

## Related files

- `apps/web/app/(admin)/admin/dogs/virtual-pairing/page.tsx`
- `apps/web/components/admin/dogs/virtual-pairing/admin-virtual-pairing-page-client.tsx`
- `packages/server/admin/dogs/virtual-pairing/*`
- `packages/server/dogs/virtual-pairing/*`
- `packages/server/dogs/core/*`
- `packages/db/dogs/core/epi-disease-facts.ts`

## Tests

- `packages/db/dogs/virtual-pairing/__tests__/*`
- `packages/server/dogs/virtual-pairing/__tests__/*`
- `packages/server/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/app/actions/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/queries/admin/dogs/virtual-pairing/__tests__/*`
- `apps/web/components/admin/dogs/virtual-pairing/__tests__/*`
