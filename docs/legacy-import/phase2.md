# Legacy Import Phase 2

## Purpose

This is the detailed implementation reference for phase2.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 2 imports legacy AJOK trial source rows into frozen mirror tables only.
It does not write `TrialEvent`, `TrialEntry`, `TrialLisatietoItem`, or other
runtime trial tables.

The mirror checkpoint is intentionally separate from runtime projection:

```text
v1 MariaDB -> legacy_* mirror tables -> later canonical runtime projection
```

## Command

`pnpm import:phase2 [USER_ID]`

## Source tables

- `akoeall`
- `bealt`
- `bealt0`
- `bealt1`
- `bealt2`
- `bealt3`

`MUOKATTU` is read as raw text with `CAST(MUOKATTU AS CHAR)`, so zero-date
values such as `0000-00-00 00:00:00` are preserved.

## Mirror writes

Phase 2 writes:

- `legacy_akoeall`
- `legacy_bealt`
- `legacy_bealt0`
- `legacy_bealt1`
- `legacy_bealt2`
- `legacy_bealt3`

Write rules:

- Upsert by the legacy composite key:
  - `akoeall`: `REKNO + TAPPA + TAPPV`
  - `bealt*`: `REKNO + TAPPA + TAPPV + ERA`
- Preserve v1 source columns through Prisma field mappings.
- Store the full source row snapshot in `rawPayloadJson`.
- Store `sourceHash` from the raw payload for later comparison.
- Do not normalize registrations, link dogs, group events, or calculate runtime fields.

`ImportRun.kind` is `LEGACY_TRIAL_MIRROR`. The total mirror rows written are
stored in `ImportRun.trialResultsUpserted` because the shared import run model
does not yet have a trial-mirror-specific counter.

## Validation

Phase 2 validates:

- source row count vs mirror table row count per table
- blank or invalid legacy primary-key parts
- zero-date `MUOKATTU` rows are counted and preserved

Count mismatch records `TRIAL_MIRROR_COUNT_MISMATCH` and marks the run failed.
Blank or invalid key parts record `TRIAL_MIRROR_MISSING_KEY_PART` as warnings.
Unexpected exceptions record `UNEXPECTED_EXCEPTION`.

## Implementation references

- Phase use-case: `packages/server/imports/phase2/run-legacy-phase2.ts`
- Source loader: `packages/db/imports/phase2/source.ts`
- DB persistence adapters: `packages/db/imports/phase2/repository.ts`

## Operational notes

- Phase 2 is safe to rerun against the same source; rows are upserted by legacy key.
- Run `pnpm import:trials:validate-mirror` after Phase 2 to inspect mirror
  integrity before runtime projection.
- Runtime trial projection is handled by Phase 5; Phase 2 only writes frozen
  mirror rows.
- Phase 2 belongs to the initial migration flow and is included in `import:bootstrap`.
