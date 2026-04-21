# Koiratietokanta API AJOK upsert

This document is the source of truth for the BEJ-84 Koiratietokanta AJOK
result upsert contract.

## Scope

- Route: `POST /api/integraatiot/koiratietokanta/koetulokset/upsert`
- Purpose: accept one `yksi_tulos` payload at a time and write the canonical
  AJOK trial event + entry + lisätieto rows.
- Storage model:
  - `TrialEvent`
  - `TrialEntry`
  - `TrialLisatietoItem`

## Auth

- The route requires `Authorization: Bearer <secret>`.
- The secret comes from `KOIRATIETOKANTA_RESULTS_API_SECRET`.
- Missing secret -> `500 CONFIGURATION_ERROR`
- Invalid bearer token -> `401 UNAUTHORIZED`

## Input contract

- Input is a single JSON object in the `yksi_tulos` transport shape.
- Required source fields:
  - `SKLid`
  - `REKISTERINUMERO`
  - `Koepvm`
  - `KOEPAIKKA`
- Unknown fields are ignored.
- The raw payload is always preserved in `TrialEntry.raakadataJson`.

## Main field mapping

### `TrialEvent`

- `SKLid` -> `TrialEvent.sklKoeId`
- `Koepvm` -> `TrialEvent.koepaiva`
- `KOEPAIKKA` -> `TrialEvent.koekunta`
- `JARJESTAJA` -> `TrialEvent.jarjestaja`
- `KENNELPIIRI` -> `TrialEvent.kennelpiiri`
- `KENNELPIIRINRO` / `SKLkennelpiiri` -> `TrialEvent.kennelpiirinro`
- `SKLkoemuoto` / `KOEMUOTO` -> `TrialEvent.koemuoto`
- `yt` -> `TrialEvent.ylituomariNimi`
- `ytnro` -> `TrialEvent.ylituomariNumero`
- `YTkertomus` -> `TrialEvent.ytKertomus`

### `TrialEntry`

- `REKISTERINUMERO` -> `TrialEntry.rekisterinumeroSnapshot`
- `LUOKKA` -> `TrialEntry.luokka`
- `Omistaja` -> `TrialEntry.omistajaSnapshot`
- `Omistajankotipaikka` -> `TrialEntry.omistajanKotikuntaSnapshot`
- `I_ERA_KLO` / `II_ERA_KLO` / `III_ERA_KLO` / `IV_ERA_KLO` -> `era1Alkoi` .. `era4Alkoi`
- `i_haku_min` / `II_HAKU_MIN` / `III_HAKU_MIN` / `IV_HAKU_MIN` -> `hakuMin1` .. `hakuMin4`
- `I_AJO_MIN` / `II_AJO_MIN` / `III_AJO_MIN` / `IV_AJO_MIN` -> `ajoMin1` .. `ajoMin4`
- `HYV_AJOT_MIN` -> `hyvaksytytAjominuutit`
- `AJOPISTEET` -> `ajoajanPisteet`
- `I_HAKU` / `II_HAKU` / `III_HAKU` / `IV_HAKU` -> `hakuEra1` .. `hakuEra4`
- `HAKUPISTEET` -> `hakuKeskiarvo`
- `I_HAUKKU` / `II_HAUKKU` / `III_HAUKKU` / `IV_HAUKKU` -> `haukkuEra1` .. `haukkuEra4`
- `HAUKKUPISTEET` -> `haukkuKeskiarvo`
- `I_AJOTAITO` / `II_AJOTAITO` / `III_AJOTAITO` / `IV_AJOTAITO` -> `ajotaitoEra1` .. `ajotaitoEra4`
- `AJOTAITOPISTEET` -> `ajotaitoKeskiarvo`
- `ANSIOPISTEET` -> `ansiopisteetYhteensa`
- `I_HAKULOYSYYS` / `II_HAKULOYSYYS` / `III_HAKULOYSYYS` / `IV_HAKULOYSYYS` -> `hakuloysyysTappioEra1` .. `hakuloysyysTappioEra4`
- `HAKULOYSYYSPISTEET` -> `hakuloysyysTappioYhteensa`
- `I_AJOLOYSYYS` / `II_AJOLOYSYYS` / `III_AJOLOYSYYS` / `IV_AJOLOYSYYS` -> `ajoloysyysTappioEra1` .. `ajoloysyysTappioEra4`
- `AJOLOYSYYSPISTEET` -> `ajoloysyysTappioYhteensa`
- `TAPPIOPISTEET` -> `tappiopisteetYhteensa`
- `LOPPUPISTEET` -> `loppupisteet`
- `PALKINTOSIJA` -> `palkinto` (stored as text; live values currently include
  `0`, `1`, `2`, `3`, `L`, `S`, and `-`)
- `SIJOITUS_LUOKASSA` -> `sijoitus`
- `KOIRIA_LUOKASSA` -> `koiriaLuokassa`
- `KELI` -> `keli`
- `luopui` -> `luopui`
- `suljettu` -> `suljettu`
- `keskeytti` -> `keskeytetty`
- `HUOMAUTUS` -> `huomautusTeksti`
- `palkintotuomari1` -> `ryhmatuomariNimi`
- `palkintotuomari2` -> `palkintotuomariNimi`
- `yt` / `ytnro` are also copied into `ylituomariNimiSnapshot` /
  `ylituomariNumeroSnapshot`

### Compatibility columns

- Top-level weather value is written to `TrialEntry.keli` from `KELI`.
- The numbered source rows below are stored as lisätieto instead.

## Lisätieto mapping

- `TrialLisatietoItem` rows are created for koodit `11-61`.
- The first number is the official pöytäkirja lisätieto code.
- The `yksi_tulos` source key prefix may be different from the official code;
  for example, official code `36` is carried in raw keys `531_*` / `532_*` /
  `533_*` in the sample payload.
- Each lisätieto row stores `koodi`, `nimi`, `era1Arvo` .. `era4Arvo`, and
  `jarjestys`.
- Rows are idempotent per `TrialEntry + koodi`; existing lisätieto rows are
  replaced on each upsert.

### Olosuhteet and detailed rows

- `11_*` -> official code `11` (`Paljas maa`)
- `12_*` -> official code `12` (`Lumikeli`)
- `13_*` -> official code `13` (`Kohtalainen tai kova tuuli`)
- `14_*` -> official code `14` (`Kuiva keli`)
- `15_*` -> official code `15` (`Kostea keli`)
- `16_*` -> official code `16` (`Kohtalainen tai kova sade`)
- `17_*` -> official code `17` (`Lämpötila`)
- `18_*` -> official code `18` (`Maasto`)

Additional groups follow the same numbered source-to-lisatieto pattern for
`20-61`.

## Validation and warnings

- Missing or invalid required fields return `400 VALIDATION_ERROR`.
- Optional malformed numeric fields are ignored and surfaced as warnings.
- If the local dog registration is missing, the row is still saved without
  `dogId` and a `DOG_NOT_FOUND` warning is returned.

## Response

- `201` when a new row is created
- `200` when an existing row is updated
- Response body includes:
  - `trialEventId`
  - `trialEntryId`
  - `created`
  - `updated`
  - `warnings[]`
