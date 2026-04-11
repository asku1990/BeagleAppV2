# AJOK-kokeen koirakohtainen pöytäkirja - integraatiosuunnitelma

## Tavoite

Määritellä, miten AJOK-kokeen koirakohtainen pöytäkirja tallennetaan uuteen järjestelmään niin, että:

- yksi koetulos voidaan vastaanottaa ja päivittää kerrallaan
- tietosisältö riittää pöytäkirjan (PDF) tuottamiseen
- tuloksen uudelleenlähetys korjaa olemassa olevan rivin ilman duplikaatteja

## Yksilöinti ja päivityssääntö

Koetulos yksilöidään avaimella:

- `rekisterinumero + koepaiva + sklKoeId`

Tästä muodostetaan uniikki `yksilointiAvain`.

Kun sama avain tulee uudelleen, olemassa oleva tulos päivitetään.

## Tietoryhmät

Alla oleva ryhmittely on suunniteltu AJOK-koirakohtaisen pöytäkirjan näkymän perusteella.

### 1) Kokeen tiedot

- `sklKoeId` (SKL:n numeerinen tapahtuma-id)
- `rotukoodi` (esim. `161/1`)
- `kennelpiiri`
- `kennelpiirinro`
- `koekunta` (koepaikkakunta)
- `koepaiva`
- `jarjestaja`
- `koemuoto` (valinnainen, jos lähde lähettää erikseen; ei pakollinen tässä otsikkolistassa)

### 2) Koiran tiedot

- `koiranNimi`
- `rekisterinumero`
- `isanNimi`
- `isanRekisterinumero`
- `emanNimi`
- `emanRekisterinumero`
- `omistaja`
- `omistajanKotikunta`
- `sukupuoli` (uros/narttu)
- `rokotusOk` (X-rasti)
- `tunnistusOk` (X-rasti)

### 3) Koe-erät

- `era1Alkoi`
- `era2Alkoi`
- `hakuMin1`
- `hakuMin2`
- `ajoMin1`
- `ajoMin2`
- `hyvaksytytAjominuutit`
- `ajoajanPisteet`

### 4) Ansiopisteiden keskiarvot ja yhteensä

- `hakuEra1`
- `hakuEra2`
- `hakuKeskiarvo`
- `haukkuEra1`
- `haukkuEra2`
- `haukkuKeskiarvo`
- `ajotaitoEra1`
- `ajotaitoEra2`
- `ajotaitoKeskiarvo`
- `ansiopisteetYhteensa`

### 5) Tappiopisteiden summat

- `hakuloysyysTappioEra1`
- `hakuloysyysTappioEra2`
- `hakuloysyysTappioYhteensa`
- `ajoloysyysTappioEra1`
- `ajoloysyysTappioEra2`
- `ajoloysyysTappioYhteensa`
- `tappiopisteetYhteensa`

### 6) Pisteet ja tulos

- `loppupisteet`
- `palkinto`
- `sijoitus`
- `koiriaLuokassa`

### 7) Olosuhteet

- `keli` (esim. `P`)
- `paljasMaa` (X-rasti, boolean)
- `lumikeli` (cm-arvo tai `0`)

### 8) Huomautukset ja tilat

- `luopui` (boolean)
- `suljettu` (boolean)
- `keskeytetty` (boolean)
- `huomautusTeksti`

### 9) Lisätiedot (asteikko/rastit)

Lisätiedot sisältävät suuren määrän pöytäkirjan rivejä (esim. 11-61), joissa on eräkohtaisia arvoja ja rastituksia.

Nämä kannattaa tallentaa rakenteisena koontina:

- `lisatiedotJson`

Yleinen arvorakenne lisätietoriveille:

- `koodi` (esim. `11`, `42`, `61`)
- `nimi` (esim. `Paljas maa`, `Metsästysinto koetteluaikana`)
- `era1` (numero, boolean tai teksti)
- `era2` (numero, boolean tai teksti)

Lisätietojen ryhmittely:

#### 9.1 Olosuhteet (11-18)

- `11` Paljas maa (x)
- `12` Lumikeli (cm)
- `13` Kohtalainen tai kova tuuli
- `14` Kuiva keli
- `15` Kostea keli
- `16` Kohtalainen tai kova sade
- `17` Lämpötila (°C)
- `18` Maasto

#### 9.2 Haku (20-22)

- `20` Haun laajuus ilman yöjälkeä
- `21` Vainuamistapa
- `22` Hakulöysyyden laatu

#### 9.3 Haukku (30-36)

- `30` Kuuluvuus
- `31` Kertovuus
- `32` Intohimoisuus
- `33` Tiheys
- `34` Äänien määrä
- `35` Sukupuolileima
- `36` Beaglen haukku

#### 9.4 Ajo (40-56)

- `40` Metsästysinto haun aikana
- `41` Metsästysinto ajon aikana
- `42` Metsästysinto koetteluaikana
- `50` Ajotaito
- `51` Nopeus
- `52` Tie- ja estetyöskentely
- `53` Vainuamistapa
- `54` Herkkyys
- `55` Ajolöysyyden laatu
- `56` Ajettava nähty

#### 9.5 Muut ominaisuudet (60-61)

- `60` Muiden eläinten ja sorkkaeläinten ajo
- `61` Hallittavuus

### 10) Tuomarit ja vahvistus

- `ryhmatuomariNimi`
- `palkintotuomariNimi`
- `ylituomariNimi`
- `ylituomariNumero`

## Tallennusmalli (suositus)

### Tyypitetyt sarakkeet

Tyypitettyinä sarakkeina tallennetaan:

- yksilöinti
- kokeen otsikkotiedot
- koiran perustiedot
- eräajat
- tuloksen ydinpisteet, palkinto ja sijoitus
- tilatiedot (luopui/suljettu/keskeytti)
- tuomarit

### Raakadatan säilytys

Kaikki saapuva aineisto säilytetään lisäksi:

- `raakadataJson`

Tämä varmistaa, että PDF:n tarvitsema täydellinen sisältö säilyy myös silloin, kun kaikkia yksityiskohtia ei vielä nosteta omiksi sarakkeiksi.

## Rajapinnan minimivaatimus

Koetulos vastaanotetaan yksi kerrallaan.

Pakolliset kentät:

- `rekisterinumero`
- `koepaiva`
- `sklKoeId`
- `koekunta`

Jos jokin pakollinen arvo puuttuu, pyyntö hylätään (400).

## Toteutusvaiheet

1. Lukitaan kenttäryhmät ja pakolliset kentät
2. Lisätään skeemaan tyypitetyt sarakkeet + `raakadataJson`
3. Toteutetaan yksi-rivi-kerrallaan `upsert` yksilöintiavaimella
4. Lisätään testit: luonti, päivitys, uudelleenlähetys, puuttuva pakollinen kenttä
5. Varmistetaan, että tallennetusta datasta saadaan tuotettua AJOK-pöytäkirja
