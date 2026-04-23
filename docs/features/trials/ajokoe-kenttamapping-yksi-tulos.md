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
   `TrialEraLisatieto` -malliin (ei `lisatiedotJson`-välivaihetta).

## Event-mapping

| Lähdekenttä (`yksi_tulos`) | Kohde                         |
| -------------------------- | ----------------------------- |
| `SKLid`                    | `TrialEvent.sklKoeId`         |
| `Koepvm`                   | `TrialEvent.koepaiva`         |
| `KOEPAIKKA`                | `TrialEvent.koekunta`         |
| `JARJESTAJA`               | `TrialEvent.jarjestaja`       |
| `KENNELPIIRI`              | `TrialEvent.kennelpiiri`      |
| `KENNELPIIRINRO`           | `TrialEvent.kennelpiirinro`   |
| `SKLkoemuoto`              | `TrialEvent.koemuoto`         |
| `yt`                       | `TrialEvent.ylituomariNimi`   |
| `ytnro`                    | `TrialEvent.ylituomariNumero` |

Huomio:

- `SKLkoemuoto` (esim. `AJOK`) ei mapata `rotukoodi`-kenttään.
- `LUOKKA` ja `rotukoodi` käsitellään erillisinä kenttinä.
- `rotukoodi` täytetään vain jos lähde antaa sen erillisenä varmana arvona (esim. `161/1`).
- Eräkohtainen lisätietodata (esim. `521_*`, `522_*`) mapataan vain silloin kun se on lähteessä mukana.

## Entry-mapping (ydin)

| Lähdekenttä (`yksi_tulos`)         | Kohde                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `REKISTERINUMERO`                  | `TrialEntry.rekisterinumeroSnapshot`                                                              |
| `LUOKKA`                           | `TrialEntry.luokka`                                                                               |
| `Omistaja`                         | `TrialEntry.omistajaSnapshot`                                                                     |
| `Omistajankotipaikka`              | `TrialEntry.omistajanKotikuntaSnapshot`                                                           |
| `I_ERA_KLO`                        | `TrialEra(era=1).alkoi`                                                                           |
| `II_ERA_KLO`                       | `TrialEra(era=2).alkoi`                                                                           |
| `i_haku_min`                       | `TrialEra(era=1).hakumin`                                                                         |
| `II_HAKU_MIN`                      | `TrialEra(era=2).hakumin`                                                                         |
| `I_AJO_MIN`                        | `TrialEra(era=1).ajomin`                                                                          |
| `II_AJO_MIN`                       | `TrialEra(era=2).ajomin`                                                                          |
| `HYV_AJOT_MIN`                     | `TrialEntry.hyvaksytytAjominuutit`                                                                |
| `AJOPISTEET`                       | `TrialEntry.ajoajanPisteet`                                                                       |
| `I_HAKU`                           | `TrialEra(era=1).haku`                                                                            |
| `II_HAKU`                          | `TrialEra(era=2).haku`                                                                            |
| `HAKUPISTEET`                      | `TrialEntry.haku`                                                                                 |
| `I_HAUKKU`                         | `TrialEra(era=1).hauk`                                                                            |
| `II_HAUKKU`                        | `TrialEra(era=2).hauk`                                                                            |
| `HAUKKUPISTEET`                    | `TrialEntry.hauk`                                                                                 |
| `I_AJOTAITO`                       | `TrialEra(era=1).yva`                                                                             |
| `II_AJOTAITO`                      | `TrialEra(era=2).yva`                                                                             |
| `AJOTAITOPISTEET`                  | `TrialEntry.yva`                                                                                  |
| `ANSIOPISTEET`                     | `TrialEntry.ansiopisteetYhteensa`                                                                 |
| `I_HAKULOYSYYS`                    | `TrialEra(era=1).hlo`                                                                             |
| `II_HAKULOYSYYS`                   | `TrialEra(era=2).hlo`                                                                             |
| `HAKULOYSYYSPISTEET`               | `TrialEntry.hlo`                                                                                  |
| `I_AJOLOYSYYS`                     | `TrialEra(era=1).alo`                                                                             |
| `II_AJOLOYSYYS`                    | `TrialEra(era=2).alo`                                                                             |
| `AJOLOYSYYSPISTEET`                | `TrialEntry.alo`                                                                                  |
| `TAPPIOPISTEET`                    | `TrialEntry.tappiopisteetYhteensa`                                                                |
| `LOPPUPISTEET`                     | `TrialEntry.loppupisteet`                                                                         |
| `PALKINTOSIJA`                     | `TrialEntry.palkinto` (stored as text; live values include `0`, `1`, `2`, `3`, `L`, `S`, and `-`) |
| `SIJOITUS_LUOKASSA`                | `TrialEntry.sijoitus`                                                                             |
| `KOIRIA_LUOKASSA`                  | `TrialEntry.koiriaLuokassa`                                                                       |
| `koekaudenkoe`                     | mapper compatibility field; not persisted in current runtime `TrialEntry`                         |
| `KELI`                             | compatibility input `keli`, persisted to `TrialEntry.ke`                                          |
| `111_PALJAS_MAA`..`113_PALJAS_MAA` | `TrialEraLisatieto` code `11` (`Paljas maa`)                                                      |
| `121_LUMIKELI`..`123_LUMIKELI`     | `TrialEraLisatieto` code `12` (`Lumikeli`)                                                        |
| `luopui`                           | `TrialEntry.luopui`                                                                               |
| `suljettu`                         | `TrialEntry.suljettu`                                                                             |
| `keskeytti`                        | `TrialEntry.keskeytetty`                                                                          |
| `HUOMAUTUS`                        | `TrialEntry.huomautusTeksti`                                                                      |
| `palkintotuomari1`                 | `TrialEntry.ryhmatuomariNimi`                                                                     |
| `palkintotuomari2`                 | `TrialEntry.palkintotuomariNimi`                                                                  |
| Koko JSON-rivi                     | `TrialEntry.raakadataJson`                                                                        |

Huomio:

- `ylituomari` on event-tason tieto.
- Jos saman `sklKoeId` tapahtuman riveillä on ristiriitainen ylituomari, ristiriita kirjataan issueksi ja eventille jätetään ensimmäinen ei-null arvo.
- Top-level weather uses `TrialEntry.ke`.

## Lisätietojen mapping

`TrialEraLisatieto`-rivit muodostetaan kooditetuista lisätietokentistä.
Ensimmäinen numero on pöytäkirjan virallinen lisätietokoodi; raw payloadin
avainprefix voi olla eri numero, koska `yksi_tulos` käyttää omaa
transport-avaimistustaan.

Lukutapa:

- ensimmäinen numero = ominaisuuskoodi (esim. `20`)
- loppu `1` = erä 1
- loppu `2` = erä 2
- loppu `3` = mahdollinen kolmas/varakenttä (ei aina käytössä)

Kaikki lisätiedot mapataan samaan kohteeseen:

- `TrialEraLisatieto.koodi`
- `TrialEraLisatieto.nimi`
- `TrialEraLisatieto.arvo`
- parent `TrialEra.era`

### Kuvaava mapping-lista

| Official code | Kuvaus                                | Raw `yksi_tulos` avaimet                              |
| ------------- | ------------------------------------- | ----------------------------------------------------- |
| `11`          | Paljas maa                            | `111_*`, `112_*`, `113_*`                             |
| `12`          | Lumikeli (cm)                         | `121_*`, `122_*`, `123_*`                             |
| `13`          | Kohtalainen tai kova tuuli            | `131_*`, `132_*`, `133_*`                             |
| `14`          | Kuiva keli                            | `141_*`, `142_*`, `143_*`                             |
| `15`          | Kostea keli                           | `151_*`, `152_*`, `153_*`                             |
| `16`          | Kohtalainen tai kova sade             | `161_*`, `162_*`, `163_*`                             |
| `17`          | Lämpötila (°C)                        | `171_*`, `172_*`, `173_*`                             |
| `18`          | Maasto                                | `181_*`, `182_*`, `183_*`                             |
| `20`          | Haun laajuus ilman yöjälkeä           | `201_*`, `202_*`, `203_*`                             |
| `21`          | Vainuamistapa (haku)                  | `211_*`, `212_*`, `213_*`                             |
| `22`          | Hakulöysyyden laatu                   | `221_*`, `222_*`, `223_*` (jos lähteessä)             |
| `30`          | Kuuluvuus                             | `301_*`, `302_*`, `303_*`                             |
| `31`          | Kertovuus                             | `311_*`, `312_*`, `313_*`                             |
| `32`          | Intohimoisuus                         | `321_*`, `322_*`, `323_*`                             |
| `33`          | Tiheys                                | `331_*`, `332_*`, `333_*`                             |
| `34`          | Äänien määrä                          | `341_*`, `342_*`, `343_*`                             |
| `35`          | Sukupuolileima                        | `351_*`, `352_*`, `353_*` (ei aina kaikissa riveissä) |
| `36`          | Beaglen haukku                        | `531_*`, `532_*`, `533_*`                             |
| `40`          | Metsästysinto haun aikana             | `401_*`, `402_*`                                      |
| `41`          | Metsästysinto ajon aikana             | `411_*`, `412_*`                                      |
| `42`          | Metsästysinto koetteluaikana          | `421_*`, `422_*`                                      |
| `50`          | Ajotaito                              | `501_*`, `502_*`                                      |
| `51`          | Nopeus                                | `511_*`, `512_*`                                      |
| `52`          | Tie- ja estetyöskentely               | `521_*`, `522_*`                                      |
| `53`          | Vainuamistapa (ajo)                   | `531_*`, `532_*`                                      |
| `54`          | Herkkyys                              | `541_*`, `542_*`                                      |
| `55`          | Ajolöysyyden laatu                    | `551_*`, `552_*`                                      |
| `56`          | Ajettava nähty                        | `561_*`, `562_*`                                      |
| `60`          | Muiden eläinten ja sorkkaeläinten ajo | `601_*`, `602_*`                                      |
| `61`          | Hallittavuus                          | `611_*`, `612_*`                                      |

## Mitä tämä ei vielä takaa

Tämä mapping perustuu yhteen todelliseen riviin. Lopullinen import-mapping vaatii vielä varmistuksen:

1. kaikista sääntöversioista
2. kaikista trial-tyypeistä
3. kaikista legacy-tauluista, joista lisätietoja voidaan yhdistää

Huomio:

- Skeemarakenne ja kirjoitussopimus on dokumentoitu
  `koiratietokanta-api-ajok-upsert.md`-dokumentissa.
