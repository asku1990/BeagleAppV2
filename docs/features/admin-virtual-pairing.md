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
- Calculation reuses the existing pedigree ancestry loader and inbreeding coefficient code.
- The selected `SP` controls the virtual pair's visible/shared-ancestor matrix:
  occurrence discovery, included/excluded occurrence rules, raw `Fx`, grouped
  basis rows, and known-pedigree diagnostics all remain bounded to selected
  `SP`.
- Shared ancestor `Fa` is recalculated dynamically from current pedigree data,
  but its depth is fixed to the legacy default of 9 generations. This mirrors
  v1 semantics where virtual pairing used selected `SP` for the pair matrix but
  evaluated shared ancestors at the legacy 9-generation depth. v2 does not
  read or update any persisted inbreeding field for virtual pairing.
- The ancestry loader fetches beyond the selected generation depth so shared
  ancestors near the cutoff still have enough pedigree data for their fixed
  9-generation dynamic `Fa`; occurrence discovery and known-pedigree
  diagnostics remain bounded to the selected depth.
- Health and risk values are calculated on demand from current database data in
  `packages/server/dogs/core`, not from stored legacy percentages.
- The shared server-side health calculator covers EPI, Lafora, PUR, and risk.
  Virtual pairing loads the relevant disease facts for the current pedigree
  graph and evaluates a synthetic in-memory puppy root with the selected sire
  and dam as parents. That synthetic root is only used for scoring and is never
  persisted.
- EPI and PUR are fixed `5 sp` health calculations. Their disease fact query is
  bounded to the five-generation health graph and must not depend on the
  selected inbreeding `SP`. Real `DOG` evidence rows use canonical
  `Dog.sireId` and `Dog.damId`; anonymous `LITTER` rows are matched through
  source parent registrations in that bounded graph, then both source parents
  are resolved for EPI/PUR relationship evidence.
- `calculateDogHealthSummary` is the shared server-side entry point for these
  values. Admin dog profile uses the same calculator for the legacy EPI,
  Lafora, and risk fields, while virtual pairing also renders PUR from the same
  current-data disease model.
- `knownPedigreePct` reports known pedigree slots across both sire and dam
  sides; it includes the selected sire and dam as generation 1 and counts
  repeated ancestors by slot, not as unique dogs
- The v1 summary line labelled "Yhteisiä esivanhempia löytyi" displays included
  shared occurrence pairs first and all found shared occurrence pairs in
  parentheses. It does not display the number of unique ancestor dogs, even
  though the grouped contribution list is unique by ancestor.

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
- Public route exposure now lives in `/beagle/virtual-pairing` and uses the
  public-safe DTO layer documented in `docs/features/public-virtual-pairing.md`

## Safety boundary

- Shared search and calculation primitives stay in `packages/server/dogs/virtual-pairing`
- Admin-only behavior stays in `packages/server/admin/dogs/virtual-pairing`
- Web code consumes only the admin action/query surface
- Health values are derived at request time and must not be mistaken for legacy
  `SIITOSASTE` values or cached disease percentages.

## Inbreeding parity target

- v2 should match v1's shared-ancestor basis: shared occurrence discovery,
  included/excluded occurrence rules, raw `Fx` contribution formula, grouped
  ancestor contributions, and known pedigree coverage.
- For the final adjusted percentage, v2 preserves v1's depth semantics by using
  selected `SP` only for the pair matrix and fixed 9-generation dynamic `Fa` for
  shared ancestors. This avoids the SP6/SP9 drift caused by recalculating
  ancestor `Fa` at the selected pair depth.
- v2 still differs from v1 if a current-data 9-generation dynamic
  recalculation differs from the legacy v1 result. v2's source of truth remains
  current pedigree data.
- See `docs/notes/inbreeding-v1-v2-dynamic-fa.md` for the concrete comparison
  that identified this selected-SP versus ancestor-`Fa` depth distinction.

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
