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

tästä eteenpäin tarkistamatta.

### 9) Lisätiedot (asteikko/rastit)

Lisätiedot sisältävät suuren määrän pöytäkirjan rivejä (esim. 11-61), joissa on eräkohtaisia arvoja ja rastituksia.

Nämä kannattaa tallentaa rakenteisena koontina:

- `lisatiedotJson`

Rakenne jaetaan lohkoihin:

- `olosuhteet` (11-18)
- `haku` (20-22)
- `haukku` (30-36)
- `ajo` (40-56)
- `muutOminaisuudet` (60-61)

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
