# Legacy Import Phase 2

## Purpose

This is the detailed implementation reference for phase2.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 2 imports trial result rows only.

## Command

`pnpm import:phase2 [USER_ID]`

## Primary source table

- `akoeall`

## Source row mapping (high level)

`akoeall` rows are mapped into `TrialResult`, including:

- identity and event fields:
  - `REKNO` -> registration key
  - `TAPPA` -> event place
  - `TAPPV` -> event date
- result payload fields:
  - class/award/rank/points fields (`LK`, `PA`, `SIJA`, `PISTE`)
  - trial metric fields (`HAKU`, `HAUK`, `YVA`, `HLO`, `ALO`, `TJA`, `PIN`)
  - judge and legacy flag (`TUOM1`, `VARA`)

## Main writes

- `TrialResult`

Dog linkage is resolved through `DogRegistration` (`registrationNo -> dogId`).

## Linking and write rules

- Phase2 builds a registration-to-dog index before row processing.
- Each trial row uses that index to set `dogId` when possible.
- Invalid registration format or missing required event fields are written as issues.

## Idempotency and rerun behavior

- Trial writes are duplicate-safe by canonical trial identity (`sourceKey` path in trial upsert logic).
- Re-running phase2 updates/keeps existing canonical trial identity rows instead of creating duplicates.

## Issue codes

- `TRIAL_REGISTRATION_INVALID_FORMAT`
- `TRIAL_EVENT_MISSING_REQUIRED_FIELDS`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE2`.

## Error handling detail

- Row-level validation issues are recorded and import continues.
- Run finishes `SUCCEEDED` with warnings when row issues exist.
- Unexpected exceptions mark run as `FAILED` with `UNEXPECTED_EXCEPTION`.

## Implementation references

- Phase use-case: `packages/server/imports/phase2/run-legacy-phase2.ts`
- Source loader: `packages/db/imports/phase2/source.ts`
- Trial upsert logic: `packages/server/imports/internal/persistence.ts` (`upsertTrialRows`)

## Operational notes

- Requires phase1 foundation data to maximize dog linking.
- Phase 2 belongs to the initial migration flow and is included in `import:bootstrap`.
