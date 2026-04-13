# AJOK-suunnitelma

## Päätetyt linjaukset

- Legacy-data importataan vain kerran.
- Uusi data tulee vain API:n kautta.
- Legacy-import ja API-kirjoitus ovat eri prosesseja ja eri koodipolkuja.
- Uuden skeeman totuus on AJOK-koirakohtainen pöytäkirja.
- `yksi_tulos.txt` on tekninen kuljetusmuoto, ei skeemamäärittelyn ensisijainen lähde.
- API:ssa sama tulos päivitetään avaimella `sklKoeId + rekisterinumero`.
- `dogId` voi olla `null`.
- `rekisterinumeroSnapshot` on pakollinen.
- Lisätiedot 11-61 tallennetaan rakenteisesti.
- Koko saapuva payload tallennetaan myös `raakadataJson`-kenttään.

## Tietomalli

- `TrialEvent` = kokeen yhteiset tiedot
- `TrialEntry` = yhden koiran tulos yhdessä kokeessa
- `TrialLisatietoItem` = lisätiedot 11-61

## Uusi skeema (pöytäkirjan mukainen)

### `TrialEvent`

- `id`
- `sklKoeId` (uniikki)
- `koepaiva`
- `koekunta`
- `jarjestaja`
- `kennelpiiri`
- `kennelpiirinro`
- `rotukoodi`
- `koemuoto`

### `TrialEntry`

- `id`
- `trialEventId` (FK `TrialEvent`)
- `dogId` (FK `Dog`, voi olla `null`)
- `rekisterinumeroSnapshot` (pakollinen)
- `luokka` (koirakohtainen)
- `yksilointiAvain` (tekninen uniikki avain)
- `lahde` (`LEGACY_AKOEALL` / `KOIRATIETOKANTA_API`)

Koiran tiedot:

- `koiranNimiSnapshot`
- `isanNimiSnapshot`
- `isanRekisterinumeroSnapshot`
- `emanNimiSnapshot`
- `emanRekisterinumeroSnapshot`
- `omistajaSnapshot`
- `omistajanKotikuntaSnapshot`

Erä- ja aikatiedot:

- `era1Alkoi`
- `era2Alkoi`
- `hakuMin1`
- `hakuMin2`
- `ajoMin1`
- `ajoMin2`
- `hyvaksytytAjominuutit`

Pisteet ja tulos:

- `ajoajanPisteet`
- `hakuEra1`
- `hakuEra2`
- `hakuKeskiarvo`
- `haukkuEra1`
- `haukkuEra2`
- `haukkuKeskiarvo`
- `ajotaitoEra1`
- `ajotaitoEra2`
- `ajotaitoKeskiarvo`
- `yleisvaikutelmaPisteet`
- `hakuloysyysTappioEra1`
- `hakuloysyysTappioEra2`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioEra1`
- `ajoloysyysTappioEra2`
- `ajoloysyysTappioYhteensa`
- `tieJaEstetyoskentelyPisteet`
- `metsastysintoPisteet` (legacy `PIN`)
- `ansiopisteetYhteensa`
- `tappiopisteetYhteensa`
- `loppupisteet`
- `palkinto`
- `sijoitus`
- `koiriaLuokassa`

Olosuhteet ja huomautukset:

- `keli`
- `paljasMaa`
- `lumikeli`
- `luopui`
- `suljettu`
- `keskeytetty`
- `huomautusTeksti`
- `notes`

Tuomarit:

- `ryhmatuomariNimi`
- `palkintotuomariNimi`
- `ylituomariNimi`
- `ylituomariNumero`

Tekninen säilytys:

- `raakadataJson`

### `TrialLisatietoItem`

- `id`
- `trialEntryId` (FK `TrialEntry`)
- `koodi` (11-61)
- `nimi`
- `era1Arvo`
- `era2Arvo`

Uniikki:

- `trialEntryId + koodi`

Kommentti:

- Eräkohtaiset lisätiedot (esim. koodi 52) luetaan lisätietokentistä (esim. `521_*`, `522_*`).
- Jos jollain rivillä arvo puuttuu, kenttä jää `null` eikä sitä päätellä väkisin.

## API-minimikentät

- `sklKoeId`
- `koepaiva`
- `koekunta`
- `rekisterinumero`

## API-reitti

- Suositus integraatiolle: `POST /api/integraatiot/koiratietokanta/koetulokset/upsert`
- Vaihtoehto (lyhyt): `POST /api/trials/results/upsert`

## API-tapa ja payload

- HTTP-metodi: `POST`
- Sisältötyyppi: `application/json`
- Lähettäjä voi lähettää nykyisen `yksi_tulos`-rakenteen.
- Meidän puolella mapataan siitä vain pöytäkirjan aktiiviset kentät uuteen skeemaan.
- Muut mukana tulevat yhteensopivuus-/legacy-kentät säilytetään vain `raakadataJson`-kentässä.

## Legacy-import (kertamigraatio)

- Legacy on kertamigraatio.
- Legacylle ei tehdä fallback-upsert-logiikkaa.
- Legacy-riveille annetaan tekninen import-avain.

### `akoeall` -> uusi malli (vain suorat vastineet)

Nykyinen `akoeall` sisältää 20 saraketta:
`REKNO, TAPPA, TAPPV, KENNELPIIRI, KENNELPIIRINRO, KE, LK, PA, PISTE, SIJA, HAKU, HAUK, YVA, HLO, ALO, TJA, PIN, TUOM1, MUOKATTU, VARA`.

Suorat vastineet:

- `REKNO` -> `TrialEntry.rekisterinumeroSnapshot`
- `TAPPA` -> `TrialEvent.koekunta`
- `TAPPV` -> `TrialEvent.koepaiva`
- `KENNELPIIRI` -> `TrialEvent.kennelpiiri`
- `KENNELPIIRINRO` -> `TrialEvent.kennelpiirinro`
- `KE` -> `TrialEntry.keli`
- `LK` -> `TrialEntry.luokka`
- `PA` -> `TrialEntry.palkinto`
- `PISTE` -> `TrialEntry.loppupisteet`
- `SIJA` -> `TrialEntry.sijoitus`
- `HAKU` -> `TrialEntry.hakuKeskiarvo`
- `HAUK` -> `TrialEntry.haukkuKeskiarvo`
- `YVA` -> `TrialEntry.yleisvaikutelmaPisteet`
- `HLO` -> `TrialEntry.hakuloysyysTappioYhteensa`
- `ALO` -> `TrialEntry.ajoloysyysTappioYhteensa`
- `TJA` -> `TrialEntry.tieJaEstetyoskentelyPisteet`
- `PIN` -> `TrialEntry.metsastysintoPisteet`
- `TUOM1` -> `TrialEntry.ylituomariNimi`
- `VARA` -> `TrialEntry.notes` (`L` = Luopui, `S` = Suljettu, `K` = Keskeytetty)

Vain raw-säilytys:

- `MUOKATTU`

Puuttuvat legacyssä (jäävät tyhjäksi):

- `sklKoeId`
- lisätiedot 11-61
- useat eräkohtaiset pöytäkirjakentät

## Toteutusjärjestys

1. Lisää uudet Prisma-mallit
2. Toteuta API upsert `sklKoeId + rekisterinumero` -avaimella
3. Tallenna lisätiedot 11-61 omiin riveihin
4. Säilytä koko payload `raakadataJson`-kentässä
5. Tee legacy-import uuteen malliin (kertamigraatio)
