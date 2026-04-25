# AJOK kenttämapping yhdestä tuloksesta

Tämä tiedosto on tekninen mapping-liite yhdestä esimerkkituloksesta.
Tämä ei ole pääsuunnitelma.
Aktiivinen kirjoitussopimus on dokumentissa
`koiratietokanta-api-ajok-upsert.md`.

Lähde:

- `/Users/akikuivas/Library/CloudStorage/ProtonDrive-aki@kesman.eu-folder/beagle/yksi_tulos.txt`

## Mapping-periaatteet

1. Sama lähderivi jaetaan neljään tasoon:

- `TrialEvent` (kokeen yhteiset tiedot)
- `TrialEntry` (yksi koira yhdessä kokeessa)
- `TrialEra` (eräkohtaiset piste- ja minuuttirivit)
- `TrialEraLisatieto` (11-61 lisätietorivit per erä)

2. Arvo `"-"` mapataan `null`:iksi.

3. Lähdearvot säilytetään lisäksi `TrialEntry.raakadataJson`-kentässä.

4. Lisätiedot toteutetaan tuotannossa normalisoituna `TrialEra` +
   `TrialEraLisatieto` -malliin.

5. Entry-level `koemuoto` ja `koetyyppi` ovat kanonisia; event-tasolla ei enää
   tallenneta `koemuoto`-kenttää.

## Event-mapping

| Lähdekenttä (`yksi_tulos`) | Kohde                         |
| -------------------------- | ----------------------------- |
| `SKLid`                    | `TrialEvent.sklKoeId`         |
| `Koepvm`                   | `TrialEvent.koepaiva`         |
| `KOEPAIKKA`                | `TrialEvent.koekunta`         |
| `JARJESTAJA`               | `TrialEvent.jarjestaja`       |
| `KENNELPIIRI`              | `TrialEvent.kennelpiiri`      |
| `KENNELPIIRINRO`           | `TrialEvent.kennelpiirinro`   |
| `yt`                       | `TrialEvent.ylituomariNimi`   |
| `ytnro`                    | `TrialEvent.ylituomariNumero` |

Huomio:

- `SKLkoemuoto` kirjoittaa vain `TrialEntry.koemuoto`-kenttää.
- Event voi sisältää useita entry-tason `koemuoto`-arvoja.
- `LUOKKA` ja `rotukoodi` käsitellään erillisinä kenttinä.
- `rotukoodi` täytetään vain jos lähde antaa sen erillisenä varmana arvona.

## Entry-mapping (ydin)

| Lähdekenttä (`yksi_tulos`)         | Kohde                                                    |
| ---------------------------------- | -------------------------------------------------------- |
| `REKISTERINUMERO`                  | `TrialEntry.rekisterinumeroSnapshot`                     |
| `SKLkoemuoto`                      | `TrialEntry.koemuoto`                                    |
| `LUOKKA`                           | `TrialEntry.luokka`                                      |
| `Omistaja`                         | `TrialEntry.omistajaSnapshot`                            |
| `Omistajankotipaikka`              | `TrialEntry.omistajanKotikuntaSnapshot`                  |
| `I_ERA_KLO`                        | `TrialEra(era=1).alkoi`                                  |
| `II_ERA_KLO`                       | `TrialEra(era=2).alkoi`                                  |
| `i_haku_min`                       | `TrialEra(era=1).hakumin`                                |
| `II_HAKU_MIN`                      | `TrialEra(era=2).hakumin`                                |
| `I_AJO_MIN`                        | `TrialEra(era=1).ajomin`                                 |
| `II_AJO_MIN`                       | `TrialEra(era=2).ajomin`                                 |
| `HYV_AJOT_MIN`                     | `TrialEntry.hyvaksytytAjominuutit`                       |
| `AJOPISTEET`                       | `TrialEntry.ajoajanPisteet`                              |
| `I_HAKU`                           | `TrialEra(era=1).haku`                                   |
| `II_HAKU`                          | `TrialEra(era=2).haku`                                   |
| `HAKUPISTEET`                      | `TrialEntry.haku`                                        |
| `I_HAUKKU`                         | `TrialEra(era=1).hauk`                                   |
| `II_HAUKKU`                        | `TrialEra(era=2).hauk`                                   |
| `HAUKKUPISTEET`                    | `TrialEntry.hauk`                                        |
| `I_AJOTAITO`                       | `TrialEra(era=1).yva`                                    |
| `II_AJOTAITO`                      | `TrialEra(era=2).yva`                                    |
| `AJOTAITOPISTEET`                  | `TrialEntry.yva`                                         |
| `ANSIOPISTEET`                     | `TrialEntry.ansiopisteetYhteensa`                        |
| `I_HAKULOYSYYS`                    | `TrialEra(era=1).hlo`                                    |
| `II_HAKULOYSYYS`                   | `TrialEra(era=2).hlo`                                    |
| `HAKULOYSYYSPISTEET`               | `TrialEntry.hlo`                                         |
| `I_AJOLOYSYYS`                     | `TrialEra(era=1).alo`                                    |
| `II_AJOLOYSYYS`                    | `TrialEra(era=2).alo`                                    |
| `AJOLOYSYYSPISTEET`                | `TrialEntry.alo`                                         |
| `TAPPIOPISTEET`                    | `TrialEntry.tappiopisteetYhteensa`                       |
| `LOPPUPISTEET`                     | `TrialEntry.loppupisteet`                                |
| `PALKINTOSIJA`                     | `TrialEntry.palkinto`                                    |
| `SIJOITUS_LUOKASSA`                | `TrialEntry.sijoitus`                                    |
| `KOIRIA_LUOKASSA`                  | `TrialEntry.koiriaLuokassa`                              |
| `koekaudenkoe`                     | `TrialEntry.koetyyppi = KOKOKAUDENKOE`                   |
| `pitkakoe`                         | `TrialEntry.koetyyppi = PITKAKOE`                        |
| flagit puuttuvat / `0`             | `TrialEntry.koetyyppi = NORMAL`                          |
| `KELI`                             | compatibility input `keli`, persisted to `TrialEntry.ke` |
| `111_PALJAS_MAA`..`113_PALJAS_MAA` | `TrialEraLisatieto` code `11` (`Paljas maa`)             |
| `121_LUMIKELI`..`123_LUMIKELI`     | `TrialEraLisatieto` code `12` (`Lumikeli`)               |
| `luopui`                           | `TrialEntry.huomautus = LUOPUI`                          |
| `suljettu`                         | `TrialEntry.huomautus = SULJETTU`                        |
| `keskeytti`                        | `TrialEntry.huomautus = KESKEYTETTY`                     |
| `HUOMAUTUS`                        | `TrialEntry.huomautusTeksti`                             |
| `palkintotuomari1`                 | `TrialEntry.ryhmatuomariNimi`                            |
| `palkintotuomari2`                 | `TrialEntry.palkintotuomariNimi`                         |
| Koko JSON-rivi                     | `TrialEntry.raakadataJson`                               |

Huomio:

- `KOEMUOTO` on lähdedatan koetason tieto. Sitä ei käytetä
  `TrialEntry.koemuoto`-kentän fallback-arvona; entry-tason `koemuoto`
  täytetään vain `SKLkoemuoto`-kentästä.
- Jos sekä `koekaudenkoe` että `pitkakoe` ovat totta, payload hylätään.
- Top-level weather uses `TrialEntry.ke`.

## Legacy `SIJA` normalisointi phase 5:ssä

Phase 5 mapittaa `SIJA`-arvon seuraavassa järjestyksessä:

1. Tyhjä arvo -> `sija=null`, `koiriaLuokassa=null`, `koetyyppi=NORMAL`
2. Pelkkä `-` -> `sija=null`, `koiriaLuokassa=null`, `koetyyppi=NORMAL`
3. Pelkkä `KK` -> `sija=null`, `koiriaLuokassa=null`, `koetyyppi=KOKOKAUDENKOE`
4. Dash-prefiksi + numero, esimerkiksi `-12` tai `--3`
   -> `sija=null`, `koiriaLuokassa=<numero>`, `koetyyppi=NORMAL`
5. Kahden osan arvo erotinmerkistä riippumatta, kun vasen tai oikea osa on
   `PK` tai `KK`
   - `PK|4`, `PK.1`, `PK|-`, `-|PK3` -> `sija=null`,
     `koiriaLuokassa=null`, `koetyyppi=PITKAKOE`
   - `-|KK` -> `sija=null`, `koiriaLuokassa=null`, `koetyyppi=KOKOKAUDENKOE`
6. Tavallinen sijoitus + luokkakoko, esimerkiksi `1|3` tai `7-9`
   -> `sija="<vasen osa>"`, `koiriaLuokassa=<oikea numero>`,
   `koetyyppi=NORMAL`

Epäselvä arvo -> entry silti projisoidaan, mutta kirjoitetaan warning issue
`TRIAL_PHASE5_UNCLEAR_SIJA`

## Lisätietojen mapping

`TrialEraLisatieto`-rivit muodostetaan kooditetuista lisätietokentistä.
Ensimmäinen numero on pöytäkirjan virallinen lisätietokoodi; raw payloadin
avainprefix voi olla eri numero, koska `yksi_tulos` käyttää omaa
transport-avaimistustaan.

Lukutapa:

- ensimmäinen numero = ominaisuuskoodi (esim. `20`)
- loppu `1` = erä 1
- loppu `2` = erä 2
- loppu `3` = mahdollinen kolmas/varakenttä

Kaikki lisätiedot mapataan samaan kohteeseen:

- `TrialEraLisatieto.koodi`
- `TrialEraLisatieto.nimi`
- `TrialEraLisatieto.arvo`
- parent `TrialEra.era`
