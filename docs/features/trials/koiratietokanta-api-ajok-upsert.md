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
  - `TrialEra`
  - `TrialEraLisatieto`

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
- `yt` -> `TrialEvent.ylituomariNimi`
- `ytnro` -> `TrialEvent.ylituomariNumero`
- `YTkertomus` -> `TrialEvent.ytKertomus`

`TrialEvent` does not store `koemuoto`; the entry-level `koemuoto` value is the
canonical source for AJOK result rows. Mixed entry-level `koemuoto` values
inside one event are allowed.

### `TrialEntry`

- `REKISTERINUMERO` -> `TrialEntry.rekisterinumeroSnapshot`
- `SKLkoemuoto` -> `TrialEntry.koemuoto`
- `LUOKKA` -> `TrialEntry.luokka`
- `Omistaja` -> `TrialEntry.omistajaSnapshot`
- `Omistajankotipaikka` -> `TrialEntry.omistajanKotikuntaSnapshot`
- `I_ERA_KLO` / `II_ERA_KLO` / `III_ERA_KLO` / `IV_ERA_KLO` -> `era1Alkoi` .. `era4Alkoi`
- `i_haku_min` / `II_HAKU_MIN` / `III_HAKU_MIN` / `IV_HAKU_MIN` -> `hakuMin1` .. `hakuMin4`
- `I_AJO_MIN` / `II_AJO_MIN` / `III_AJO_MIN` / `IV_AJO_MIN` -> `ajoMin1` .. `ajoMin4`
- `HYV_AJOT_MIN` -> `TrialEntry.hyvaksytytAjominuutit`
- `AJOPISTEET` -> `TrialEntry.ajoajanPisteet`
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
- `koekaudenkoe` -> `koetyyppi=KOKOKAUDENKOE`
- `pitkakoe` -> `koetyyppi=PITKAKOE`
- otherwise -> `koetyyppi=NORMAL`
- `KELI` -> compatibility input `keli`, persisted to `TrialEntry.ke`
- `luopui=true` -> `TrialEntry.huomautus = LUOPUI`
- `suljettu=true` -> `TrialEntry.huomautus = SULJETTU`
- `keskeytti=true` -> `TrialEntry.huomautus = KESKEYTETTY`
- `HUOMAUTUS` + plain `VIITE` -> `TrialEntry.huomautusTeksti`
- `I_VIITE`, `II_VIITE`, `III_VIITE`, `IV_VIITE` ->
  `TrialEra.huomautusTeksti` for the matching era
- `palkintotuomari1` -> `ryhmatuomariNimi`
- `palkintotuomari2` -> `palkintotuomariNimi`
- `yt` / `ytnro` are also copied into `ylituomariNimiSnapshot` /
  `ylituomariNumeroSnapshot`

### Placement semantics

- `TrialEntry.sija` stores the normalized placement token/value.
- `TrialEntry.koiriaLuokassa` stores the class-size column.
- `TrialEntry.koetyyppi` stores the result-row mode:
  - `NORMAL`
  - `KOKOKAUDENKOE`
  - `PITKAKOE`
- The API rejects payloads where both `koekaudenkoe` and `pitkakoe` are true.
- The API rejects payloads where more than one of `luopui`, `suljettu`, and
  `keskeytti` is true because `TrialEntry.huomautus` stores one canonical
  marker.
- PDF huomautukset are assembled from entry-level `huomautusTeksti` and the
  per-era `TrialEra.huomautusTeksti` values.

### Compatibility columns

- Top-level weather value is written to `TrialEntry.ke` from `KELI`.
- The numbered source rows below are stored as `TrialEraLisatieto` instead.

## Lisätieto mapping

- `TrialEraLisatieto` rows are currently created for the mapped codes listed
  below.
- The first number is the official pöytäkirja lisätieto code.
- The `yksi_tulos` source key prefix may be different from the official code;
  for example, official code `36` is carried in raw keys `531_*` / `532_*` /
  `533_*` in the sample payload.
- Each lisätieto row stores `koodi`, `osa`, `nimi`, `era1Arvo` .. `era4Arvo`,
  and `jarjestys`.
- `osa` is empty for normal one-value rows. Codes `25` and `27` use separate
  `a`, `b`, and `c` subpart rows because the source payload has multiple values
  for the same official code and era.
- Rows are idempotent per `TrialEra + koodi + osa`; existing era/lisätieto rows
  are replaced on each upsert.

### Olosuhteet and detailed rows

- `P10A*` -> official code `10` (`Vaativat olosuhteet`)
- `11_*` -> official code `11` (`Paljas maa`)
- `12_*` -> official code `12` (`Lumikeli`)
- `13_*` -> official code `13` (`Kohtalainen tai kova tuuli`)
- `14_*` -> official code `14` (`Kuiva keli`)
- `15_*` -> official code `15` (`Kostea keli`)
- `16_*` -> official code `16` (`Kohtalainen tai kova sade`)
- `17_*` -> official code `17` (`Lämpötila`)
- `18_*` -> official code `18` (`Maasto`)
- `P19A*` -> official code `19` (`Lumipeitteen laatu`)

Additional groups follow the same numbered source-to-lisatieto pattern for
currently mapped codes `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `30`,
`31`, `32`, `33`, `34`, `35`, `36`, `37`, `40`, `41`, `42`, `50`, `51`, `52`,
`53`, `54`, `55`, `56`, `57`, `58`, `59`, `60`, `61`, and `62`.

### P-coded official rows

- `P23A*` -> official code `23` (`Hakukuvio`)
- `P24A*` -> official code `24` (`Suurin etäisyys`)
- `P25A*a` / `P25A*b` / `P25A*c` -> official code `25` (`Yöjälki löytyi`)
  with `osa` values `a`, `b`, and `c`
- `P26A*` -> official code `26` (`Eteneminen yöjäljellä`)
- `P27A*a` / `P27A*b` / `P27A*c` -> official code `27`
  (`Aika yöjäljellä`) with `osa` values `a`, `b`, and `c`
- `P37A*` -> official code `37` (`Todettu kuuluvuus`)
- `P57A*` -> official code `57` (`Tie ja esteajoa`)
- `P58A*` -> official code `58` (`Todellinen ajoaika`)
- `P59A*` -> official code `59` (`Hukkatyöskentely`)
- `P62A*` -> official code `62` (`Matka ajoerässä`)

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
