# AJOK-koetulos skeemasuunnittelu

## Tavoite

Määritellä uusi koetulosmalli niin, että:

- vanha `akoeall`-data voidaan importata ilman tietojen vääristelyä
- uusi integraatiodata voidaan tallentaa laajana (myös lisätiedot 11-61)
- tulokset voidaan tallentaa vaikka koiraa ei vielä löydy tietokannasta
- uudelleenlähetys päivittää olemassa olevan tuloksen (ei duplikaatteja)

Tarkempi lähdekenttä -> kohdekenttä mapping (`yksi_tulos.txt`) löytyy tiedostosta:

- `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/docs/features/trials/ajokoe-kenttamapping-yksi-tulos.md`

## Faktapohja vanhasta datasta

Legacy-taulu `akoeall` sisältää suppean ytimen (esim. `REKNO`, `TAPPV`, `TAPPA`, `PA`, `PISTE`, `SIJA`, `HAKU`, `HAUK`, `YVA`, `HLO`, `ALO`, `TJA`, `PIN`, `TUOM1`).

`akoeall`-taulussa ei ole:

- `SKLid`
- laajoja lisätietorivejä 11-61

Tästä syystä uusi skeema ei saa olettaa, että legacy-riveillä olisi kaikki uuden AJOK-pöytäkirjan kentät.

## Ehdotettu rakenne

### 1) `TrialEvent`

Kokeen yhteiset tiedot.

Suositellut kentät:

- `id`
- `sklKoeId` (`Int?`, uniikki kun olemassa)
- `koepaiva`
- `koekunta`
- `jarjestaja`
- `kennelpiiri`
- `kennelpiirinro`
- `rotukoodi`
- `koemuoto`

Kommentti: `sklKoeId` on uudessa integraatiossa ensisijainen event-tunniste, mutta legacyssä se voi puuttua.

### 2) `TrialEntry`

Yksi koira yhdessä kokeessa.

Suositellut kentät:

- `id`
- `trialEventId`
- `dogId` (`nullable`)
- `lahde` (`LEGACY_AKOEALL | API_TARKASTAJA`)
- `datanTaso` (`SUPPEA | LAAJA`)
- `yksilointiAvain` (`String @unique`)
- `rekisterinumeroSnapshot` (pakollinen)
- koiran tiedot snapshot-kenttinä (`koiranNimiSnapshot`, `omistajaSnapshot`, jne.)
- koe-erät, ansiopisteet, tappiopisteet, pisteet/tulos, olosuhteet, huomautukset
- `raakadataJson` (koko alkuperäinen payload audit/PDF-varmistukseen)

Kommentti: `dogId` on tarkoituksella nullable, jotta tulos voidaan tallentaa heti rekisterinumerolla.

### 3) `TrialLisatietoItem`

Lisätiedot 11-61 omiksi riveiksi.

Suositellut kentät:

- `id`
- `trialEntryId`
- `koodi` (esim. `11`, `42`, `61`)
- `nimi`
- `era1Arvo` (`String?`)
- `era2Arvo` (`String?`)

Uniikki avain:

- `@@unique([trialEntryId, koodi])`

Kommentti: string-arvo säilyttää sekä numerot että rastimerkinnät (`X`, `0`, `2.0`, `13`).

## Yksilöinti ja upsert-säännöt

### API-rivit (uusi integraatio)

Upsert-avain:

- `api|<sklKoeId>|<koepaiva>|<rekisterinumero>`

### Legacy-rivit (`akoeall`)

Upsert-avain:

- `legacy|<koepaiva>|<koekunta>|<rekisterinumero>`

Kommentti: legacyssä ei voida rakentaa avainta `sklKoeId`:n varaan.

## Miten vanha data istuu malliin

1. Legacy-rivit importataan `TrialEntry`-tauluun `lahde=LEGACY_AKOEALL`, `datanTaso=SUPPEA`.
2. Kentät joita legacyssä ei ole jäävät `null`-arvoiksi.
3. Lisätietorivejä (`TrialLisatietoItem`) luodaan vain, jos lähteessä on data.
4. Uusi API-data voi tulla rinnalle `datanTaso=LAAJA` ilman että legacy rikkoutuu.

## Koiraton tulosrivi

Tulosrivin tallennus ei saa kaatua siihen, ettei koiraa löydy:

- `dogId` nullable
- `rekisterinumeroSnapshot` pakollinen
- myöhempi linkitysajo voi täyttää `dogId`:n rekisterinumeron perusteella

Koiran lisäys/päivitys -virrassa tehdään automaattinen backfill-linkitys:

1. Etsi `TrialEntry`-rivit, joissa:
   - `rekisterinumeroSnapshot` vastaa lisättyä rekisterinumeroa
   - `dogId IS NULL`
2. Päivitä löydettyihin riveihin `dogId`.
3. Tee sama logiikka myös `ShowEntry`-riveille (`registrationNoSnapshot`, `dogId IS NULL`).

## Päätökset ennen toteutusta

1. Onko `sklKoeId` API:ssa pakollinen kaikissa uusissa kutsuissa? (suositus: kyllä)
2. Tallennetaanko lisätiedot aina sekä `TrialLisatietoItem`-tauluun että `raakadataJson`-kenttään? (suositus: kyllä)
3. Halutaanko `TrialEvent`-tasolle myös fallback-uniikki (`koepaiva + koekunta`) niille riveille, joilla `sklKoeId` puuttuu?
