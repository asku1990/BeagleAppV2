# Legacy Import Phase 1.5

## Purpose

This is the detailed implementation reference for phase1.5.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 1.5 imports legacy dog title rows from `bea_apu.VALIO` into `DogTitle`.

## Command

`pnpm import:phase1.5 [USER_ID]`

## Primary source table

- `bea_apu`

## Source row mapping (high level)

- `REKNO` -> registration key used to resolve dog via `DogRegistration`
- `VALIO` -> `DogTitle.titleCode` (raw value; no title-definition mapping)

Written title fields:

- `titleCode`: legacy `VALIO` value (trimmed)
- `titleName`: `null`
- `awardedOn`: `null`
- `sortOrder`: `0`

## Main writes

- `DogTitle`

One raw title row is imported per dog for this phase.

## Deduplication and conflict rules

- Blank `VALIO` values are skipped.
- Rows are grouped by resolved dog.
- Value comparison for dedupe/conflict uses normalized `VALIO`:
  - trim
  - collapse repeated whitespace to a single space
  - uppercase
- If all non-empty normalized values for a dog are equal, rows deduplicate to one imported title row.
- If two or more distinct normalized values exist for the same dog, phase1.5 records `TITLE_ALIAS_VALUE_CONFLICT`.

Conflict winner selection:

- Prefer a value from source rows whose `REKNO` matches the dog's canonical registration
  (the oldest registration row for that dog).
- If no source row uses the canonical registration, choose deterministic fallback:
  lexicographically smallest normalized value.
- Phase still imports one row for that dog and records the conflict issue.

## Issue codes

- `TITLE_REGISTRATION_MISSING`
- `TITLE_REGISTRATION_INVALID_FORMAT`
- `TITLE_DOG_NOT_FOUND`
- `TITLE_ALIAS_VALUE_CONFLICT`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE1_5`.

## Error handling detail

- Row-level validation/linking issues are recorded and import continues.
- Run finishes `SUCCEEDED` with warnings when issues exist.
- Unexpected exceptions mark run as `FAILED` with `UNEXPECTED_EXCEPTION`.

## Implementation references

- Phase use-case: `packages/server/imports/phase1_5/run-legacy-phase1_5.ts`
- Source loader: `packages/db/imports/phase1_5/source.ts`

## Operational notes

- Phase 1.5 should run after phase1 and before phase2.
- Phase 1.5 belongs to the same one-shot bootstrap/migration flow as phase1/2/3.
