# Phase-1 Import Behavior

This document describes how phase-1 legacy import works in detail: source tables, stage logic, required fields, registration normalization, and issue logging.

## Entry points

- Run import:
  - `pnpm import:phase1`
  - Optional actor id: `pnpm import:phase1 <USER_ID>`
- Inspect issues:
  - `pnpm import:issues <RUN_ID>`
  - Optional filters: `--stage`, `--code`, `--severity`, `--limit`
- Export issues to CSV files grouped by error code:
  - `pnpm import:issues:csv <RUN_ID>`
  - (equivalent) `pnpm --filter @beagle/server import:issues:csv -- <RUN_ID>`
  - Optional filters: `--stage`, `--code`, `--severity`, `--limit`, `--out`
  - Example (single code): `pnpm import:issues:csv <RUN_ID> --code REGISTRATION_INVALID_FORMAT`
  - Default output directory: `./tmp/import-issues/<RUN_ID>`
  - Output files: `index.csv`, `stage-reasons.csv`, and one `<CODE>.csv` per issue code

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
- Dog breeder source text from legacy `KASVA` is stored on `Dog.breederNameText`.
- `Breeder` is a kennel directory from legacy `kennel` and dogs are linked by optional `Dog.breederId` only on exact normalized name match.

## Source tables and field mapping

Legacy fetch is performed in `packages/db/legacy/source.ts`.

- Dogs (`bearek_id`)
  - `REKNO -> registrationNo`
  - `KNIMI -> name`
  - `SUKUP -> sex`
  - `SYNTY -> birthDateRaw`
  - `ISREK -> sireRegistrationNo`
  - `EMREK -> damRegistrationNo`
  - `KASVA -> breederNameText` (and optional breeder directory link by exact normalized name match)
- Breeders (`kennel`)
  - `KENNEL -> name`
  - `KELYHE -> shortCode`
  - `MYONNETTY -> grantedAtRaw`
  - `KEOMIS -> ownerName`
  - `POSPAI -> city`
  - `VARA -> legacyFlag`
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
  - `TAPPA -> eventPlace`
  - `TAPPV -> eventDateRaw`
  - `KENNELPIIRI -> kennelDistrict`
  - `KENNELPIIRINRO -> kennelDistrictNo`
  - `KE, LK, PA, PISTE, SIJA, HAKU, HAUK, YVA, HLO, ALO, TJA, PIN`
  - `TUOM1 -> judge`
  - `VARA -> legacyFlag`
- Show events (`nay9599`)
  - `REKNO -> registrationNo`
  - `TAPPA -> eventPlace`
  - `TAPPV -> eventDateRaw`
  - `TULNI -> resultText`
  - `KORK -> heightText`
  - `TUOM1 -> judge`
  - `VARA -> legacyFlag`
- Alias rows (`samakoira`)
  - `REK_1 -> rek1` (canonical registration)
  - `REK_2 -> rek2` (alias registration)
  - `REK_3 -> rek3` (alias registration)
  - `REK_MUU -> rekMuu` (ignored in phase 1)
  - `VARA -> vara` (merged into `Dog.note`)

## Stage order

The import pipeline runs in this order:

1. `load`
2. `breeders`
3. `dogs`
4. `ek`
5. `samakoira`
6. `index`
7. `relations`
8. `owners`
9. `trials`
10. `shows`

Import issues are buffered and bulk inserted during the run.

Issue severity values:

- `INFO` for expected/non-actionable paths.
- `WARNING` for data quality problems that do not fail the run.
- `ERROR` for unexpected run-level failures.

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
  - `KASVA` is stored as `Dog.breederNameText`.
  - `Dog.breederId` is linked only when normalized `KASVA` exactly matches a breeder directory name.
  - If no match exists, breeder link remains `null` and text is still preserved.
  - If registration does not exist, create dog and canonical `DogRegistration` row.

### EK stage

- If `registrationNo` missing:
  - Issue code: `EK_MISSING_REGISTRATION`
  - Row skipped.
- If `ekNo` is null:
  - Issue code: `EK_MISSING_EKNO` (`INFO`)
  - Row skipped.
- If `registrationNo` format invalid:
  - Issue code: `REGISTRATION_INVALID_FORMAT`
  - Row skipped.
- If dog registration is not found:
  - Issue code: `EK_DOG_NOT_FOUND`
  - Row skipped.
- Otherwise updates `Dog.ekNo` through registration lookup in `DogRegistration`.

### Breeders stage

- `kennel` rows upsert breeder metadata by `Breeder.name`.
- Directory index for dog linking is built from breeders with `detailsSource = "kennel"`.
- If kennel name is missing:
  - Issue code: `BREEDER_MISSING_NAME`
  - Row skipped.

### Samakoira stage

- Canonical `REK_1` must resolve to an imported dog registration.
  - If missing or not found:
    - Issue code: `SAMAKOIRA_CANONICAL_NOT_FOUND`
- Alias `REK_2`/`REK_3` rows are normalized and attached as `DogRegistration` rows.
- Alias rows with empty alias values are logged as:
  - Issue code: `SAMAKOIRA_ALIAS_EMPTY` (`INFO`)
- Alias rows where alias equals canonical registration are logged as:
  - Issue code: `SAMAKOIRA_ALIAS_EQUALS_CANONICAL` (`INFO`)
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

- Dog row missing canonical registration:
  - Issue code: `RELATION_ROW_MISSING_REGISTRATION` (`INFO`)
  - Relation update skipped.
- Dog row canonical registration not found among imported dogs:
  - Issue code: `RELATION_DOG_NOT_FOUND`
  - Relation update skipped.
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
  - Placeholder reasons are logged as:
    - `RELATION_SIRE_PLACEHOLDER` (`INFO`)
    - `RELATION_DAM_PLACEHOLDER` (`INFO`)
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
  - Ownership is deduplicated by `(dogId, ownerId, ownershipDateKey)`, where `ownershipDateKey` is `YYYY-MM-DD` or `__NULL__` for missing dates.

### Trials and shows stages

Event upsert logic lives in `packages/server/imports/persistence.ts`.

Required for each event row:

- Valid registration format
- Dog exists by normalized registration lookup
- Valid event date from `eventDateRaw` (`YYYYMMDD`)
- Non-empty `eventPlace`

If registration format is invalid:

- Issue code: `REGISTRATION_INVALID_FORMAT`
- Event row skipped.

If dog/date/name is missing:

- Issue code: `EVENT_MISSING_REQUIRED_FIELDS`
- Event row skipped.

Valid rows are upserted by source key:

- `sourceKey = normalizedRegistrationNo|eventDateRaw|eventPlace`

Imported detail fields:

- Trials: district, class/result codes, all score columns, placement, judge, legacy flag.
- Shows: result text, height text, judge, legacy flag.
- `eventName` is intentionally left null for now (reserved for future event title data).

## Date and value normalization

- `normalizeNullable` trims strings and converts empty string to `null`.
- `normalizeRegistrationNo` trims and uppercases registration values.
- `normalizeBreederKey` trims, uppercases, and collapses internal whitespace for deterministic breeder name matching.
- `parseLegacyDate` accepts only `YYYYMMDD` and validates actual calendar date.

Implementation:

- `packages/server/imports/transform.ts`

## Logging and run status

Runtime logging includes:

- Stage start/end
- Progress every 1000 records
- Per-stage summary counters
- Per-stage reason summaries (`reasons=<CODE>(<SEVERITY>):<count>,...`)

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

- Script: `pnpm import:issues <RUN_ID>`
- Script (filtered): `pnpm import:issues <RUN_ID> --severity WARNING`
- CSV export: `pnpm import:issues:csv <RUN_ID>` (includes `stage-reasons.csv`)
- API: `GET /api/v1/imports/<RUN_ID>/issues`
- API (filtered): `GET /api/v1/imports/<RUN_ID>/issues?severity=WARNING`
