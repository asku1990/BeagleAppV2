# AJOK suunnitelma - yksinkertainen nyt

Tama on erillinen uusi dokumentti nykyista toteutusta varten.
Ei oletuksia seuraavista vaiheista.

## Toteutusjarjestys (lukittu)

### Phase 1: Admin read-only nykyiselle koedatalle (ennen uusia migraatioita)

- Ei uusia migraatioita.
- Ei uusia tauluja.
- Ei kirjoittavaa admin-toiminnallisuutta.
- Rakennetaan admin-nakyma, joka lukee nykyista koedataa ja nayttaa:
  - nykyisen skeeman `TrialResult` tiedot
  - nykyiset koetuloksen typed-kentat
  - saatavilla oleva lahde/raw-data (read-only), jos kentta on olemassa nykyisessa mallissa
- Tarkoitus: validoida nykyinen datan laatu ja varmistaa future-PDF:aan tarvittavien kenttien saatavuus.

Phase 1 valmistumiskriteerit:

- Administa voi hakea ja avata yksittaisen koetuloksen.
- Kaikki nykyiset typed-kentat nakyvat selkeasti.
- Raw payload (jos saatavilla nykyisessa skeemassa) on naytettavissa ilman muokkausta.
- Puuttuvat tulevan poytakirjan kentat on listattu dokumentoidusti (gap-lista).

### Phase 2: Minimi ingest + turvallinen tallennus

- Inbound payload pysyy `yksi_tulos`-muodossa.
- Tietomalli pysyy: `TrialEvent + TrialEntry`.
- Koko sisantulo talletetaan aina `TrialEntry.raakadataJson`-kenttaan.
- Upsert-avaimet:
  - Event: `sklKoeId`
  - Entry: `trialEventId + rekisterinumeroSnapshot`

### Phase 3: Jatkokehitys erillisena (ei nyt)

- Mahdollinen `TrialLisatietoItem`-normalisointi.
- Mahdollinen poytakirja/PDF-tuotanto.
- Ei osa nykyista toteutuslukitusta.

## Nyt lukittava scope

- Inbound payload pysyy `yksi_tulos`-muodossa.
- Tietomalli nyt: `TrialEvent + TrialEntry`.
- `TrialLisatietoItem`-taulua ei tehda nyt.
- Koko sisantulo tallennetaan aina `TrialEntry.raakadataJson`-kenttaan.
- `ylituomari` on event-tason tieto.
- Admin-v1 on read-only ja perustuu nykyiseen dataan ennen uusia migraatioita.

## TrialEvent

- `sklKoeId` (unique)
- `koepaiva`
- `koekunta`
- `jarjestaja`
- `kennelpiiri`
- `kennelpiirinro`
- `koemuoto`
- `rotukoodi`
- `ylituomariNimi`
- `ylituomariNumero`
- `ytKertomus` (optional text)

## TrialEntry (nykykayttoon pakolliset + turvalliset)

Pakolliset identiteettikentat:

- `trialEventId`
- `rekisterinumeroSnapshot`
- `yksilointiAvain`
- `lahde`
- `raakadataJson`

Linkitys:

- `dogId` (nullable)

Ajovoittaja-taulukkoon tarvittavat:

- `koiranNimiSnapshot`
- `omistajaSnapshot`
- `palkinto`
- `sijoitus`
- `koiriaLuokassa`
- `loppupisteet`
- `hakuMin1`, `hakuMin2`, `hakuMin3`, `hakuMin4`
- `ajoMin1`, `ajoMin2`, `ajoMin3`, `ajoMin4`
- `hakuKeskiarvo`
- `haukkuKeskiarvo`
- `ajotaitoKeskiarvo`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioYhteensa`

Tila- ja huomautuskentat:

- `keli`
- `luopui`
- `suljettu`
- `keskeytetty`
- `huomautusTeksti`
- `notes`

## API-kayttaytyminen nyt

- Sisääntulo on nykyinen taydellinen `yksi_tulos`-payload (ei muutoksia integraatioon).
- Mapper poimii payloadista vain paatetyt `TrialEvent`- ja `TrialEntry`-kentat.
- Koko sisääntulo talletetaan aina `TrialEntry.raakadataJson`-kenttaan.
- Tuntemattomat/ylimaaraiset avaimet eivat aiheuta virhetta.
- Pyynto hylataan vain, jos minimikentta puuttuu:
  - `sklKoeId`
  - `koepaiva`
  - `koekunta`
  - `rekisterinumero`
- Upsert-avaimet:
  - Event: `sklKoeId`
  - Entry: `trialEventId + rekisterinumeroSnapshot`

## Upsert

- Event: `sklKoeId`
- Entry: `trialEventId + rekisterinumeroSnapshot`

## Legacy nyt

- Legacy import on kertamigraatio.
- Puuttuvat arvot jaavat `null`:ksi.
- Legacy-rivi talletetaan myos `raakadataJson`:iin.
