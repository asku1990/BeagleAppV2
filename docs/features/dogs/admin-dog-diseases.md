# Admin Dog Diseases

Admin-facing disease evidence browsing, creation, and deletion for `KoiranSairaus` rows.

## Scope

- Route: `/admin/dogs/diseases`
- Web action surface: `apps/web/app/actions/admin/dogs/diseases/*`
- Server use-cases: `packages/server/admin/dogs/diseases/*`
- DB repository: `packages/db/admin/dogs/diseases/*`

## Behavior

- The page lists disease rows by disease code and supports create/delete actions.
- Browse filtering is explicit-submit: changing the disease code or typing a
  name or registration number does not reload data until the admin presses
  `Hae`.
- The text search matches the disease row registration number and linked dog
  name. Pagination preserves the submitted disease code and text filters.
- The disease code filter defaults to `epi` and supports an explicit `all`
  option to show every disease row.
- Disease creation supports two evidence kinds:
  - `DOG`: links the row to a resolved real dog.
  - `LITTER`: stores anonymous litter evidence with a male sire and female dam
    identified by their registration numbers.
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
- Litter parents must resolve to different dogs. The sire must be male and the
  dam female; dogs with an unknown sex are rejected in either role.
- Dog evidence requires the registration number to resolve to a real dog.
- Litter evidence accepts any non-empty identity up to 40 characters when the
  identity does not resolve to a real dog.
- If a litter identity resolves to a real dog, creation is rejected and the
  admin is instructed to add the disease as `DOG` evidence instead.

## Litter identities

- Legacy anonymous patterns such as `EPI_1/94`, `EPI1/26`, and `PUR1/06`
  remain valid, but new litter identities are not restricted to those formats.
- The explicit `LITTER` evidence kind and resolved source parents distinguish
  anonymous litter evidence without creating placeholder dogs.

## Duplicate prevention

- Exact duplicate disease evidence rows are rejected server-side before insert.
- DOG duplicates match on evidence kind, dog, disease, and registration number.
- LITTER duplicates match on evidence kind, disease, registration number, sire registration, and dam registration.
- The user-facing error is `Disease evidence already exists.`

## Tests

- Server create/delete behavior: `packages/server/admin/dogs/diseases/__tests__/*`
- DB duplicate lookup and write behavior: `packages/db/admin/dogs/diseases/__tests__/*`
- Web action and mutation forwarding: `apps/web/app/actions/admin/dogs/diseases/__tests__/*` and `apps/web/queries/admin/dogs/diseases/__tests__/*`
