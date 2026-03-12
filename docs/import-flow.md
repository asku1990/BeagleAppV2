# Legacy Import Flow (Phases 1-3)

This document describes the current legacy bootstrap import flow after split-phase cutover.

## Commands

- Phase 1 (foundation only): `pnpm import:phase1`
- Phase 2 (trials): `pnpm import:phase2`
- Phase 3 (shows): `pnpm import:phase3`
- Show result definition seed (canonical awards): `pnpm --filter @beagle/db seed:show-result-definitions`
- Optional full bootstrap (`auth:bootstrap-admin` -> `seed:show-result-definitions` -> `phase1` -> `phase2` -> `phase3`): `pnpm import:bootstrap`

Optional actor id for phase commands:

- `pnpm import:phase1 <USER_ID>`
- `pnpm import:phase2 <USER_ID>`
- `pnpm import:phase3 <USER_ID>`

Issue tooling:

- Inspect issues: `pnpm import:issues <RUN_ID>`
- Export CSV files: `pnpm import:issues:csv <RUN_ID>`
- Optional filters: `--stage`, `--code`, `--severity`, `--limit`, `--out`

## Phase responsibilities

1. `phase1` imports only foundation data:

- dogs
- registrations
- breeders
- aliases (`samakoira`)
- relations (sire/dam links)
- owners and ownerships

2. `phase2` imports trial rows using current trial schema.

3. `phase3` imports show rows using current show schema (canonical show schema cutover is handled in later tasks).

4. `seed:show-result-definitions` upserts canonical `ShowResultDefinition` rows used by both
   legacy and Kennelliitto workbook mappings (for example `ROP`, `VSP`, `SERT`, `VASERT`, `CACIB`,
   `VARACACIB`, `JUN-ROP`, `JUN-VSP`, `VET-ROP`, `VET-VSP`, `SA`, `KP`).

`import:bootstrap` runs the full sequence in this order:

1. `auth:bootstrap-admin`
2. `seed:show-result-definitions`
3. `phase1`
4. `phase2`
5. `phase3`

## ImportRun and issues model

Each phase creates its own `ImportRun` with its own `runId`.

- `phase1` -> `kind=LEGACY_PHASE1`
- `phase2` -> `kind=LEGACY_PHASE2`
- `phase3` -> `kind=LEGACY_PHASE3`

Issue rows are written to shared `ImportRunIssue` storage per run.

- Successful run with no issues: `status=SUCCEEDED`, `errorsCount=0`, `errorSummary=null`
- Successful run with issues: `status=SUCCEEDED`, `errorSummary="Import completed with warnings."`
- Failed run: `status=FAILED`, run-level `UNEXPECTED_EXCEPTION` issue recorded

CSV export is per run id. Export separate CSV sets for each phase run id.

## Issue code conventions in split flow

`phase1` keeps foundation-oriented codes (for example `DOG_MISSING_REQUIRED_FIELDS`, `RELATION_*`, `OWNER_*`).

`phase2` and `phase3` use phase-specific event codes:

- trials:
  - `TRIAL_REGISTRATION_INVALID_FORMAT`
  - `TRIAL_EVENT_MISSING_REQUIRED_FIELDS`
- shows:
  - `SHOW_REGISTRATION_INVALID_FORMAT`
  - `SHOW_EVENT_MISSING_REQUIRED_FIELDS`

## Idempotency

All three phases are duplicate-safe on re-run using stable lookup/upsert keys in current schema paths.

## Implementation references

- Server phase use-cases:
  - `packages/server/imports/phase1/run-legacy-phase1.ts`
  - `packages/server/imports/phase2/run-legacy-phase2.ts`
  - `packages/server/imports/phase3/run-legacy-phase3.ts`
- Shared import run API:
  - `packages/server/imports/runs/service.ts`
- Shared helpers:
  - `packages/server/imports/internal/*`
  - `packages/server/imports/core/*`
- Legacy source fetch:
  - `packages/db/imports/phase1/source.ts`
  - `packages/db/imports/phase2/source.ts`
  - `packages/db/imports/phase3/source.ts`
- Script entrypoints:
  - `packages/server/scripts/imports/phase1/run.ts`
  - `packages/server/scripts/imports/phase2/run.ts`
  - `packages/server/scripts/imports/phase3/run.ts`
  - `packages/server/scripts/imports/bootstrap/run.ts`
