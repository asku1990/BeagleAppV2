# Legacy Trial Mirror Validation

## Purpose

Trial mirror validation checks the frozen legacy AJOK mirror tables after
`import:phase2` and before any runtime trial projection is added.

It is read-only:

- does not connect to v1 MariaDB
- does not write `ImportRun` rows
- does not write `TrialEvent`, `TrialEntry`, or other runtime trial tables

## Command

```bash
pnpm import:trials:validate-mirror
```

Export validation issues to CSV files:

```bash
pnpm import:trials:validate-mirror:csv
```

By default the CSV command writes to `tmp/trial-mirror-validation/`:

- `all-issues.csv`
- `index.csv`
- one file per issue code, for example `TRIAL_MIRROR_BEALT3_WITHOUT_AKOEALL.csv`

Optional filters:

```bash
pnpm import:trials:validate-mirror:csv -- --code TRIAL_MIRROR_BEALT3_WITHOUT_AKOEALL
pnpm import:trials:validate-mirror:csv -- --severity WARNING
pnpm import:trials:validate-mirror:csv -- --out tmp/my-trial-validation-export
```

## Source tables

The command reads only the app database mirror tables:

- `legacy_akoeall`
- `legacy_bealt`
- `legacy_bealt0`
- `legacy_bealt1`
- `legacy_bealt2`
- `legacy_bealt3`

## Checks

The validation report includes:

- row counts per mirror table
- detail rows with matching `akoeall`
- `akoeall` rows without detail rows
- detail rows stored in a `bealt*` table outside the v1 date-selected rule table
- blank key parts
- invalid `TAPPV` dates
- invalid registration number shape
- malformed `MUOKATTU` values, except legacy zero-date values
- missing or malformed `sourceHash`
- invalid `rawPayloadJson`
- broad score range warnings
- detail rows without matching `akoeall`, reported with table-specific codes
- suspicious `ERA` values

Parent/detail relationship issues are intentionally split by source table, for
example `TRIAL_MIRROR_BEALT0_WITHOUT_AKOEALL` and
`TRIAL_MIRROR_BEALT3_WITHOUT_AKOEALL`, so each rule table can be reviewed or
fixed independently.

V1 selects the visible detail table by `TAPPV`:

- before `20020801`: `bealt0`
- after `20020801` and before `20050801`: `bealt1`
- after `20050801` and before `20110801`: `bealt2`
- after `20110801`: `bealt3`

Rows in other `bealt*` tables are reported as informational source shape
issues instead of hard errors, because v1 keeps the rule tables separate and
selects the active one by date.

## Severity

- `ERROR`: projection would likely misjoin, lose, or corrupt rows
- `WARNING`: projection may continue later, but the row needs review or special handling
- `INFO`: useful source statistics that do not block projection

The command exits with a non-zero code when any `ERROR` issue exists.

## Implementation References

- DB read adapter: `packages/db/imports/trial-mirror-validation/repository.ts`
- Validation rules: `packages/server/imports/trial-mirror-validation/validate-trial-mirror.ts`
- Report formatting: `packages/server/imports/trial-mirror-validation/report.ts`
- Script: `packages/server/scripts/imports/trial-mirror-validation/run.ts`
