# Legacy Import Phase 1.25

This phase imports legacy disease data and stored dog inbreeding percentages
after phase1 has created canonical dogs and registrations, and before phase1.5
imports titles.

## Command

`pnpm import:phase1.25 [USER_ID]`

## Source tables

- `bearek_id.SIITOSASTE` updates `Dog.siitosasteProsentti`.
- `beasairaudet` imports disease definitions into `Sairaus`.
- `beasairaat` imports dog disease rows into `KoiranSairaus`.

## Relationship rules

- Dog, sire, and dam links are resolved through `DogRegistration.registrationNo`.
- Imported rows store v2 dog ids when `REKNO` resolves. For these real dog
  disease rows, source `ISREK` and `EMREK` are not stored because canonical
  parentage comes from `Dog.sireId` and `Dog.damId`.
- Imported disease rows keep the row dog's raw legacy registration number as
  `rekisterinumero` for traceability.
- Synthetic or missing `beasairaat.REKNO` values are preserved with a null
  `dogId` instead of being skipped, so anonymous affected puppy/litter evidence
  can be audited and used by later disease-model cleanup.
- Valid `REKNO` values that do not resolve are preserved with a null `dogId`
  and a warning issue.
- Source `ISREK` and `EMREK` parent ids are stored only for rows without a
  resolved real dog.
- Unresolved dog, sire, or dam ids do not fail the import.

## Data rules

- `SIITOSASTE` `NULL` and `0` import as `null`.
- Positive `SIITOSASTE` imports as `Dog.siitosasteProsentti`.
- `Sairaus.sairausRyhma` is derived from `beasairaudet.SAIRAUS`.
- No other legacy source tables are imported by this phase.

## Implementation references

- Phase use-case: `packages/server/imports/phase1_25/run-legacy-phase1_25.ts`
- Source loader: `packages/db/imports/phase1_25/source.ts`

Phase 1.25 belongs to the same one-shot bootstrap/migration flow as
phase1/1.5/2/3/5.
