# AJOK koirakohtainen PDF

This document describes the code structure and data rules for the AJOK
dog-specific PDF generator.

PDF template:

- `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-koirakohtainen-poytakirja.pdf`

## Module layout

Main orchestrator:

- `apps/web/lib/server/trials/trial-dog-pdf.ts`

Internal helper blocks:

- `apps/web/lib/server/trials/internal/kokeen-tiedot.ts`
- `apps/web/lib/server/trials/internal/koiran-tiedot.ts`
- `apps/web/lib/server/trials/internal/koiran-tausta.ts`
- `apps/web/lib/server/trials/internal/ajoajan-pisteytys.ts`
- `apps/web/lib/server/trials/internal/ansiopisteet.ts`
- `apps/web/lib/server/trials/internal/tappiopisteet.ts`
- `apps/web/lib/server/trials/internal/loppupisteet.ts`

The orchestrator loads the template, embeds the font, and delegates each block
to the internal helpers. The helpers are intentionally internal and are not
re-exported as public APIs.

## Data flow

The PDF data path is:

1. `apps/web/app/api/trials/[trialId]/pdf/route.ts`
2. `packages/server/trials/pdf/get-trial-dog-pdf-data.ts`
3. `packages/db/trials/pdf/get-trial-dog-pdf-data.ts`
4. `apps/web/lib/server/trials/trial-dog-pdf.ts`

The API route passes normalized values into the server service.
The service returns the DTO that the web renderer consumes.

## Helper responsibilities

### 1) `kokeen-tiedot`

Renders the trial header block.

Input data:

- `kennelpiiri`
- `kennelpiirinro`
- `koekunta`
- `koemaasto` (entry-level maasto; may differ by dog row)
- `koepaiva`
- `jarjestaja`

### 2) `koiran-tiedot`

Renders the dog identity block.

Input data:

- `registrationNo`
- `dogName`
- `dogSex`

Rules:

- The dog registration number uses the primary registration number, meaning the
  first inserted registration number.
- The sex mark is written as `X` in the appropriate field for `MALE` or
  `FEMALE`.

### 3) `koiran-tausta`

Renders the background block.

Input data:

- `sireName`
- `sireRegistrationNo`
- `damName`
- `damRegistrationNo`
- `omistaja`
- `omistajanKotikunta`

Rules:

- Sire and dam names come from the dog relations.
- Sire and dam registration numbers use the same primary-registration rule as
  other dog-facing views unless the PDF spec says otherwise.
- Owner name and owner home municipality come from the `TrialEntry` snapshot
  fields.

### 4) `ajoajan-pisteytys`

Renders the first two era start times, the haku-minute values, the ajo-minute
values, and the accepted-minute / score values for the dog-specific PDF.

Input data:

- `era1Alkoi`
- `era2Alkoi`
- `hakuMin1`
- `hakuMin2`
- `ajoMin1`
- `ajoMin2`
- `hyvaksytytAjominuutit`
- `ajoajanPisteet`

Rules:

- `hyvaksytytAjominuutit` uses the stored `TrialEntry` value first; legacy rows
  without it derive the value from the sum of available `TrialEra.ajomin` values.
- `ajoajanPisteet` uses the stored `TrialEntry` value first; legacy rows without
  it derive the value with the v1 formula `round(70 / 240 * ajominuutit, 2)`.
- The current renderer places the two era-start values on the first line and
  the haku-minute values on the second line, the ajo-minute values on the
  third line, the accepted-minute / score values on the right side of the
  second line.
- Era start times are normalized to `HH:MM` before rendering.
- Haku-minute values are rendered as plain integers.
- Ajo-minute values are rendered as plain integers.
- Accepted-minute and score values are rendered as plain integers / decimals.
- Missing values render as `-`.

### 5) `ansiopisteet`

Renders the haku-era, haukku-era, and ajotaito-era values for the dog-specific
PDF.

Input data:

- `hakuEra1`
- `hakuEra2`
- `hakuKeskiarvo`
- `haukkuEra1`
- `haukkuEra2`
- `haukkuKeskiarvo`
- `ajotaitoEra1`
- `ajotaitoEra2`
- `ajotaitoKeskiarvo`
- `ansiopisteetYhteensa`

Rules:

- Haku-era values are rendered as plain integers.
- Haukku-era values are rendered as plain integers.
- Ajotaito-era values are rendered as plain integers.
- Missing values render as `-`.

### 6) `tappiopisteet`

Renders the hakuloysyys and ajoloysyys loss-point rows plus the total loss
points.

Input data:

- `hakuloysyysTappioEra1`
- `hakuloysyysTappioEra2`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioEra1`
- `ajoloysyysTappioEra2`
- `ajoloysyysTappioYhteensa`
- `tappiopisteetYhteensa`

Rules:

- The hakuloysyys values render on the first loss-point row.
- The ajoloysyys values render on the second loss-point row.
- The total loss-point value renders on the right side of the loss-point block.
- Missing values render as `-`.

### 7) `loppupisteet`

Renders the total points block and the status markers under `keli`.

Input data:

- `loppupisteet`
- `paljasMaaTaiLumi`
- `luopui`
- `suljettu`
- `keskeytetty`
- `koetyyppi` (`NORMAL` | `KOKOKAUDENKOE` | `PITKAKOE`)
- `sijoitus`
- `koiriaLuokassa`
- `Palkinto`

Rules:

- `paljasMaaTaiLumi` maps to `PALJAS_MAA` or `LUMI` markers, or nothing.
- `luopui`, `suljettu`, and `keskeytetty` are derived from
  `TrialEntry.huomautus` (`LUOPUI`, `SULJETTU`, `KESKEYTETTY`) and render as
  `X` markers when true.
- `koetyyppi=KOKOKAUDENKOE` renders `sijoitus` as `-` and `koiriaLuokassa` as `KK`.
- `koetyyppi=PITKAKOE` renders `sijoitus` as `-` and `koiriaLuokassa` as `PK`.
- `koetyyppi=NORMAL` renders the stored `sijoitus` and `koiriaLuokassa` values.
- Otherwise `sijoitus` renders under the status markers and `koiriaLuokassa`
  renders next to `sijoitus`.
- `Palkinto` continues to render in the lower-right payout field.

### 8) `huomautus`

Renders the free-text note in its own sized block.

Input data:

- `huomautusTeksti`

Rules:

- The note uses its own block dimensions so the width, height, and line
  wrapping can be tuned independently from the result block.
- Missing values render as nothing.

### 9) `lisätiedot` rows

Input data:

- `lisatiedotRows` (optional)

Rules:

- Each row contains `koodi`, `era1`, and `era2`.
- Current rendering uses `koodi = 11-18` in the `olosuhteet` block.
- Marker rows (`11`, `13`, `14`, `15`, `16`) render `1`/`X` as `X`.
- Numeric rows (`12`, `17`, `18`) render their raw number values.
- Current rendering also uses `koodi = 20-22` in the `haku` block.
- `20` renders as the raw value.
- `21` and `22` render with one decimal place.
- Current rendering also uses `koodi = 30-36` in the `haukku` block.
- `30-35` render with one decimal place.
- `36` renders as the raw value.
- Current rendering also uses `koodi = 40-42` in the `metsästysinto` block.
- All three rows render with one decimal place.
- Current rendering also uses `koodi = 50-56` in the `ajo` block.
- All seven rows render with one decimal place.
- Current rendering also uses `koodi = 60-61` in the `muut ominaisuudet` block.
- Both rows render with one decimal place.

## Registration rule

The PDF uses the primary registration number for the dog itself.
In this codebase, that means the first inserted registration number.

The same primary-registration rule is used for sire/dam display in the PDF so
the output matches the rest of the dog-facing UI.

## Notes

- This document intentionally does not list every visible PDF label.
- It focuses on code responsibilities, data sources, and selection rules.
- If the PDF layout changes, update the helper boundary section and the data
  rules here.
