# Changelog

This project uses a user-facing changelog format.

## How to write entries

- Keep language plain first; add technical detail only when useful.
- Internal-only changes are optional in the changelog.
- Use sections: `Added`, `Changed`, `Fixed`, `Removed`.

## [0.2.0] - 2026-02-19

### Tärkeintä tässä julkaisussa

- Julkaisussa uudistettiin kirjautumisen tekninen toteutus ja parannettiin ylläpidon käytettävyyttä. Kokonaisuus on nyt aiempaa vakaampi ja ylläpidon navigointi selkeämpi.

### Added

- Sovellukseen lisättiin Better Authiin perustuva auth-reitti (`/api/auth/[...all]`).
- Ylläpidon alkuasennukseen lisättiin `auth:bootstrap-admin`-komento, jolla ensimmäinen ADMIN-käyttäjä voidaan luoda tai olemassa oleva käyttäjä nostaa adminiksi.
- Ylläpidon sivupalkkiin lisättiin oma osio sekä uusi Asetukset-sivu (`/admin/settings`) admin-käyttäjille.

### Changed

- Sovelluksen aiempi auth-palvelukerros ja auth-route-wrapperit korvattiin Better Auth -integraatiolla.
- Ylläpidon käyttöoikeustarkistus (`requireAdmin`) käyttää nyt Better Authin sessiota.
- Auth-asetusten validointeja tarkennettiin (esimerkiksi salaisuuden vähimmäispituus ja session kesto), jotta virheelliset asetukset havaitaan jo käynnistyksessä.
- Yläpalkin takaisin-painike näkyy nyt kaikilla muilla sivuilla paitsi etusivulla, myös julkisilla sivuilla.
- Takaisin-painike yrittää ensin palata edelliseen näkymään ja käyttää varareittiä, jos selaushistoriaa ei ole (adminissa `/admin`, muilla sivuilla `/`).
- Ylläpidon navigaatiota selkeytettiin: Admin Home, Käyttäjät, Koirat ja Asetukset on ryhmitelty samaan sivupalkkiin.
- Ylläpidon Käyttäjät-sivu hakee nyt käyttäjät oikeasta palvelindatasta aiemman mock-listan sijaan.
- Ylläpidon Käyttäjät-sivulle lisättiin toimiva "Luo käyttäjä" -lomake testikäyttäjien nopeaan luontiin.

### Fixed

- Auth-päätepisteiden CORS-otsakkeet ja OPTIONS-preflight-vastaukset yhdenmukaistettiin, jotta selain ei estä kirjautumispyyntöjä eri alkuperien välillä.
- Auth-reittien testit päivitettiin kattamaan CORS- ja preflight-käytös sekä estämään ympäristömuuttujien vuotaminen testien välillä.
- Korjattiin kirjautumissivun hydration-virhe, joka saattoi näkyä takaisin-navigoinnin jälkeen.

### Removed

- Vanhat API-clientin auth-wrapperit (`login`, `logout`, `me`, `register`) sekä aiempi auth-service poistettiin käytöstä.

## [0.1.2] - 2026-02-18

### Added

- Beaglehaun sivutukseen lisättiin valittava tulosmäärä per sivu (10, 25, 50, 100) sekä URL-osoitteeseen tallentuva `pageSize`-parametri.

### Changed

- Hakutulosten sivutus uudistettiin: käytössä on nyt numeropohjainen sivunavigaatio (`1 ... 14 15 16 ... N`) aiemman pelkän edellinen/seuraava-rakenteen sijaan.
- Sivutusnäkymä näyttää nyt myös selkeän "tuloksia / sivu" -valinnan sekä mobiilissa että desktopissa.
- Hakutulosten sarake- ja otsikot täsmennettiin suomeksi ja ruotsiksi (esim. EK-numero, sukupuoli, kokeet/näyttelyt ja sukupuoliarvot) luettavuuden parantamiseksi.

### Fixed

- Hakutuloksiin lisättiin uusi "Kopioi sivun tulokset" -painike, jonka toiminto kopioi näkyvän tulossivun koirarivit leikepöydälle taulukkomuodossa.
- Varmistettiin, että hakutulosten kopiointi toimii käytännössä: koirarivejä voi maalata hausta ja liittää onnistuneesti esimerkiksi Google Docsiin.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.

## [0.1.1] - 2026-02-16

### Added

- Beaglehaun lisäsuodattimiin lisättiin syntymävuosiväli (`alkaen` ja `asti`).
- Beaglehaun lisäsuodattimiin lisättiin asetus "vain EK-koirat".

### Changed

- Uudet lisäsuodattimet tallentuvat URL-osoitteeseen ja palautuvat sivun uudelleenlatauksessa.
- Beaglehaun lisäsuodattimien käyttöliittymä siistittiin ja yhdenmukaistettiin (otsikko, kenttäasettelu ja tilat), ja samaa rakennetta voidaan jatkossa käyttää myös ylläpidon hakunäkymissä.
- Beaglehaun lajitteluun lisättiin EK-numerojärjestys (pienin ensin), jossa EK-numeroa vailla olevat koirat näytetään listan lopussa.

### Fixed

- Yläpalkin painikkeita tiivistettiin, jotta kielivalinta (🇸🇪/🇫🇮) mahtuu myös pienille näytöille ilman vaakasuuntaista ylivuotoa.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.

## [0.1.0] - 2026-02-16

### Added

- Palvelussa on nyt selkeä etusivu ja sivupalkki.
- Beaglehaun ensimmäinen versio on julkaistu. Haku toimii EK-numerolla, rekisterinumerolla ja nimellä.
- Lisäsuodattimista käytössä ovat sukupuoli ja asetus "vain koirat, joilla on useita rekisterinumeroita".
- Hakutuloksissa näkyvät sekä mobiili- että desktop-näkymässä samat perustiedot: rekisterinumero, EK-numero, sukupuoli, nimi, koemäärä ja näyttelymäärä.
- Hakutuloksissa näytetään myös muut rekisterinumerot, jos koiralla on niitä useita.
- Beaglehaussa näkyy myös Viimeisimmät lisäykset -lista (uusimmat koirat).
- Kielen vaihto suomi/ruotsi on käytössä.
- Julkinen "Mitä uutta" -sivu ja sen linkki yläpalkissa on lisätty.

### Changed

- Etusivun rakennetta päivitettiin selkeämmäksi.
- Navigaatio koottiin yhtenäiseksi sivupalkkinäkymäksi.
- Viimeisimmät lisäykset -listassa vanhojen beaglejen järjestys voi vaihdella, jos lisäysaika on sama.

### Fixed

- Ei käyttäjälle näkyviä korjauksia tässä julkaisussa.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.
