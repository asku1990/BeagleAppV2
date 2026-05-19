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

## EPI status

`EPI-luku`, `EPITEKSTI`, `Lafora-luku`, and `EPI-riskiluku` are calculated on demand in server code from:

- imported `KoiranSairaus` disease rows (`epi`, `lepis`, `lepik`, `lepit`)
- bounded pedigree ancestry loaded for the profile dog

No legacy `beaepi` cache table is imported or persisted in v2 for this admin profile view.

## Boundary rules

- Public responses must not include admin-only fields.
- Admin-only reads go through the admin route and admin DTOs.
- Any future virtual-pairing EPI implementation should be added behind the same boundary and covered by tests.
