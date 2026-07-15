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
  - `COLCODE` -> `Dog.colorCode`
- the canonical typed dog-color catalog -> `DogColor` lookup rows before dog writes
- `kennel` -> `Breeder` details (`name`, short code, city, granted/raw fields).
- `bea_apu` -> `Dog.ekNo` by registration lookup.
- `beaom` -> `Owner` + `DogOwnership` rows by registration lookup.
- `samakoira` -> alias registrations (`REK_2`, `REK_3`) attached to canonical `REK_1`.
- `samakoira.VARA` -> appended into `Dog.note` for the canonical dog when non-empty.

## Main writes

- `Dog`
- `DogColor`
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
  - missing-parent discovery counts references only from rows whose normalized,
    valid child registration exists in the relation index; skipped child rows
    cannot create orphan identities or contribute false parent-role ambiguity
  - a valid missing registration used only as a sire or only as a dam creates one
    `REFERENCE_ONLY` dog before relations are written
  - sire-only references infer `MALE`; dam-only references infer `FEMALE`
  - the normalized registration is used as the required internal name fallback
  - every created reference-only parent produces a
    `RELATION_REFERENCE_ONLY_PARENT_CREATED` review warning after child links are
    written; this warning confirms a successful import and does not increase the
    run error count
  - registrations already owned by normal or reference-only dogs are reused
  - registrations used as both sire and dam create no dog and produce
    `RELATION_PARENT_ROLE_AMBIGUOUS` errors
  - invalid parent registrations are errors, while placeholder registrations
    remain informational and are not created
  - when the dog itself never imported, `RELATION_DOG_NOT_FOUND` now clarifies whether the row was skipped earlier because `KNIMI` was blank or whether the dog was absent from the imported dogs index in the new database
- Owner links:
  - owner row requires a resolved dog by registration
  - ownership uses `ownershipDateKey` and `createMany(skipDuplicates=true)`
- EK rows:
  - `bea_apu` rows with a non-empty `EKNO` update `Dog.ekNo`
  - rows without `EKNO` do not update `Dog.ekNo`
  - malformed `registrationNo` values are still recorded as issues before the `EKNO` check
  - the phase log reports both the raw `bea_apu` row count and the subset that has a non-empty `EKNO`
- Color rows:
  - the canonical typed catalog is seeded before dogs and is the single color label/status source
  - legacy source codes without a known label use hidden `LEGACY_UNKNOWN` lookup rows, preserving the original code without making it selectable
  - `bearek_id.COLCODE` values of `0`, empty, or null are treated as unknown
  - invalid or codes outside the canonical catalog are reported as issues and stored as unknown

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
- successfully created reference-only parents requiring review
- parent registrations used ambiguously as both sire and dam
- alias/canonical conflicts

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE1`.

## Error handling detail

- Invalid registration formats are reported and skipped for that row path.
- Missing relation targets are reported and row-specific link/write is skipped.
- Import continues and run finishes `SUCCEEDED` with warnings when issues exist.
- Unexpected exceptions mark run as `FAILED` with `UNEXPECTED_EXCEPTION`.

## Issue CSV review

Per-code issue CSV files place `message` first so the review note is visible
immediately when the file is opened in Excel. The remaining columns are
`registrationNo`, `sourceTable`, `stage`, `severity`, and `payloadJson`.

## Implementation references

- Phase use-case: `packages/server/imports/phase1/run-legacy-phase1.ts`
- Source loader: `packages/db/imports/phase1/source.ts`
- Shared helpers: `packages/server/imports/core/*`, `packages/server/imports/internal/*`

## Operational notes

- Phase 1 should be run before phase1.25, phase1.5, phase2, and phase3.
- Phase 1 belongs to the initial migration flow and is included in `import:bootstrap`.
