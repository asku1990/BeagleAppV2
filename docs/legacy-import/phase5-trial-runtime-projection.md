# Legacy Import Phase 5 (Trial Runtime Projection Spec)

## Purpose

This is the decision-complete projection specification for legacy AJOK trial
mirror data. It defines how frozen mirror tables are projected into redesigned
runtime trial tables in later implementation phases.

Phase 5 is documentation-only:

- no schema migration
- no importer implementation
- no API/read-path rewiring
- no PDF/UI rewiring

For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

## Baseline Behavior

Projection compatibility baseline follows v1 event/PDF behavior, not v1 mixed
dog-history diagnostic views.

Canonical runtime behavior:

- use `legacy_akoeall` as the projection root
- pick one active detail rule table by `TAPPV` date rule
- ignore orphan detail rows and non-selected detail tables for runtime writes
- keep skipped rows visible in mirror validation CSV outputs

## Runtime Model (Target For Phase 5+)

- `TrialEvent`: event-level row
- `TrialEvent` stores the resolved `trialRuleWindowId` for the projected event
- `TrialEntry`: one dog summary row per event (from `legacy_akoeall`)
- `TrialEra`: one selected detail row per `trialEntryId + era`
- `TrialEraLisatieto`: one non-null `LTxx` value per `trialEraId + koodi`

Reader compatibility note:

- existing readers (including PDF/admin adapters) may pivot `TrialEra` rows to
  legacy-style `era1/era2/...` output shapes
- mixed all-table era diagnostics are not runtime canonical behavior

## Identity Contract

- `TrialEvent.legacyEventKey = LEGACY_AKOEALL|EVENT|<TAPPV>|<TAPPA>`
- `TrialEntry.yksilointiAvain = LEGACY_AKOEALL|ENTRY|<TAPPV>|<TAPPA>|<REKNO>`
- `TrialEra` unique key: `trialEntryId + era`
- `TrialEraLisatieto` unique key: `trialEraId + koodi`

## Detail Table Selection Rule

Select detail rows only from the v1 date-selected table:

- `TAPPV <= 20020731` -> `bealt0`
- `TAPPV >= 20020801 AND TAPPV <= 20050731` -> `bealt1`
- `TAPPV >= 20050801 AND TAPPV <= 20110731` -> `bealt2`
- `TAPPV >= 20110801` -> `bealt3`

Boundary-date policy:

- `20020801` selects `bealt1`
- `20050801` selects `bealt2`
- `20110801` selects `bealt3`
- no boundary gaps are left between windows

## Projection Rules

1. Start from every valid `legacy_akoeall` row.
2. Create/update `TrialEvent` by `legacyEventKey`.
3. Create/update `TrialEntry` by `yksilointiAvain`.
4. If selected detail rows exist, create/update `TrialEra` rows (`entry + era`).
5. For each selected detail row, write one `TrialEraLisatieto` per non-null
   `LTxx` value using `koodi=xx`.

Rows intentionally not projected to runtime:

- detail rows without matching `legacy_akoeall` parent (orphans)
- detail rows in non-selected rule tables for the row date

These remain mirror-validation concerns and are tracked by
`import:trials:validate-mirror` issue outputs.

## Field Mapping Decisions

Keep `legacy_akoeall` summary values on `TrialEntry`:

- `PA`, `PISTE`, `SIJA`, `HAKU`, `HAUK`, `YVA`, `HLO`, `ALO`, `TJA`, `PIN`
- plus core row fields (`REKNO`, `LK`, `KE`, `TUOM1`, `VARA`, etc.)

Map selected `bealt*` era fields to `TrialEra`:

- `ALKOI`, `HAKUMIN`, `AJOMIN`, `HAKU`, `HAUK`, `YVA`, `HLO`, `ALO`, `TJA`, `PIN`

Map selected `bealt*` LT values to `TrialEraLisatieto`:

- every non-null `LTxx` is preserved
- this includes legacy codes outside modern `11-61`

`koemuoto` policy:

- do not default to `"AJOK"` for legacy mirror projection
- store `koemuoto = null` unless explicitly provided by source

## Source Trace Policy

No new explicit source reference columns are required in this redesign step.
Source trace is preserved through raw payload storage:

- `TrialEntry.raakadataJson` keeps summary/root source context
- `TrialEra.raakadataJson` keeps selected detail source payload

## Test Scenarios (For Phase 5/6 Implementation)

- `akoeall + selected bealt` happy path:
  - event, entry, era, and era-lisatieto rows are created
- summary-only path:
  - `akoeall` row without selected details still creates `TrialEntry`
- orphan detail path:
  - no runtime rows created from orphan details
- non-selected detail path:
  - no runtime rows created from wrong-rule-table details
- boundary-date path:
  - exact threshold dates select the documented table start
- LT coverage path:
  - legacy `LTxx` outside modern `11-61` is preserved
- `koemuoto` path:
  - legacy-projected rows stay `koemuoto = null` when source omits it

## Assumptions

- v1 event/PDF behavior is the compatibility target for projection semantics
- v1 mixed all-table dog-history queries are diagnostic/history behavior, not
  canonical runtime projection behavior
- mirror tables remain frozen source-of-truth for validation and replayability
