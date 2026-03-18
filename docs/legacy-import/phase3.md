# Legacy Import Phase 3

## Purpose

This is the detailed implementation reference for phase3.
For overall flow and ordering, see `docs/legacy-import/import-flow.md`.

Phase 3 imports show rows into canonical show tables.
Phase 3 belongs to the initial canonical migration flow.

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

If multiple rows still collide on the same merge key with equal source priority,
phase3 uses a deterministic payload-based tie-break (normalized result/height/judge/legacy flag/dog name/source table)
so row selection does not depend on database return order.

## Main writes

- `ShowEvent`
- `ShowEntry`
- `ShowResultItem`

Additional behavior:

- `dogId` is nullable (entries can be imported without matched dog).
- Uses shared show-result normalization logic (`normalizeShowResult`) for legacy `TULNI` conversion.
- Stores raw + normalized result context in provenance payload fields.
- `ShowEvent` provenance fields (`sourceTag`, `sourceTable`, `sourceRef`, `rawPayloadJson`) are set on create and not overwritten per entry-row updates.

## Execution assumption

Phase3 is intended for initial canonical migration flow, not ongoing sync usage.
It is explicitly one-shot and non-rerunnable by design.

Runtime guard:

- phase3 fails fast with `LEGACY_PHASE3_ONE_SHOT_ONLY` when canonical show
  tables (`ShowEvent`, `ShowEntry`, `ShowResultItem`) are not empty

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
  - `SERT`, `varaSERT`
  - `CACIB`, `varaCACIB`
  - `NORD-SERT`, `NORD-varaSERT`
  - `JUN-SERT`, `VET-SERT`
  - `CACIB-J`, `CACIB-V`
  - `JUN-ROP`, `JUN-VSP`, `VET-ROP`, `VET-VSP`
  - `MVA`, `JMVA`, `VMVA`

Alias -> canonical:

- `VASERT`, `VSERT` -> `varaSERT`
- `VACACIB`, `VCACIB`, `VACA` -> `varaCACIB`
- `NORDVSERT` -> `NORD-varaSERT`
- `NORDSERT` -> `NORD-SERT`
- `JUNSERT`, `JUNS`, `JUNSER`, `JUNSE`, `JSERT` -> `JUN-SERT`
- `KUMA` -> `KP`
- `VETSERT` -> `VET-SERT`
- `JMV` -> `JMVA`
- `JUNROP`, `JROP` -> `JUN-ROP`
- `JUNVSP`, `JVSP` -> `JUN-VSP`
- `VETROP`, `ROPVET`, `VROP` -> `VET-ROP`
- `VETVSP`, `VSPVET`, `VVSP` -> `VET-VSP`
- `CACIBV` -> `CACIB-V`
- `CACIBJ`, `JCACIB` -> `CACIB-J`

Pattern mappings:

- `PU1`, `PU2`, `PN1`, ... -> definition `PUPN`, `valueCode=<token>`

- class + quality digit (legacy laatuarvostelu, not class placement):
  - examples: `JUN1`, `NUO2`, `AVO1`, `KÄY1`, `VAL1`, `VET1`
  - parsed only when `eventDate >= 2003-01-01`
  - produces class + quality items (for example `JUN` + `ERI`)
  - digit map: `1=ERI`, `2=EH`, `3=H`, `4=T`, `5=EVA`, `6=HYL`
  - for dates before `2003-01-01`, these tokens are not converted to modern
    quality flags; parser stores legacy numeric quality as
    `LEGACY-LAATUARVOSTELU(valueNumeric=<digit>)` and keeps class info

- class placement tokens (luokkasijoitus):
  - with `K`: `JUK1`, `NUK1`, `AVK1`, `KÄK1`, `VEK1`, `VAK1`, `VALK1`, `AVOK1`
  - without `K` (zero/no-placement marker): `JUN0`, `NUO0`, `AVO0`, `KÄY0`, `VET0`
  - produces class item + `SIJOITUS` item (`valueNumeric`)
  - `valueNumeric=0` means no class placement rank
  - never creates quality item through fallback from these tokens

- class aliases accepted for class mapping:
  - `JU` -> `JUN`
  - `AVK` -> `AVO`
  - `VEK` -> `VET`

- quality+placement:
  - `ERI1`, `EH2`, `H3`, `T4`, `EVA5`, `HYL6`
  - sets quality and writes `SIJOITUS` (`valueNumeric` from suffix)

Coverage rule:

- Any remaining unmapped show-row token creates `SHOW_RESULT_TOKEN_UNMAPPED`
  (stage `shows`).
- Missing definitions create `SHOW_RESULT_DEFINITION_NOT_FOUND` (stage `shows`).

## Definition review checklist

When reviewing parser output against enabled definitions:

- Seed/source of truth:
  - `packages/db/shows/seed-result-definitions.ts`
- Verify seed has been run:
  - `pnpm --filter @beagle/db seed:show-result-definitions`
- Parser-produced codes to verify especially:
  - class codes (`PEN`, `JUN`, `NUO`, `AVO`, `KÄY`, `VAL`, `VET`)
  - quality codes (`ERI`, `EH`, `H`, `T`, `EVA`, `HYL`)
  - structured values (`SIJOITUS`, `PUPN`)
  - legacy numeric quality (`LEGACY-LAATUARVOSTELU`) for pre-2003 class+digit rows

## Issue codes

- `SHOW_REGISTRATION_INVALID_FORMAT`
- `SHOW_EVENT_MISSING_REQUIRED_FIELDS`
- `SHOW_RESULT_TOKEN_UNMAPPED`
- `SHOW_RESULT_DEFINITION_NOT_FOUND`
- run-level fallback: `UNEXPECTED_EXCEPTION`

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE3`.
