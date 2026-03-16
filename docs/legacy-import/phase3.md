# Legacy Import Phase 3

## Purpose

Phase 3 imports show rows into canonical show tables.

## Command

`pnpm import:phase3 [USER_ID]`

## Source and merge behavior

Phase 3 builds canonical rows from:

- `nay9599`
- `beanay`
- optional `nay9599_rd_ud` (highest precedence when present)
- `beanay_text` (critique text join)

Merge identity is canonicalized from `(REKNO, TAPPV, TAPPA)`.

Precedence:

1. `nay9599_rd_ud`
2. `nay9599`
3. `beanay`

## Main writes

- `ShowEvent`
- `ShowEntry`
- `ShowResultItem`

Additional behavior:

- `dogId` is nullable (entries can be imported without matched dog).
- Uses shared show-result normalization logic (`normalizeShowResult`) for legacy `TULNI` conversion.
- Stores raw + normalized result context in provenance payload fields.

## Preflight requirement

Before writing canonical rows, phase3 runs source token coverage preflight:

- no unmapped `TULNI` tokens after normalization and alias mapping
- no parser-produced definition codes missing from enabled `ShowResultDefinition` rows

Default behavior:

- preflight writes issue rows and phase3 continues to write canonical rows.

Strict behavior (fail-fast):

- set `IMPORT_PHASE3_STRICT_SOURCE_COVERAGE=1` to fail run on coverage gaps.

Coverage issue code:

- `IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS`

Run seed first:

`pnpm --filter @beagle/db seed:show-result-definitions`

## TULNI token mapping (review list)

Source of truth in code:

- `packages/server/imports/internal/show-result-tokens.ts`
- `packages/server/imports/internal/show-result-parser.ts`

Token normalization before mapping:

- uppercasing
- separators normalized (`;`/`|` -> `,`, `.`/`+` -> space)
- surrounding punctuation stripped
- alias matching uses stripped token form (for example `V-CACIB` -> `VCACIB`)

Direct canonical tokens accepted as-is:

- classes: `PEN`, `JUN`, `NUO`, `AVO`, `KÄY`, `VAL`, `VET`
- quality: `ERI`, `EH`, `H`, `T`, `EVA`, `HYL`
- flags/awards:
  - `ROP`, `VSP`, `SA`, `KP`
  - `SERT`, `VARASERT`
  - `CACIB`, `VARACACIB`
  - `NORD_SERT`, `NORD_VARASERT`
  - `JUN_SERT`, `VET_SERT`
  - `CACIB_J`, `CACIB_V`
  - `JUN_ROP`, `JUN_VSP`, `VET_ROP`, `VET_VSP`
  - `MVA`, `JMVA`, `VMVA`

Alias -> canonical:

- `VASERT`, `VSERT` -> `VARASERT`
- `VACACIB`, `VCACIB`, `VACA` -> `VARACACIB`
- `NORDVSERT` -> `NORD_VARASERT`
- `NORDSERT` -> `NORD_SERT`
- `JUNSERT`, `JUNS`, `JUNSER`, `JUNSE`, `JSERT` -> `JUN_SERT`
- `KUMA` -> `KP`
- `VETSERT` -> `VET_SERT`
- `JMV` -> `JMVA`
- `JUNROP`, `JROP` -> `JUN_ROP`
- `JUNVSP`, `JVSP` -> `JUN_VSP`
- `VETROP`, `ROPVET`, `VROP` -> `VET_ROP`
- `VETVSP`, `VSPVET`, `VVSP` -> `VET_VSP`
- `CACIBV` -> `CACIB_V`
- `CACIBJ`, `JCACIB` -> `CACIB_J`

Pattern mappings:

- `PU1`, `PU2`, `PN1`, ... -> definition `PUPN`, `valueCode=<token>`
- legacy class+quality digit (`JUN1`, `NUO2`, `AVO1`, `KÄY1`, `VAL1`, `VET1`):
  - parsed only when `eventDate >= 2003-01-01`
  - produces class + quality items (for example `JUN` + `ERI`)
  - digit map: `1=ERI`, `2=EH`, `3=H`, `4=T`, `5=EVA`, `6=HYL`
  - for dates before `2003-01-01`, these tokens are not converted to modern
    quality flags; parser stores legacy numeric quality as
    `LAATU_NUMERO(valueNumeric=<digit>)` and keeps class info
- class placement with `K`:
  - `JUK1`, `NUK1`, `AVK1`, `KÄK1`, `VEK1`, `VAK1`, `VALK1`, `AVOK1`
  - produces class item + `SIJOITUS` item (`valueNumeric`)
  - never creates quality item through fallback from these tokens
- class aliases accepted for class mapping:
  - `JU` -> `JUN`
  - `AVK` -> `AVO`
  - `VEK` -> `VET`
- class placement without `K` (zero cases):
  - `JUN0`, `NUO0`, `AVO0`, `KÄY0`, `VET0`
  - produces class item + `SIJOITUS` item (`valueNumeric=0`)
- quality+placement:
  - `ERI1`, `EH2`, `H3`, `T4`, `EVA5`, `HYL6`
  - sets quality and writes `SIJOITUS` (`valueNumeric` from suffix)

Coverage rule:

- Any remaining unmapped token creates `IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS`.
- Preflight writes:
  - one aggregate issue (`IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS`)
  - per-token issue rows (`SHOW_RESULT_TOKEN_UNMAPPED`, stage `preflight-source`)
  - per-missing-definition issue rows (`SHOW_RESULT_DEFINITION_NOT_FOUND`, stage `preflight-source`)

## Issue codes

- `SHOW_REGISTRATION_INVALID_FORMAT`
- `SHOW_EVENT_MISSING_REQUIRED_FIELDS`
- `SHOW_RESULT_TOKEN_UNMAPPED`
- `SHOW_RESULT_DEFINITION_NOT_FOUND`
- `IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE3`.
