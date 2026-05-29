# Disease Evidence Model Planning Note

## Problem

Legacy `beasairaat` rows mix three responsibilities:

- Direct disease fact for a real dog.
- Anonymous affected puppy/litter evidence, for example `EPI_1/94` and `PUR_1/06`.
- Relationship lookup through `ISREK` and `EMREK`.

In v2 this should be cleaned up. Canonical dog relationships must come from
`Dog.sireId` and `Dog.damId`, not from disease rows.

## Decision

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
