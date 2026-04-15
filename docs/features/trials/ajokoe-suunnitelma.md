# AJOK-suunnitelma

## Lukitut päätökset (2026-04-14)

- `TrialEvent + TrialEntry` säilytetään (ei yhden taulun mallia).
- Lisätiedot toteutetaan heti täysin normalisoituna `TrialLisatietoItem`-tauluun.
- `lisatiedotJson`-välivaihetta ei tehdä.
- API:n sisääntulo säilyy `yksi_tulos`-muotoisena; kanoninen `event + entry + lisatiedot[]` on mapperin sisäinen kohdemalli.
- Upsert-avaimet:
  - event: `sklKoeId`
  - entry: `trialEventId + rekisterinumeroSnapshot`
- `raakadataJson` säilytetään myös tuotannossa audit/debug/replay-käyttöön.

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
- Järjestelmätimestampit ovat DB-omisteisia:
  - `createdAt` asetetaan vain luontihetkellä.
  - `updatedAt` päivittyy aina DB/Prisma-mekanismin kautta.
  - Kirjoituskoodit (BEJ-80/84) eivät saa asettaa `createdAt` tai `updatedAt`
    manuaalisesti create/update payloadiin.

## Tietomalli

- `TrialEvent` = kokeen yhteiset tiedot
- `TrialEntry` = yhden koiran tulos yhdessä kokeessa
- `TrialLisatietoItem` = lisätiedot 11-61

## Uusi skeema (pöytäkirjan mukainen)

### `TrialEvent`

- `id`
- `sklKoeId` (uniikki)
- `koepaiva` (`DateTime`, pakollinen)
- `koekunta` (`String`, pakollinen)
- `jarjestaja` (`String?`)
- `kennelpiiri` (`String?`)
- `kennelpiirinro` (`String?`)
- `rotukoodi` (`String?`)
- `koemuoto` (`String?`)
- `ylituomariNimi` (`String?`)
- `ylituomariNumero` (`String?`)

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
- `era3Alkoi`
- `era4Alkoi`
- `hakuMin1`
- `hakuMin2`
- `hakuMin3`
- `hakuMin4`
- `ajoMin1`
- `ajoMin2`
- `ajoMin3`
- `ajoMin4`
- `hyvaksytytAjominuutit`
- `viiteEra1`
- `viiteEra2`
- `viiteEra3`
- `viiteEra4`

Pisteet ja tulos:

- `ajoajanPisteet`
- `hakuEra1`
- `hakuEra2`
- `hakuEra3`
- `hakuEra4`
- `hakuKeskiarvo`
- `haukkuEra1`
- `haukkuEra2`
- `haukkuEra3`
- `haukkuEra4`
- `haukkuKeskiarvo`
- `ajotaitoEra1`
- `ajotaitoEra2`
- `ajotaitoEra3`
- `ajotaitoEra4`
- `ajotaitoKeskiarvo`
- `yleisvaikutusEra1`
- `yleisvaikutusEra2`
- `yleisvaikutusEra3`
- `yleisvaikutusEra4`
- `yleisvaikutelmaPisteet`
- `hakuloysyysTappioEra1`
- `hakuloysyysTappioEra2`
- `hakuloysyysTappioEra3`
- `hakuloysyysTappioEra4`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioEra1`
- `ajoloysyysTappioEra2`
- `ajoloysyysTappioEra3`
- `ajoloysyysTappioEra4`
- `ajoloysyysTappioYhteensa`
- `takajalkeenAjoEra1`
- `takajalkeenAjoEra2`
- `takajalkeenAjoEra3`
- `takajalkeenAjoEra4`
- `puutteellinenMetsastysintoEra1`
- `puutteellinenMetsastysintoEra2`
- `puutteellinenMetsastysintoEra3`
- `puutteellinenMetsastysintoEra4`
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

Tekninen säilytys:

- `raakadataJson`

### `TrialLisatietoItem`

- `id`
- `trialEntryId` (FK `TrialEntry`)
- `koodi` (11-61)
- `nimi`
- `era1Arvo` (`String?`)
- `era2Arvo` (`String?`)
- `era3Arvo` (`String?`)
- `era4Arvo` (`String?`)
- `jarjestys` (`Int?`, valinnainen näyttöjärjestyksen vakauteen)

Uniikki:

- `trialEntryId + koodi`

Kommentti:

- Eräkohtaiset lisätiedot (esim. koodi 52) luetaan lisätietokentistä (esim. `521_*`, `522_*`).
- Jos jollain rivillä arvo puuttuu, kenttä jää `null` eikä sitä päätellä väkisin.

## Prisma-tason uniikit ja indeksit

- `TrialEvent`
  - `UNIQUE (sklKoeId)`
  - `INDEX (koepaiva)`
  - `INDEX (koekunta, koepaiva)`
- `TrialEntry`
  - `UNIQUE (trialEventId, rekisterinumeroSnapshot)`
  - `UNIQUE (yksilointiAvain)`
  - `INDEX (dogId)`
  - `INDEX (trialEventId)`
  - `INDEX (loppupisteet)`
- `TrialLisatietoItem`
  - `UNIQUE (trialEntryId, koodi)`
  - `INDEX (koodi)`
  - `INDEX (trialEntryId)`

## Sisäinen kanoninen malli (mapperin ulostulo)

- HTTP: `POST`
- Content-Type: `application/json`
- Payload:

```json
{
  "event": {
    "sklKoeId": 290115,
    "koepaiva": "2025-09-07",
    "koekunta": "Ristijarvi",
    "jarjestaja": "Kainuun Ajokoirakerho",
    "kennelpiiri": "Kainuun kennelpiiri ry",
    "kennelpiirinro": "3",
    "rotukoodi": "161/1",
    "koemuoto": "AJOK"
  },
  "entry": {
    "rekisterinumero": "FI33413/18"
  },
  "lisatiedot": [
    {
      "koodi": "11",
      "nimi": "Paljas maa",
      "era1Arvo": "1",
      "era2Arvo": "1",
      "era3Arvo": null,
      "era4Arvo": null
    }
  ]
}
```

Huomio:

- Tämä JSON on sisäinen kohdemalli, ei integraatiolta vaadittu sisääntulomuoto.
- API-sisääntulo mapataan typed kenttiin, mutta koko alkuperäinen payload säilytetään `raakadataJson`-kentässä.
- Arvo `"-"` muunnetaan `null`-arvoksi mapperissa.

## API sisääntulopolitiikka (lukittu)

- API saa vastaanottaa täydellisen lähdepayloadin (`yksi_tulos`-tyylinen, integraation nykyinen muoto, ylimääräiset avaimet sallittu).
- Mapperi poimii siitä vain kanonisen AJOK-mallin kentät (`TrialEvent`, `TrialEntry`, `TrialLisatietoItem`).
- Lisätiedoissa tuetaan 1-4 erää (`era1Arvo`, `era2Arvo`, `era3Arvo`, `era4Arvo`).
- Koko sisääntulon JSON tallennetaan aina `TrialEntry.raakadataJson`-kenttään audit/debug/replay-käyttöön.
- Tuntemattomat tai käyttämättömät kentät eivät aiheuta virhettä.
- Pyyntö hylätään vain, jos kanoniset minimikentät puuttuvat:
  - `sklKoeId`
  - `koepaiva`
  - `koekunta`
  - `rekisterinumero`

## Legacy `VARA` -parsisääntö (lukittu)

- Legacy-rivin `VARA` normalisoidaan trim + upper-case.
- Tunnisteet:
  - sisältää `L` -> `luopui = true`
  - sisältää `S` -> `suljettu = true`
  - sisältää `K` -> `keskeytetty = true`
- Tuntematon tai muu sisältö talletetaan `notes`-kenttään.
- Arvot kuten `NUL`, tyhjä tai `null` eivät aseta tilalippuja.

## Ylituomari-konsistenssisääntö (lukittu)

- `ylituomariNimi` ja `ylituomariNumero` ovat event-tason kenttiä (`TrialEvent`).
- Saman `sklKoeId` tapahtuman rivien tulee tuottaa sama ylituomari.
- Jos importissa/API:ssa havaitaan ristiriita:
  - kirjataan import issue / warning
  - säilytetään eventin aiempi ensimmäinen ei-null arvo
  - ristiriitainen arvo säilyy vain rivin `raakadataJson`-kentässä.

## API-minimikentät

- `sklKoeId`
- `koepaiva`
- `koekunta`
- `rekisterinumero`

## API-reitti

- Suositus integraatiolle: `POST /api/integraatiot/koiratietokanta/koetulokset/upsert`
- Vaihtoehto (lyhyt): `POST /api/trials/results/upsert`

## Legacy-import (kertamigraatio)

- Legacy on kertamigraatio.
- Legacylle ei tehdä fallback-upsert-logiikkaa.
- Legacy-riveille annetaan tekninen import-avain (`yksilointiAvain`).
- Legacyssa puuttuvat kentät jäävät `null`:ksi.
- Legacy tuottaa aina myös `raakadataJson`-tallennuksen.

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
- `TUOM1` -> `TrialEvent.ylituomariNimi`
- `VARA` -> `TrialEntry.notes` (`L` = Luopui, `S` = Suljettu, `K` = Keskeytetty)

Vain raw-säilytys:

- `MUOKATTU`

Puuttuvat legacyssä (jäävät tyhjäksi):

- `sklKoeId`
- lisätiedot 11-61
- useat eräkohtaiset pöytäkirjakentät

## Toteutusjärjestys

1. Lisää uudet Prisma-mallit
2. Tee legacy-import uuteen malliin (kertamigraatio)
3. Toteuta lukuadapterit (`trials` + `dogs/profile`) uuteen skeemaan
4. Vaihda UI lukemaan uusia adaptereita
5. Toteuta API upsert `sklKoeId + rekisterinumero` -avaimella
6. Tallenna lisätiedot 11-61 aina `TrialLisatietoItem`-riveihin
7. Säilytä koko payload `raakadataJson`-kentässä
