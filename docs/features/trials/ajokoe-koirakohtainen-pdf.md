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
