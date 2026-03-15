# Legacy Import Phase 2

## Purpose

Phase 2 imports trial result rows only.

## Command

`pnpm import:phase2 [USER_ID]`

## Primary source table

- `akoeall`

## Main writes

- `TrialResult`

Dog linkage is resolved through `DogRegistration` (`registrationNo -> dogId`).

## Issue codes

- `TRIAL_REGISTRATION_INVALID_FORMAT`
- `TRIAL_EVENT_MISSING_REQUIRED_FIELDS`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE2`.

## Operational notes

- Requires phase1 foundation data to maximize dog linking.
- Re-run is duplicate-safe via stable `sourceKey` upsert behavior in current trial path.
