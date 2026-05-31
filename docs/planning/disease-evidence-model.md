# Disease Evidence Model Planning Note

## Problem

Legacy `beasairaat` rows mix three responsibilities:

- Direct disease fact for a real dog.
- Anonymous affected puppy/litter evidence, for example `EPI_1/94` and `PUR_1/06`.
- Relationship lookup through `ISREK` and `EMREK`.

In v2 this should be cleaned up. Canonical dog relationships must come from
`Dog.sireId` and `Dog.damId`, not from disease rows.

## Current State

Disease rows are stored as explicit evidence:

- `DOG`: real disease rows have `KoiranSairaus.dogId` set.
- `LITTER`: anonymous affected puppy/litter rows have `dogId = null`, no valid
  real dog registration, and a complete source parent pair.
- Rows that cannot become `DOG` or `LITTER` are skipped from `KoiranSairaus`
  and recorded as import issues for manual cleanup.
- For real disease rows, calculation loads parent relationships from canonical
  `Dog.sireId` and `Dog.damId`.
- For anonymous rows, calculation matches rows through registrations in the
  bounded health graph, then resolves both stored source parent registrations
  through `DogRegistration`.
- Lafora uses only real `DOG` disease rows. Anonymous rows do not affect Lafora.

## Target Decision

Model disease rows as evidence:

- `DOG`: linked to a real affected dog.
- `LITTER`: anonymous affected puppy/litter linked to resolved sire and dam.

Do not create fake dogs for anonymous disease rows.

## Calculation Policy

For `DOG` evidence:

- Use `dogId` for direct disease evidence.
- Use canonical dog pedigree for parents, siblings, offspring, and half-siblings.
- Ignore source `ISREK` and `EMREK` for relationship matching.

For `LITTER` evidence:

- Source row has no valid real dog registration, meaning missing/generated or
  synthetic/invalid `REKNO`, and both source parent registrations resolve.
- Use resolved sire and dam as anonymous affected litter evidence.
- Allow it to contribute to EPI/PUR relationship evidence.
- Never count it as direct disease for any real dog.

## Import Policy

- Real `REKNO` resolving to dog -> `DOG`.
- Invalid/synthetic/missing `REKNO` with both parents resolved -> `LITTER`.
- Valid unresolved `REKNO`, or no resolved complete parent pair -> import issue
  only; do not insert a `KoiranSairaus` row.
- Always preserve raw source registration strings.

## Parent Registration Storage

`KoiranSairaus` stores source parent registration strings, not parent dog
relations:

- `isaRekisterinumero String?`
- `emaRekisterinumero String?`

Desired behavior after that migration:

- For rows with `dogId`, ignore source parent registrations in calculations and
  use canonical `Dog.sireId` and `Dog.damId`.
- For rows with `dogId = null`, match `isaRekisterinumero` or
  `emaRekisterinumero` against the bounded health graph, resolve both source
  parent registrations through `DogRegistration` at read time, and use those
  resolved dogs only as anonymous EPI/PUR litter relationship evidence.
- Preserve unresolved source data in import issues for manual cleanup.
- Do not create placeholder dogs for anonymous disease rows.

## Examples

- `FI15813/15` should be `DOG` evidence because the dog exists.
- `PKR.VI-15268` vs `PKRVI-15268` is an alias/import cleanup issue, not a reason to lose dog evidence.
- `EPI_1/94` with resolved sire/dam should be `LITTER` evidence.
- Missing `REKNO` with unresolved parents should be an import issue only.

## Out Of Scope

- Admin UI for adding/editing disease rows.
- Manual alias cleanup UI.
- Creating placeholder dogs.
- Backward compatibility for partially bootstrapped import states.
