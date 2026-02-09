# Phase-1 Import Behavior

This document describes how phase-1 legacy import works in detail: source tables, stage logic, required fields, registration normalization, and issue logging.

## Entry points

- Run import:
  - `pnpm import:phase1`
  - Optional actor id: `pnpm import:phase1 -- <USER_ID>`
- Inspect issues:
  - `pnpm import:issues -- <RUN_ID>`
  - Optional filters: `--stage`, `--code`, `--limit`

Implementation references:

- `packages/server/imports/service.ts`
- `packages/server/imports/persistence.ts`
- `packages/db/legacy/source.ts`
- `packages/server/scripts/list-import-issues.ts`

## Data model

Registration identity is stored only in `DogRegistration`.

- Canonical registration rows are stored with `source="CANONICAL"`.
- Legacy aliases from `samakoira.REK_2` and `samakoira.REK_3` are stored with `source="LEGACY_SAMAKOIRA"`.
- `DogRegistration.registrationNo` is globally unique, so one registration maps to exactly one dog.
- `samakoira.VARA` is preserved on `Dog.note`.

## Source tables and field mapping

Legacy fetch is performed in `packages/db/legacy/source.ts`.

- Dogs (`bearek_id`)
  - `REKNO -> registrationNo`
  - `KNIMI -> name`
  - `SUKUP -> sex`
  - `SYNTY -> birthDateRaw`
  - `ISREK -> sireRegistrationNo`
  - `EMREK -> damRegistrationNo`
  - `KASVA -> breederName`
- EK (`bea_apu`)
  - `REKNO -> registrationNo`
  - `EKNO -> ekNo`
- Owners (`beaom`)
  - `REKNO -> registrationNo`
  - `OMIST -> ownerName`
  - `OMPOSNO -> postalCode`
  - `OMPOSPA -> city`
  - `OMIPV -> ownershipDateRaw`
- Trial events (`akoeall`)
  - `REKNO -> registrationNo`
  - `TAPPA -> eventName`
  - `TAPPV -> eventDateRaw`
- Show events (`nay9599`)
  - `REKNO -> registrationNo`
  - `TAPPA -> eventName`
  - `TAPPV -> eventDateRaw`
- Alias rows (`samakoira`)
  - `REK_1 -> rek1` (canonical registration)
  - `REK_2 -> rek2` (alias registration)
  - `REK_3 -> rek3` (alias registration)
  - `REK_MUU -> rekMuu` (ignored in phase 1)
  - `VARA -> vara` (merged into `Dog.note`)

## Stage order

The import pipeline runs in this order:

1. `load`
2. `dogs`
3. `ek`
4. `samakoira`
5. `index`
6. `relations`
7. `owners`
8. `trials`
9. `shows`

Import issues are buffered and bulk inserted during the run.

## Registration normalization and validation

Registration numbers are normalized before lookups and writes:

- `trim`
- `uppercase`

Allowed format after normalization:

- Unicode letters, numbers, `/`, `-`, `.`

Rows with invalid registration format are skipped and logged with:

- `REGISTRATION_INVALID_FORMAT`

## Required fields and skip behavior

### Dogs stage

- Required: `registrationNo`, `name`.
- Missing required data:
  - Issue code: `DOG_MISSING_REQUIRED_FIELDS`
  - Dog row is skipped.
- Invalid registration format:
  - Issue code: `REGISTRATION_INVALID_FORMAT`
  - Dog row is skipped.
- Valid rows:
  - Upsert dog by looking up `DogRegistration.registrationNo`.
  - If registration does not exist, create dog and canonical `DogRegistration` row.

### EK stage

- If `registrationNo` missing:
  - Issue code: `EK_MISSING_REGISTRATION`
  - Row skipped.
- If `registrationNo` format invalid:
  - Issue code: `REGISTRATION_INVALID_FORMAT`
  - Row skipped.
- If `ekNo` is null:
  - Row skipped without issue.
- Otherwise updates `Dog.ekNo` through registration lookup in `DogRegistration`.

### Samakoira stage

- Canonical `REK_1` must resolve to an imported dog registration.
  - If missing or not found:
    - Issue code: `SAMAKOIRA_CANONICAL_NOT_FOUND`
- Alias `REK_2`/`REK_3` rows are normalized and attached as `DogRegistration` rows.
- Alias collision behavior:
  - If alias already belongs to another dog:
    - Issue code: `REGISTRATION_ALIAS_CONFLICT`
  - Alias is not reassigned.
- `REK_MUU` is ignored in phase 1.
- `VARA` merge behavior (`Dog.note`):
  - If note is null: set to `VARA`.
  - If note differs: append ` | <VARA>`.
  - If already present: no change.

### Relations stage (sire/dam)

- Dog row must resolve by normalized registration via `DogRegistration`; if not, relation update is skipped.
- Parent links are resolved by normalized registration against registration index.
- If sire/dam registration format is invalid:
  - Issue code: `REGISTRATION_INVALID_FORMAT`
  - That parent link is treated as missing.
- If sire/dam reference exists but is not found:
  - Issue codes:
    - `RELATION_SIRE_NOT_FOUND`
    - `RELATION_DAM_NOT_FOUND`
  - Link is stored as `null`.
- Placeholder handling:
  - Values like `U000000`, `U00000`, `U0000` (`^U0+$`, case-insensitive) are treated as placeholder unknowns.
  - They are not looked up and do not create not-found issues.
  - Link remains `null`.

### Owners stage

- Owner row must match an imported dog through registration lookup.
  - If not found:
    - Issue code: `OWNER_DOG_NOT_FOUND`
    - Owner/ownership insert skipped.
- If registration format is invalid:
  - Issue code: `REGISTRATION_INVALID_FORMAT`
  - Owner/ownership insert skipped.
- Owner identity requirement:
  - `ownerName` must be non-empty.
  - If missing:
    - Issue code: `OWNER_MISSING_REQUIRED_FIELDS`
    - Owner/ownership insert skipped.
- Valid rows:
  - Owner upsert behavior uses unique key `(name, postalCode, city)`.
  - Ownership is deduplicated by `(dogId, ownerId, ownershipDate)`.

### Trials and shows stages

Common event upsert logic in `packages/server/imports/persistence.ts`.

Required for each event row:

- Valid registration format
- Dog exists by normalized registration lookup
- Valid event date from `eventDateRaw` (`YYYYMMDD`)
- Non-empty `eventName`

If registration format is invalid:

- Issue code: `REGISTRATION_INVALID_FORMAT`
- Event row skipped.

If dog/date/name is missing:

- Issue code: `EVENT_MISSING_REQUIRED_FIELDS`
- Event row skipped.

Valid rows are upserted by source key:

- `sourceKey = normalizedRegistrationNo|eventDateRaw|eventName`

## Date and value normalization

- `normalizeNullable` trims strings and converts empty string to `null`.
- `normalizeRegistrationNo` trims and uppercases registration values.
- `parseLegacyDate` accepts only `YYYYMMDD` and validates actual calendar date.

Implementation:

- `packages/server/imports/transform.ts`

## Logging and run status

Runtime logging includes:

- Stage start/end
- Progress every 1000 records
- Per-stage summary counters

Run lifecycle:

- Create `ImportRun` in `PENDING`
- Mark `RUNNING`
- Mark `SUCCEEDED` or `FAILED` at end

If the pipeline throws:

- Adds `UNEXPECTED_EXCEPTION` issue in stage `run`
- Marks run `FAILED`

## Issue storage model

Issues are stored in `ImportRunIssue` with:

- `stage`, `severity`, `code`, `message`
- Optional `registrationNo`, `sourceRowId`, `sourceTable`
- Optional `payloadJson` (raw context for manual repair)

Query paths:

- Script: `pnpm import:issues -- <RUN_ID>`
- API: `GET /api/v1/imports/<RUN_ID>/issues`
