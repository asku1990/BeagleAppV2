# Legacy Import Flow (Phases 1, 1.5, 2, 3)

This document describes the current initial legacy-to-canonical migration flow after split-phase cutover.

## Document scope

- This file is the high-level flow overview (order, responsibilities, and shared run/issue model).
- Detailed phase rules and implementation notes are maintained in phase-specific docs.

Phase-specific docs:

- `docs/legacy-import/phase1.md`
- `docs/legacy-import/phase1.5.md`
- `docs/legacy-import/phase2.md`
- `docs/legacy-import/phase3.md`

## Commands

- Phase 1 (foundation only): `pnpm import:phase1`
- Phase 1.5 (dog titles): `pnpm import:phase1.5`
- Phase 2 (trials): `pnpm import:phase2`
- Phase 3 (shows): `pnpm import:phase3`
- Show result definition seed (canonical awards, one-shot flow): `pnpm --filter @beagle/db seed:show-result-definitions`
- Show workbook import schema seed (Kennelliitto workbook metadata, one-shot flow): `pnpm --filter @beagle/db seed:show-workbook-import-schema`
- Optional full bootstrap (`auth:bootstrap-admin` -> `seed:show-result-definitions` -> `seed:show-workbook-import-schema` -> `phase1` -> `phase1.5` -> `phase2` -> `phase3`): `pnpm import:bootstrap`

Optional actor id for phase commands:

- `pnpm import:phase1 <USER_ID>`
- `pnpm import:phase1.5 <USER_ID>`
- `pnpm import:phase2 <USER_ID>`
- `pnpm import:phase3 <USER_ID>`

Legacy source restore:

- Phase 1 reads the legacy source directly from `LEGACY_DATABASE_URL`; it does not consume a dump file itself.
- If you have a v1 SQL dump, restore it into MariaDB first, then point `LEGACY_DATABASE_URL` at that restored database.
- The original dump database name is `beagle`; the helper preserves that name unless you explicitly pass a different target database name.
- The helper script `pnpm legacy:restore <dump-file.sql> [database-name]` drops the target database if it exists, recreates it, and restores the dump into it.

Example restore flow for a dump that uses `beagle` as the legacy database name:

```bash
# Default dump file:
# /Users/akikuivas/personal-projects/beagle/beagle_db_v1_dumps/beagle.sql
pnpm legacy:restore
```

Then set:

```bash
LEGACY_DATABASE_URL=mariadb://root:<password>@127.0.0.1:3306/beagle?ssl=false
```

If you need to restore a different dump, pass its file path as the first argument. If you need to rename the database, pass the target database name as the second argument.

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

2. `phase1.5` imports dog title rows (`DogTitle`) from `bea_apu.VALIO`,
   grouped by dog via canonical registration resolution.
   Same-value aliases are deduplicated; conflicting alias values create import issues.

3. `phase2` imports trial rows using current trial schema.

4. `phase3` imports show rows into canonical show tables (`ShowEvent`, `ShowEntry`,
   `ShowResultItem`) using merged legacy sources (`nay9599`, `beanay`, optional
   `nay9599_rd_ud`) plus `beanay_text` critique join.
   The phase3 runtime path does not write legacy `ShowResult`.

5. `seed:show-result-definitions` bootstraps canonical `ShowResultDefinition` rows used by both
   legacy and Kennelliitto workbook mappings (for example `ROP`, `VSP`, `SERT`, `varaSERT`,
   `CACIB`, `varaCACIB`, `PUPN`, `SIJOITUS`, `JUN-ROP`, `JUN-VSP`, `VET-ROP`, `VET-VSP`, `SA`, `KP`).

6. `seed:show-workbook-import-schema` bootstraps `ShowWorkbookColumnRule` metadata used by the
   Kennelliitto workbook validator to resolve headers into imported, ignored, or blocked columns.
   This seed is the bootstrap baseline only; future admin-managed workbook
   schema edits should update the metadata directly instead of reseeding.

Lifecycle note:

- The entire legacy import flow is one-shot: `seed:show-result-definitions`,
  `seed:show-workbook-import-schema`, `phase1`, `phase1.5`, `phase2`, `phase3`, and
  `import:bootstrap` all belong to the same initial canonical
  bootstrap/migration.
- None of these commands are documented as upgrade, replay, or reconciliation steps for an
  already bootstrapped legacy-import environment.
- Public and admin production show reads/writes stay on canonical show tables; legacy
  `ShowResult` is not part of runtime production paths.

Bootstrap invariants:

- Legacy import is one-shot and assumes empty canonical show tables before run:
  - `showResultCategory`
  - `showResultDefinition`
  - `showEvent`
  - `showEntry`
  - `showResultItem`
- `seed:show-result-definitions` and `seed:show-workbook-import-schema` are part of that same
  one-shot bootstrap and are not ongoing migration/reconciliation steps.
- Backward compatibility with pre-existing legacy `showResultDefinition.code` variants is out of scope unless explicitly requested for a migration task.

`import:bootstrap` runs the full sequence in this order:

1. `auth:bootstrap-admin`
2. `seed:show-result-definitions`
3. `seed:show-workbook-import-schema`
4. `phase1`
5. `phase1.5`
6. `phase2`
7. `phase3`

## ImportRun and issues model

Each phase creates its own `ImportRun` with its own `runId`.

- `phase1` -> `kind=LEGACY_PHASE1`
- `phase1.5` -> `kind=LEGACY_PHASE1_5`
- `phase2` -> `kind=LEGACY_PHASE2`
- `phase3` -> `kind=LEGACY_PHASE3`

Issue rows are written to shared `ImportRunIssue` storage per run.

- Successful run: `status=SUCCEEDED`, `errorSummary` stores a phase-specific summary
  of the imported counters for that phase
- Failed run: `status=FAILED`, run-level `UNEXPECTED_EXCEPTION` issue recorded

CSV export is per run id. Export separate CSV sets for each phase run id.

## Issue code scope

Issue code details are maintained in phase docs:

- `docs/legacy-import/phase1.md`
- `docs/legacy-import/phase1.5.md`
- `docs/legacy-import/phase2.md`
- `docs/legacy-import/phase3.md`

## Execution model

This import flow is intended for initial migration, run in order
(`seed:show-result-definitions` -> `seed:show-workbook-import-schema` -> `phase1` -> `phase1.5` -> `phase2` -> `phase3`).
Treat it as a one-time bootstrap/migration flow, not as an ongoing sync,
replay, or upgrade pipeline.

## Implementation references

Code-level implementation references are maintained in phase-specific docs.
