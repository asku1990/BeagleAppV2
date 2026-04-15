# Legacy Import Phase 2

## Purpose

This is the detailed implementation reference for phase2.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 2 imports trial rows from `akoeall` into canonical AJOK tables.

## Command

`pnpm import:phase2 [USER_ID]`

## Primary source table

- `akoeall`

## Source row mapping (high level)

`akoeall` rows are mapped into canonical `TrialEvent` + `TrialEntry` rows, including:

- identity and event fields:
  - `REKNO` -> registration key
  - `TAPPA` -> event place
  - `TAPPV` -> event date
- result payload fields:
  - class/award/rank/points fields (`LK`, `PA`, `SIJA`, `PISTE`)
  - trial metric fields (`HAKU`, `HAUK`, `YVA`, `HLO`, `ALO`, `TJA`, `PIN`)
  - judge and legacy flag (`TUOM1`, `VARA`)

The canonical AJOK entry stores the metric scores as:

- `YVA` -> `TrialEntry.yleisvaikutelmaPisteet`
- `TJA` -> `TrialEntry.tieJaEstetyoskentelyPisteet`
- `PIN` -> `TrialEntry.metsastysintoPisteet`

## Source row mapping (field-by-field)

This is the current phase2 write mapping for legacy `akoeall` rows.

### TrialEvent

| Legacy source field | Canonical target            | Note                                         |
| ------------------- | --------------------------- | -------------------------------------------- |
| `TAPPV`             | `TrialEvent.koepaiva`       | Event date                                   |
| `TAPPA`             | `TrialEvent.koekunta`       | Event place                                  |
| `KENNELPIIRI`       | `TrialEvent.kennelpiiri`    | Kennel district                              |
| `KENNELPIIRINRO`    | `TrialEvent.kennelpiirinro` | Kennel district number                       |
| `TUOM1`             | `TrialEvent.ylituomariNimi` | First non-null judge wins when rows disagree |

### TrialEntry

| Legacy source field | Canonical target                                 | Note                                                        |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `REKNO`             | `TrialEntry.rekisterinumeroSnapshot`             | Registration number snapshot                                |
| `PA`                | `TrialEntry.palkinto`                            | Award / prize                                               |
| `SIJA`              | `TrialEntry.sijoitus`                            | Placement                                                   |
| `PISTE`             | `TrialEntry.loppupisteet`                        | Total points                                                |
| `HAKU`              | `TrialEntry.hakuKeskiarvo`                       | Haku score                                                  |
| `HAUK`              | `TrialEntry.haukkuKeskiarvo`                     | Haukku score                                                |
| `YVA`               | `TrialEntry.yleisvaikutelmaPisteet`              | General impression score                                    |
| `HLO`               | `TrialEntry.hakuloysyysTappioYhteensa`           | Haku löysyys penalty total                                  |
| `ALO`               | `TrialEntry.ajoloysyysTappioYhteensa`            | Ajo löysyys penalty total                                   |
| `TJA`               | `TrialEntry.tieJaEstetyoskentelyPisteet`         | Tie- ja estetyöskentely score                               |
| `PIN`               | `TrialEntry.metsastysintoPisteet`                | Metsästysinto score                                         |
| `KE`                | `TrialEntry.keli`                                | Weather / conditions                                        |
| `VARA`              | `TrialEntry.notes`                               | Raw legacy flag kept as note text                           |
| `VARA`              | `TrialEntry.luopui` / `suljettu` / `keskeytetty` | Parsed from the legacy flag letters                         |
| full row JSON       | `TrialEntry.raakadataJson`                       | Preserves the original source payload, including `MUOKATTU` |

## Main writes

- `TrialEvent`
- `TrialEntry`

Dog linkage is resolved through `DogRegistration` (`registrationNo -> dogId`).

## Linking and write rules

- Phase2 builds a registration-to-dog index before row processing.
- Each trial row uses that index to set `dogId` when possible (`dogId` may remain `null`).
- `TrialEvent` is upserted with deterministic `legacyEventKey` fallback when `sklKoeId` is unknown.
- `TrialEntry` is upserted by unique `(trialEventId, rekisterinumeroSnapshot)`.
- `raakadataJson` preserves the full legacy source row, including `MUOKATTU`.
- Invalid registration format or missing required event fields are written as issues.

## Idempotency and rerun behavior

- Canonical event writes are duplicate-safe by `sklKoeId` (when present) or `legacyEventKey` fallback.
- Canonical entry writes are duplicate-safe by `(trialEventId, rekisterinumeroSnapshot)`.
- Re-running phase2 updates/keeps existing canonical trial rows instead of creating duplicates.

## Issue codes

- `TRIAL_CANONICAL_REGISTRATION_INVALID_FORMAT`
- `TRIAL_CANONICAL_MISSING_REQUIRED_FIELDS`
- `TRIAL_CANONICAL_DOG_NOT_FOUND`
- `TRIAL_CANONICAL_JUDGE_CONFLICT`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE2`.

## Error handling detail

- Row-level validation issues are recorded and import continues.
- If a registration cannot be resolved to a local dog, phase2 keeps the trial
  row with `dogId = null` and records `TRIAL_CANONICAL_DOG_NOT_FOUND`.
- If the same event row yields multiple non-null judges, phase2 keeps the first
  judge value and records `TRIAL_CANONICAL_JUDGE_CONFLICT` as a warning.
- Run finishes `SUCCEEDED` with warnings when row issues exist.
- Unexpected exceptions mark run as `FAILED` with `UNEXPECTED_EXCEPTION`.

## Implementation references

- Phase use-case: `packages/server/imports/phase2/run-legacy-phase2.ts`
- Source loader: `packages/db/imports/phase2/source.ts`
- Canonical trial upsert logic: `packages/server/imports/internal/upsert-canonical-trial-rows.ts`
- Event identity key helper: `packages/server/imports/internal/trial-event-identity-key.ts`
- DB persistence adapters: `packages/db/imports/phase2/repository.ts`

## Operational notes

- Requires phase1 foundation data to maximize dog linking.
- Phase 2 belongs to the initial migration flow and is included in `import:bootstrap`.
