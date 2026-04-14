# AJOK Flow Gate Contract

Versioned source of truth for the BEJ-78 flow gate that locks the future
poytakirja field contract before BEJ-79 schema work.

## Contract version

- Version: `v2026-04-14`
- Source tickets: `BEJ-75`, `BEJ-76`, `BEJ-77`, `BEJ-78`
- Machine-readable source: `apps/web/lib/admin/trials/manage/trial-field-contract.ts`

## Field decision table

Status meanings:

- `typed-now`: field is represented by current `AdminTrialDetails` typed read model.
- `raw-only`: field is not typed today but can be preserved from source payload when raw exists.
- `missing`: field is not available in typed read model and not locked as raw-only for read-path parity.

| Group      | Target field              | Status    | Current typed source | Follow-up |
| ---------- | ------------------------- | --------- | -------------------- | --------- |
| event      | sklKoeId                  | raw-only  | -                    | BEJ-79    |
| event      | rotukoodi                 | raw-only  | -                    | BEJ-79    |
| event      | kennelpiiri               | typed-now | kennelDistrict       | -         |
| event      | kennelpiirinro            | typed-now | kennelDistrictNo     | -         |
| event      | koekunta                  | typed-now | eventPlace           | -         |
| event      | koepaiva                  | typed-now | eventDate            | -         |
| event      | jarjestaja                | raw-only  | -                    | BEJ-79    |
| event      | koemuoto                  | raw-only  | -                    | BEJ-79    |
| dog        | koiranNimi                | typed-now | dogName              | -         |
| dog        | rekisterinumero           | typed-now | registrationNo       | -         |
| dog        | isanNimi                  | missing   | -                    | BEJ-79    |
| dog        | isanRekisterinumero       | missing   | -                    | BEJ-79    |
| dog        | emanNimi                  | missing   | -                    | BEJ-79    |
| dog        | emanRekisterinumero       | missing   | -                    | BEJ-79    |
| dog        | omistaja                  | missing   | -                    | BEJ-79    |
| dog        | omistajanKotikunta        | missing   | -                    | BEJ-79    |
| dog        | sukupuoli                 | missing   | -                    | BEJ-79    |
| dog        | rokotusOk                 | missing   | -                    | BEJ-82    |
| dog        | tunnistusOk               | missing   | -                    | BEJ-82    |
| result     | era1Alkoi                 | missing   | -                    | BEJ-79    |
| result     | era2Alkoi                 | missing   | -                    | BEJ-79    |
| result     | hakuMin1                  | missing   | -                    | BEJ-79    |
| result     | hakuMin2                  | missing   | -                    | BEJ-79    |
| result     | ajoMin1                   | missing   | -                    | BEJ-79    |
| result     | ajoMin2                   | missing   | -                    | BEJ-79    |
| result     | hyvaksytytAjominuutit     | missing   | -                    | BEJ-79    |
| result     | ajoajanPisteet            | missing   | -                    | BEJ-79    |
| result     | hakuKeskiarvo             | typed-now | haku                 | -         |
| result     | haukkuKeskiarvo           | typed-now | hauk                 | -         |
| result     | ajotaitoKeskiarvo         | missing   | -                    | BEJ-79    |
| result     | ansiopisteetYhteensa      | typed-now | piste                | -         |
| result     | hakuloysyysTappioYhteensa | typed-now | hlo                  | -         |
| result     | ajoloysyysTappioYhteensa  | typed-now | alo                  | -         |
| result     | tappiopisteetYhteensa     | missing   | -                    | BEJ-79    |
| result     | loppupisteet              | typed-now | piste                | -         |
| result     | palkinto                  | typed-now | pa                   | -         |
| result     | sijoitus                  | typed-now | sija                 | -         |
| result     | koiriaLuokassa            | missing   | -                    | BEJ-79    |
| conditions | keli                      | typed-now | ke                   | -         |
| conditions | paljasMaa                 | missing   | -                    | BEJ-82    |
| conditions | lumikeli                  | missing   | -                    | BEJ-82    |
| status     | luopui                    | missing   | -                    | BEJ-79    |
| status     | suljettu                  | missing   | -                    | BEJ-79    |
| status     | keskeytetty               | missing   | -                    | BEJ-79    |
| status     | huomautusTeksti           | missing   | -                    | BEJ-79    |
| additional | lisatiedotJson            | raw-only  | -                    | BEJ-80    |
| judges     | ryhmatuomariNimi          | typed-now | judge                | -         |
| judges     | palkintotuomariNimi       | raw-only  | -                    | BEJ-79    |
| judges     | ylituomariNimi            | raw-only  | -                    | BEJ-79    |
| judges     | ylituomariNumero          | raw-only  | -                    | BEJ-79    |

## Minimum contract before UI read switch

The pre-switch gate for moving admin/public read paths from `TrialResult` to the
new AJOK schema is the minimum required set below. The gate passes only when all
required fields are `typed-now`.

Required fields:

- `koepaiva`
- `koekunta`
- `koiranNimi`
- `rekisterinumero`
- `loppupisteet`
- `palkinto`
- `sijoitus`
- `hakuKeskiarvo`
- `haukkuKeskiarvo`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioYhteensa`
- `keli`
- `ryhmatuomariNimi`

Machine gate implementation: `apps/web/lib/admin/trials/manage/trial-flow-gate.ts`

## Mapping notes from BEJ-75/76/77

- BEJ-75 confirmed list-level parity requirements are currently met by typed
  `TrialResult` read fields for dog, event date/place, and result summary.
- BEJ-76 confirmed detail-level read-only rendering and raw payload visibility
  behavior, with no schema or write-path change.
- BEJ-77 established the AJOK gap panel baseline and validated which fields are
  currently typed vs not represented in the read model.
- This contract locks that baseline for BEJ-79/80/82 so schema/import/read-switch
  work can track explicit per-field status without re-deciding the matrix.
