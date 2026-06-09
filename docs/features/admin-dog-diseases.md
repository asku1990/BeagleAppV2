# Admin Dog Diseases

Admin-facing disease evidence browsing, creation, and deletion for `KoiranSairaus` rows.

## Scope

- Route: `/admin/dogs/diseases`
- Web action surface: `apps/web/app/actions/admin/dogs/diseases/*`
- Server use-cases: `packages/server/admin/dogs/diseases/*`
- DB repository: `packages/db/admin/dogs/diseases/*`

## Behavior

- The page lists disease rows by disease group and supports create/delete actions.
- Browse filtering is explicit-submit: changing the group or typing a name or
  registration number does not reload data until the admin presses `Hae`.
- The text search matches the disease row registration number and linked dog
  name. Pagination preserves the submitted group and text filters.
- Supported disease groups are the imported `Sairaus.sairausRyhma` values:
  `EPILEPSIA`, `LAFORA`, `PURENTA`, `MLS`, and `MUU`.
- Disease creation supports two evidence kinds:
  - `DOG`: links the row to a resolved real dog.
  - `LITTER`: stores anonymous litter evidence with resolved sire and dam registration numbers.
- The browse list now surfaces the persisted create-modal metadata directly in each row/card:
  - evidence kind
  - `pentue`
  - `kuvaus`
  - `tietolahde`
- Long metadata wraps in the list so the page stays readable on desktop and mobile.
- Disease deletion is admin-only and runs through the audit transaction path used by the server write use-case.

## Validation rules

- Disease code is required.
- Registration number is required.
- Litter evidence requires both sire and dam registration numbers.
- Dog evidence requires the registration number to resolve to a real dog.
- Litter evidence rejects valid real dog registrations unless the registration is a supported synthetic/anonymous format.

## Synthetic registrations

- Accepted formats are the legacy anonymous patterns used by imported disease evidence, including underscore-based forms like `EPI_1/94` and compact code-prefixed forms like `EPI1/26` or `PUR1/06`.
- These formats exist so anonymous litter evidence can be recorded without creating placeholder dogs.

## Duplicate prevention

- Exact duplicate disease evidence rows are rejected server-side before insert.
- DOG duplicates match on evidence kind, dog, disease, and registration number.
- LITTER duplicates match on evidence kind, disease, registration number, sire registration, and dam registration.
- The user-facing error is `Disease evidence already exists.`

## Tests

- Server create/delete behavior: `packages/server/admin/dogs/diseases/__tests__/*`
- DB duplicate lookup and write behavior: `packages/db/admin/dogs/diseases/__tests__/*`
- Web action and mutation forwarding: `apps/web/app/actions/admin/dogs/diseases/__tests__/*` and `apps/web/queries/admin/dogs/diseases/__tests__/*`
