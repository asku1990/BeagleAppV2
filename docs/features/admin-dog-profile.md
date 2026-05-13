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
- `EPI-luku (5 sp)`
- `Lafora-luku(-1..7)`
- `EPI-riskiluku(1-8)`
- `Terveystiedot`
- `Vanhemmat`
- `Omistaja`
- `Omistajan Osoite`
- `Kasvattaja`
- `Kasvattajan Osoite`

## EPI status

`EPI-luku`, `Lafora-luku`, and `EPI-riskiluku` are shown as placeholders for now. The legacy calculation path is not yet ported into the new profile surface, so the admin page intentionally avoids inventing a value.

## Boundary rules

- Public responses must not include admin-only fields.
- Admin-only reads go through the admin route and admin DTOs.
- Any future EPI implementation should be added behind the same boundary and covered by tests before the placeholder is replaced.
