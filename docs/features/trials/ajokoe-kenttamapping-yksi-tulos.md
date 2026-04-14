# AJOK kenttämapping yhdestä tuloksesta

Tämä tiedosto on tekninen mapping-liite yhdestä esimerkkituloksesta.
Tämä ei ole pääsuunnitelma.
Lopulliset skeemapäätökset on dokumentissa `ajokoe-suunnitelma.md`.

Lähde:

- `/Users/akikuivas/Library/CloudStorage/ProtonDrive-aki@kesman.eu-folder/beagle/yksi_tulos.txt`

## Mapping-periaatteet

1. Sama lähderivi jaetaan kolmeen tasoon:

- `TrialEvent` (kokeen yhteiset tiedot)
- `TrialEntry` (yksi koira yhdessä kokeessa)
- `TrialLisatietoItem` (11-61 / Pxx lisätietorivit)

2. Arvo `"-"` mapataan `null`:iksi.

3. Lähdearvot säilytetään lisäksi `TrialEntry.raakadataJson`-kentässä.

4. Lisätiedot toteutetaan tuotannossa normalisoituna `TrialLisatietoItem`-malliin
   (ei `lisatiedotJson`-välivaihetta).

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

| Lähdekenttä (`yksi_tulos`)         | Kohde                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| `REKISTERINUMERO`                  | `TrialEntry.rekisterinumeroSnapshot`                    |
| `LUOKKA`                           | `TrialEntry.luokka`                                     |
| `Omistaja`                         | `TrialEntry.omistajaSnapshot`                           |
| `Omistajankotipaikka`              | `TrialEntry.omistajanKotikuntaSnapshot`                 |
| `I_ERA_KLO`                        | `TrialEntry.era1Alkoi`                                  |
| `II_ERA_KLO`                       | `TrialEntry.era2Alkoi`                                  |
| `i_haku_min`                       | `TrialEntry.hakuMin1`                                   |
| `II_HAKU_MIN`                      | `TrialEntry.hakuMin2`                                   |
| `I_AJO_MIN`                        | `TrialEntry.ajoMin1`                                    |
| `II_AJO_MIN`                       | `TrialEntry.ajoMin2`                                    |
| `HYV_AJOT_MIN`                     | `TrialEntry.hyvaksytytAjominuutit`                      |
| `AJOPISTEET`                       | `TrialEntry.ajoajanPisteet`                             |
| `I_HAKU`                           | `TrialEntry.hakuEra1`                                   |
| `II_HAKU`                          | `TrialEntry.hakuEra2`                                   |
| `HAKUPISTEET`                      | `TrialEntry.hakuKeskiarvo`                              |
| `I_HAUKKU`                         | `TrialEntry.haukkuEra1`                                 |
| `II_HAUKKU`                        | `TrialEntry.haukkuEra2`                                 |
| `HAUKKUPISTEET`                    | `TrialEntry.haukkuKeskiarvo`                            |
| `I_AJOTAITO`                       | `TrialEntry.ajotaitoEra1`                               |
| `II_AJOTAITO`                      | `TrialEntry.ajotaitoEra2`                               |
| `AJOTAITOPISTEET`                  | `TrialEntry.ajotaitoKeskiarvo`                          |
| `ANSIOPISTEET`                     | `TrialEntry.ansiopisteetYhteensa`                       |
| `I_HAKULOYSYYS`                    | `TrialEntry.hakuloysyysTappioEra1`                      |
| `II_HAKULOYSYYS`                   | `TrialEntry.hakuloysyysTappioEra2`                      |
| `HAKULOYSYYSPISTEET`               | `TrialEntry.hakuloysyysTappioYhteensa`                  |
| `I_AJOLOYSYYS`                     | `TrialEntry.ajoloysyysTappioEra1`                       |
| `II_AJOLOYSYYS`                    | `TrialEntry.ajoloysyysTappioEra2`                       |
| `AJOLOYSYYSPISTEET`                | `TrialEntry.ajoloysyysTappioYhteensa`                   |
| `TAPPIOPISTEET`                    | `TrialEntry.tappiopisteetYhteensa`                      |
| `LOPPUPISTEET`                     | `TrialEntry.loppupisteet`                               |
| `PALKINTOSIJA` / `PA`              | `TrialEntry.palkinto`                                   |
| `SIJOITUS_LUOKASSA`                | `TrialEntry.sijoitus`                                   |
| `KOIRIA_LUOKASSA`                  | `TrialEntry.koiriaLuokassa`                             |
| `KELI` / `KE`                      | `TrialEntry.keli`                                       |
| `111_PALJAS_MAA`..`113_PALJAS_MAA` | `TrialEntry.paljasMaa` (true jos jokin eristä rastittu) |
| `121_LUMIKELI`..`123_LUMIKELI`     | `TrialEntry.lumikeli` (cm)                              |
| `luopui`                           | `TrialEntry.luopui`                                     |
| `suljettu`                         | `TrialEntry.suljettu`                                   |
| `keskeytti`                        | `TrialEntry.keskeytetty`                                |
| `HUOMAUTUS`                        | `TrialEntry.huomautusTeksti`                            |
| `palkintotuomari1`                 | `TrialEntry.ryhmatuomariNimi`                           |
| `palkintotuomari2`                 | `TrialEntry.palkintotuomariNimi`                        |
| Koko JSON-rivi                     | `TrialEntry.raakadataJson`                              |

Huomio:

- `ylituomari` on event-tason tieto.
- Jos saman `sklKoeId` tapahtuman riveillä on ristiriitainen ylituomari, ristiriita kirjataan issueksi ja eventille jätetään ensimmäinen ei-null arvo.

## Lisätietojen mapping

`TrialLisatietoItem`-rivit muodostetaan kooditetuista lisätietokentistä.

Lukutapa:

- ensimmäinen numero = ominaisuuskoodi (esim. `20`)
- loppu `1` = erä 1
- loppu `2` = erä 2
- loppu `3` = mahdollinen kolmas/varakenttä (ei aina käytössä)

Kaikki lisätiedot mapataan samaan kohteeseen:

- `TrialLisatietoItem.koodi`
- `TrialLisatietoItem.nimi`
- `TrialLisatietoItem.era1Arvo`
- `TrialLisatietoItem.era2Arvo`
- `TrialLisatietoItem.era3Arvo`

### Kuvaava mapping-lista

| Koodi | Kuvaus                                | Lähdeavaimet (`yksi_tulos`)                           |
| ----- | ------------------------------------- | ----------------------------------------------------- |
| `11`  | Paljas maa                            | `111_*`, `112_*`, `113_*`                             |
| `12`  | Lumikeli (cm)                         | `121_*`, `122_*`, `123_*`                             |
| `13`  | Kohtalainen tai kova tuuli            | `131_*`, `132_*`, `133_*`                             |
| `14`  | Kuiva keli                            | `141_*`, `142_*`, `143_*`                             |
| `15`  | Kostea keli                           | `151_*`, `152_*`, `153_*`                             |
| `16`  | Kohtalainen tai kova sade             | `161_*`, `162_*`, `163_*`                             |
| `17`  | Lämpötila (°C)                        | `171_*`, `172_*`, `173_*`                             |
| `18`  | Maasto                                | `181_*`, `182_*`, `183_*`                             |
| `20`  | Haun laajuus ilman yöjälkeä           | `201_*`, `202_*`, `203_*`                             |
| `21`  | Vainuamistapa (haku)                  | `211_*`, `212_*`, `213_*`                             |
| `22`  | Hakulöysyyden laatu                   | `221_*`, `222_*`, `223_*` (jos lähteessä)             |
| `30`  | Kuuluvuus                             | `301_*`, `302_*`, `303_*`                             |
| `31`  | Kertovuus                             | `311_*`, `312_*`, `313_*`                             |
| `32`  | Intohimoisuus                         | `321_*`, `322_*`, `323_*`                             |
| `33`  | Tiheys                                | `331_*`, `332_*`, `333_*`                             |
| `34`  | Äänien määrä                          | `341_*`, `342_*`, `343_*`                             |
| `35`  | Sukupuolileima                        | `351_*`, `352_*`, `353_*` (ei aina kaikissa riveissä) |
| `36`  | Beaglen haukku                        | `361_*`, `362_*`, `363_*` (jos lähteessä)             |
| `40`  | Metsästysinto haun aikana             | `401_*`, `402_*`                                      |
| `41`  | Metsästysinto ajon aikana             | `411_*`, `412_*`                                      |
| `42`  | Metsästysinto koetteluaikana          | `421_*`, `422_*`                                      |
| `50`  | Ajotaito                              | `501_*`, `502_*`                                      |
| `51`  | Nopeus                                | `511_*`, `512_*`                                      |
| `52`  | Tie- ja estetyöskentely               | `521_*`, `522_*`                                      |
| `53`  | Vainuamistapa (ajo)                   | `531_*`, `532_*`                                      |
| `54`  | Herkkyys                              | `541_*`, `542_*`                                      |
| `55`  | Ajolöysyyden laatu                    | `551_*`, `552_*`                                      |
| `56`  | Ajettava nähty                        | `561_*`, `562_*`                                      |
| `60`  | Muiden eläinten ja sorkkaeläinten ajo | `601_*`, `602_*`                                      |
| `61`  | Hallittavuus                          | `611_*`, `612_*`                                      |

## Mitä tämä ei vielä takaa

Tämä mapping perustuu yhteen todelliseen riviin. Lopullinen import-mapping vaatii vielä varmistuksen:

1. kaikista sääntöversioista
2. kaikista trial-tyypeistä
3. kaikista legacy-tauluista, joista lisätietoja voidaan yhdistää

Huomio:

- Skeemarakenne on lukittu `ajokoe-suunnitelma.md`-dokumentissa:
  `TrialEvent + TrialEntry + TrialLisatietoItem`.
