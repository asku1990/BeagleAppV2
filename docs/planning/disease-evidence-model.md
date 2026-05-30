# Disease Evidence Model Planning Note

## Problem

Legacy `beasairaat` rows mix three responsibilities:

- Direct disease fact for a real dog.
- Anonymous affected puppy/litter evidence, for example `EPI_1/94` and `PUR_1/06`.
- Relationship lookup through `ISREK` and `EMREK`.

In v2 this should be cleaned up. Canonical dog relationships must come from
`Dog.sireId` and `Dog.damId`, not from disease rows.

## Current State

The current implementation is an incremental step toward the evidence model:

- Real disease rows have `KoiranSairaus.dogId` set.
- Anonymous imported rows keep `dogId = null`.
- For real disease rows, calculation loads parent relationships from canonical
  `Dog.sireId` and `Dog.damId`.
- For anonymous rows, calculation still uses stored `isaDogId` and `emaDogId`
  as anonymous litter relationship evidence.
- `evidenceKind` is currently derived in the disease fact loader:
  - `dogId != null` -> `DOG`
  - `dogId == null` -> `LITTER`
- `UNRESOLVED` is not a stored or returned evidence kind yet. Rows with an
  unresolved valid `REKNO` are imported with `dogId = null` for audit/manual
  cleanup; whether they affect calculations depends on resolved parent links.
- Lafora uses only real `DOG` disease rows. Anonymous rows do not affect Lafora.

## Target Decision

Model disease rows as evidence:

- `DOG`: linked to a real affected dog.
- `LITTER`: anonymous affected puppy/litter linked to resolved sire and dam.
- `UNRESOLVED`: preserved import/source row, excluded from calculations.

Do not create fake dogs for anonymous disease rows.

## Calculation Policy

For `DOG` evidence:

- Use `dogId` for direct disease evidence.
- Use canonical dog pedigree for parents, siblings, offspring, and half-siblings.
- Ignore source `ISREK` and `EMREK` for relationship matching.

For `LITTER` evidence:

- Use resolved sire and dam as anonymous affected litter evidence.
- Allow it to contribute to EPI/PUR relationship evidence.
- Never count it as direct disease for any real dog.

For `UNRESOLVED` evidence:

- Preserve for audit/manual cleanup.
- Exclude from calculations.

## Import Policy

- Real `REKNO` resolving to dog -> `DOG`.
- Invalid/synthetic/missing `REKNO` with both parents resolved -> `LITTER`.
- No resolved dog and no resolved complete parent pair -> `UNRESOLVED`.
- Always preserve raw source registration strings.

## Follow-up: Remove Parent Dog Relations From Disease Rows

`KoiranSairaus.isaDogId` and `KoiranSairaus.emaDogId` duplicate pedigree data
and make the disease table look like a second parent source. They should be
removed in a separate migration.

Replace them with raw source parent registration fields, for example:

- `isaRekisterinumero String?`
- `emaRekisterinumero String?`

Desired behavior after that migration:

- For rows with `dogId`, ignore source parent registrations in calculations and
  use canonical `Dog.sireId` and `Dog.damId`.
- For rows with `dogId = null`, resolve `isaRekisterinumero` and
  `emaRekisterinumero` through `DogRegistration` at read time and use those
  resolved dogs only as anonymous EPI/PUR litter relationship evidence.
- Preserve source parent registrations even when they do not resolve, so import
  issues can be fixed manually without losing the original legacy values.
- Do not create placeholder dogs for anonymous or unresolved disease rows.

## Examples

- `FI15813/15` should be `DOG` evidence because the dog exists.
- `PKR.VI-15268` vs `PKRVI-15268` is an alias/import cleanup issue, not a reason to lose dog evidence.
- `EPI_1/94` with resolved sire/dam should be `LITTER` evidence.
- Missing `REKNO` with unresolved parents should be `UNRESOLVED`.

## Out Of Scope

- Admin UI for adding/editing disease rows.
- Manual alias cleanup UI.
- Creating placeholder dogs.
- Backward compatibility for partially bootstrapped import states.
