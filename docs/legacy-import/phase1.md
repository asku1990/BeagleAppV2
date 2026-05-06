# Legacy Import Phase 1

## Purpose

This is the detailed implementation reference for phase1.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 1 imports foundation entities and link structures. It does not import trials or shows.

## Command

`pnpm import:phase1 [USER_ID]`

## Primary source tables

- `bearek_id`
- `kennel`
- `beaom`
- `bea_apu`
- `samakoira`

## Source row mapping (high level)

- `bearek_id` -> dog base fields and canonical registration:
  - `REKNO` -> `DogRegistration.registrationNo`
  - `KNIMI` -> `Dog.name`
  - `SUKUP` -> `Dog.sex`
  - `SYNTY` -> `Dog.birthDate`
  - `KASVA` -> breeder text + breeder link candidate
- `kennel` -> `Breeder` details (`name`, short code, city, granted/raw fields).
- `bea_apu` -> `Dog.ekNo` by registration lookup.
- `beaom` -> `Owner` + `DogOwnership` rows by registration lookup.
- `samakoira` -> alias registrations (`REK_2`, `REK_3`) attached to canonical `REK_1`.
- `samakoira.VARA` -> appended into `Dog.note` for the canonical dog when non-empty.

## Main writes

- `Dog`
- `DogRegistration`
- `Breeder`
- `Owner`
- `DogOwnership`
- sire/dam relations on `Dog`
- alias/canonical registration mappings via phase1 logic

## Relation and linking rules

- Breeder link:
  - breeder name is normalized to a key
  - ambiguous breeder keys are not auto-linked (`BREEDER_NAME_KEY_AMBIGUOUS`)
- Parent links (`sireId`, `damId`):
  - resolved after dog/registration indexing
  - missing/invalid/placeholder parent refs are reported as issues
  - when the dog itself never imported, `RELATION_DOG_NOT_FOUND` now clarifies whether the row was skipped earlier because `KNIMI` was blank or whether the dog was absent from the imported dogs index in the new database
- Owner links:
  - owner row requires a resolved dog by registration
  - ownership uses `ownershipDateKey` and `createMany(skipDuplicates=true)`
- EK rows:
  - `bea_apu` rows with a non-empty `EKNO` update `Dog.ekNo`
  - rows without `EKNO` do not update `Dog.ekNo`
  - malformed `registrationNo` values are still recorded as issues before the `EKNO` check
  - the phase log reports both the raw `bea_apu` row count and the subset that has a non-empty `EKNO`

## Idempotency and rerun behavior

- Dogs and breeders are written via upsert-like behavior (existing rows updated by key).
- Alias registration inserts from `samakoira` avoid duplicates/conflicts:
  - existing alias on same dog: kept
  - existing alias on different dog: `REGISTRATION_ALIAS_CONFLICT`
  - empty `REK_2` slots are recorded as warnings
  - empty `REK_3` slots are expected and skipped silently
- `samakoira.VARA` values are merged into `Dog.note` using a `|` separator and duplicate text is not re-added.
- Ownership rows are duplicate-safe via unique key + `skipDuplicates`.

## Issue profile

Typical issue groups:

- missing required fields
- invalid registration format
- missing dog relation targets
- placeholder/invalid relation registrations
- alias/canonical conflicts

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE1`.

## Error handling detail

- Invalid registration formats are reported and skipped for that row path.
- Missing relation targets are reported and row-specific link/write is skipped.
- Import continues and run finishes `SUCCEEDED` with warnings when issues exist.
- Unexpected exceptions mark run as `FAILED` with `UNEXPECTED_EXCEPTION`.

## Implementation references

- Phase use-case: `packages/server/imports/phase1/run-legacy-phase1.ts`
- Source loader: `packages/db/imports/phase1/source.ts`
- Shared helpers: `packages/server/imports/core/*`, `packages/server/imports/internal/*`

## Operational notes

- Phase 1 should be run before phase1.5, phase2, and phase3.
- Phase 1 belongs to the initial migration flow and is included in `import:bootstrap`.
