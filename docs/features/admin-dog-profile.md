# Admin Dog Profile

The admin dog profile is a separate read-only profile surface for validating imported legacy hallinta data.

## Scope

- Separate admin route, API, query, and DTOs.
- Shared internal profile assembly stays behind the public/admin mapping boundary.
- The first version shows the v1 hallinta basics only.

## Fields

The page renders the legacy basics that were visible in the old hallinta view:

- `Koirannimi`
- `Rekisterinumero`
- `Syntynyt - ikä`
- `Sukupuoli`
- `Väri`
- `EK-numero`
- `Jälkeläisiä(EK)[2p]`
- `Sukusiitosaste (9 sp)`
- `EPI-luku (5 sp)` with `EPITEKSTI`
- `Lafora-luku(-1..7)`
- `EPI-riskiluku(1-8)`
- `Terveystiedot`
- `Vanhemmat`
- `Omistaja`
- `Omistajan Osoite`
- `Kennel`
- `Kennelin omistajat`
- `Kennelin paikkakunta`

## Calculation notes

- `Sukusiitosaste (9 sp)` is read from the imported legacy `Dog.siitosasteProsentti` value and surfaced as-is in the profile DTO. The admin profile read path does not recalculate it.
- `EPI-luku` and `EPITEKSTI` are calculated on demand in shared server code from imported `KoiranSairaus` disease rows (`epi`, `lepis`, `lepik`, `lepit`) plus the bounded pedigree ancestry loaded for the profile dog. Real `DOG` evidence rows use canonical `Dog.sireId` and `Dog.damId`; anonymous `LITTER` evidence rows are matched through source parent registrations in the bounded health graph, then both source parents are resolved for relationship evidence. Rows that cannot become usable evidence are skipped during import and recorded as import issues.
- `EPITEKSTI` describes only the root dog and is always five characters: `I` self, `S` full sibling, `V` parent, `J` offspring, `P` half-sibling, `-` no evidence.
- `EPI-luku` adds the root dog's evidence at full weight and then repeats the same scoring for generations 1-4 using weights `1/2`, `1/4`, `1/8`, and `1/16`; the final value is rounded to 5 decimals before returning.
- `Lafora-luku` uses real dog disease rows as a per-dog value: `lepis -> 7`, `lepik -> 3`, `lepit -> -1`, otherwise `0`. A dog's own value wins; otherwise the result is built from sire/dam averages and selected grandparent contributions from canonical ancestry. Anonymous rows with no `dogId` are audit/relationship evidence only and do not affect Lafora.
- `EPI-riskiluku` first maps the rounded `EPI-luku` to a tier (`< 1`, `1..1.5`, `> 1.5`) and then combines that tier with `Lafora-luku` through the legacy 1-8 lookup in server code.
- The shared calculator now lives in `packages/server/dogs/core` and is reused by
  admin dog profile and admin virtual pairing.
- The profile surface uses the shared `EpiLukuWithFlag` renderer in web code so
  the legacy EPI dot, tooltip, and class number stay identical anywhere the
  value is shown.
- Virtual pairing uses the same calculator shape but loads the current disease
  facts on demand and also evaluates PUR (`pur`, `ap`, `yp`, `rp`) from the
  current pedigree graph.

No legacy `beaepi` cache table is imported or persisted in v2 for this admin profile view.

## Boundary rules

- Public responses must not include admin-only fields.
- Admin-only reads go through the admin route and admin DTOs.
- Any future virtual-pairing health/risk changes should be added behind the same
  shared calculator boundary and covered by tests.
