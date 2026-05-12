# Legacy Import Phase 1.25

This phase imports v1 virtual pairing support data after phase1 has created
canonical dogs and registrations, and before phase1.5 imports titles.

## Command

`pnpm import:phase1.25 [USER_ID]`

## Source tables

- `bearek_id.SIITOSASTE` updates `Dog.siitosasteProsentti`.
- `beasairaudet` imports disease definitions into `Sairaus`.
- `beasairaat` imports dog disease rows into `KoiranSairaus`.
- `beaepi` imports admin EPI snapshot rows into `KoiranEpiLuku`.

## Relationship rules

- Dog, sire, and dam links are resolved through `DogRegistration.registrationNo`.
- Imported rows store v2 dog ids when a registration resolves.
- Imported disease and EPI rows keep the row dog's raw legacy registration number
  as `rekisterinumero` for traceability.
- `beaepi` row identity is `ID + REKNO`, not `ID` alone. Phase 1.25 imports
  all rows with a composite `KoiranEpiLuku(vanhaId, rekisterinumero)` identity.
- Unresolved dog, sire, or dam ids do not fail the import.

## Data rules

- `SIITOSASTE` `NULL` and `0` import as `null`.
- Positive `SIITOSASTE` imports as `Dog.siitosasteProsentti`.
- `Sairaus.sairausRyhma` is derived from `beasairaudet.SAIRAUS`.
- Duplicate `beaepi.ID` groups are imported, and each duplicated legacy ID is
  recorded as an `EPI_LUKU_LEGACY_ID_DUPLICATE` warning for later review.
- `beaparitus`, `bearek_esivanhemmat`, and `bea_tilastoja*` are not imported.

## Implementation references

- Phase use-case: `packages/server/imports/phase1_25/run-legacy-phase1_25.ts`
- Source loader: `packages/db/imports/phase1_25/source.ts`

Phase 1.25 belongs to the same one-shot bootstrap/migration flow as
phase1/1.5/2/3/5.
