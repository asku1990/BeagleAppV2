# Phase-1 Import Behavior

This document describes how phase-1 legacy import currently works in detail: source tables, stage logic, required fields, and issue logging.

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
  - `OMID -> sourceRowId`
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

## Stage order

The import pipeline runs in this order:

1. `load`
2. `dogs`
3. `ek`
4. `index`
5. `relations`
6. `owners`
7. `trials`
8. `shows`

Import issues are buffered and bulk inserted during the run.

## Required fields and skip behavior

### Dogs stage

- Required: `registrationNo`, `name`.
- Missing required data:
  - Issue code: `DOG_MISSING_REQUIRED_FIELDS`
  - Dog row is skipped.
- Valid rows are upserted into `Dog`.

### EK stage

- If `registrationNo` missing:
  - Issue code: `EK_MISSING_REGISTRATION`
  - Row skipped.
- If `ekNo` is null:
  - Row skipped without issue.
- Otherwise updates `Dog.ekNo` by registration number.

### Relations stage (sire/dam)

- Dog row must be found by its own `registrationNo`; if not, relation update is skipped.
- Parent links are resolved by registration against imported dogs index.
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

- Owner row must match an imported dog by `registrationNo`.
  - If not found:
    - Issue code: `OWNER_DOG_NOT_FOUND`
    - Owner/ownership insert skipped for that row.
- Owner identity requirement:
  - `ownerName` must be non-empty.
  - If missing:
    - Issue code: `OWNER_MISSING_REQUIRED_FIELDS`
    - Owner/ownership insert skipped.
- Valid rows:
  - Owner upsert behavior uses unique key `(name, postalCode, city)`.
  - Ownership is deduplicated by `(dogId, ownerId, ownershipDate, sourceRowId)`.

### Trials and shows stages

Common event upsert logic in `packages/server/imports/persistence.ts`.

Required for each event row:

- Dog exists by `registrationNo`
- Valid event date from `eventDateRaw` (`YYYYMMDD`)
- Non-empty `eventName`

If any required value is missing:

- Issue code: `EVENT_MISSING_REQUIRED_FIELDS`
- Event row skipped.

Valid rows are upserted by source key:

- `sourceKey = registrationNo|eventDateRaw|eventName`

## Date and value normalization

- `normalizeNullable` trims strings and converts empty string to `null`.
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
