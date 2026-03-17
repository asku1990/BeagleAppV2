# Legacy Import Flow (Phases 1-3)

This document describes the current initial legacy-to-canonical migration flow after split-phase cutover.

## Document scope

- This file is the high-level flow overview (order, responsibilities, and shared run/issue model).
- Detailed phase rules and implementation notes are maintained in phase-specific docs.

Phase-specific docs:

- `docs/legacy-import/phase1.md`
- `docs/legacy-import/phase2.md`
- `docs/legacy-import/phase3.md`

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
- CSV export output (current behavior):
  - per-code files: `<ISSUE_CODE>.csv`
  - index file: `index.csv`
  - grouped stage summary: `stage-reasons.csv`

## Phase responsibilities

1. `phase1` imports only foundation data:

- dogs
- registrations
- breeders
- aliases (`samakoira`)
- relations (sire/dam links)
- owners and ownerships

2. `phase2` imports trial rows using current trial schema.

3. `phase3` imports show rows into canonical show tables (`ShowEvent`, `ShowEntry`,
   `ShowResultItem`) using merged legacy sources (`nay9599`, `beanay`, optional
   `nay9599_rd_ud`) plus `beanay_text` critique join.

4. `seed:show-result-definitions` upserts canonical `ShowResultDefinition` rows used by both
   legacy and Kennelliitto workbook mappings (for example `ROP`, `VSP`, `SERT`, `VARASERT`,
   `CACIB`, `VARACACIB`, `PUPN`, `SIJOITUS`, `JUN_ROP`, `JUN_VSP`, `VET_ROP`, `VET_VSP`, `SA`, `KP`).

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

## Issue code scope

Issue code details are maintained in phase docs:

- `docs/legacy-import/phase1.md`
- `docs/legacy-import/phase2.md`
- `docs/legacy-import/phase3.md`

## Execution model

This import flow is intended for initial migration, run in order (`phase1` -> `phase2` -> `phase3`).
Treat it as one-time migration flow, not as an ongoing sync pipeline.

## Implementation references

Code-level implementation references are maintained in phase-specific docs.
