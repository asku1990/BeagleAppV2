# AJOK koirakohtainen pöytäkirja

Tämä tiedosto kuvaa API-payloadin ja pöytäkirjan vaatimat tiedot.
Aktiivinen kirjoitussopimus on dokumentissa
`koiratietokanta-api-ajok-upsert.md`.

Raw PDF template used by the web app:

- `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-koirakohtainen-poytakirja.pdf`

Keep it under `apps/web/public/templates/` while the web app serves it as a
public template asset. Move it to a project-global docs/assets folder only if it
stops being a runtime-served file and becomes documentation-only source material.

## Tietoryhmät

Alla oleva ryhmittely on suunniteltu AJOK-koirakohtaisen pöytäkirjan näkymän perusteella.

### 1) Kokeen tiedot

- `sklKoeId` (SKL:n numeerinen tapahtuma-id)
- `rotukoodi` (esim. `161/1`)
- `kennelpiiri`
- `kennelpiirinro`
- `koekunta` (koepaikkakunta)
- `koemaasto`
- `koepaiva`
- `jarjestaja`
- `koemuoto` (valinnainen, jos lähde lähettää erikseen; ei pakollinen tässä otsikkolistassa)

### 2) Koiran tiedot

- `koiranNimi`
- `rekisterinumero` (koiran primary-rekisterinumero, eli ensimmäisenä lisätty rekisteri)
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
- `palkinto` (stored as text; observed live values are `0`, `1`, `2`, `3`,
  `L`, `S`, and `-`)
- `sijoitus`
- `koiriaLuokassa`

### 7) Olosuhteet

- `ke` (source `KELI`, esim. `P`) on pöytäkirjan top-level olosuhdearvo.

Lisäolotiedot, kuten `111_PALJAS_MAA`, `121_LUMIKELI`, `171_LAMPOTILA` ja muut
11-18-/20-61-rivit, tallennetaan `TrialEraLisatieto`-riveiksi.

### 8) Huomautukset ja tilat

- `luopui` (boolean)
- `suljettu` (boolean)
- `keskeytetty` (boolean)
- `huomautusTeksti`

### 9) Lisätiedot (asteikko/rastit)

Lisätiedot sisältävät suuren määrän pöytäkirjan rivejä (esim. 11-61), joissa
on eräkohtaisia arvoja ja rastituksia.

Nykyisessä runtime-mallissa nämä tallennetaan normalisoituina:

- `TrialEra`
- `TrialEraLisatieto`

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
